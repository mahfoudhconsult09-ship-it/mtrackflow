create extension if not exists pgcrypto;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, email text, created_at timestamptz not null default now());
create table if not exists public.businesses (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade, name text not null, logo_url text, whatsapp_number text, brand_color text not null default '#2563eb', created_at timestamptz not null default now());
create table if not exists public.customers (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, name text not null, phone text, address text, created_at timestamptz not null default now());
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, customer_id uuid not null references public.customers(id) on delete restrict, order_number text not null, tracking_token text not null unique default encode(gen_random_bytes(9), 'hex'), product_name text not null, quantity integer not null default 1 check (quantity > 0), order_value numeric(12,2), delivery_partner text, rider_name text, rider_phone text, status text not null default 'confirmed' check (status in ('confirmed','preparing','rider_assigned','picked_up','out_for_delivery','delivered','failed_delivery','returned','cancelled')), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (business_id, order_number));
create table if not exists public.order_status_history (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, status text not null, note text, created_at timestamptz not null default now());
create table if not exists public.public_tracking (tracking_token text primary key, order_number text not null, product_name text not null, status text not null, rider_name text, updated_at timestamptz not null default now(), business_whatsapp text);

create index if not exists orders_business_id_idx on public.orders(business_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists status_history_order_id_idx on public.order_status_history(order_id);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.public_tracking enable row level security;

drop policy if exists "profiles own row" on public.profiles;
create policy "profiles own row" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "business owner access" on public.businesses;
create policy "business owner access" on public.businesses for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "customers business owner access" on public.customers;
create policy "customers business owner access" on public.customers for all to authenticated using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid()))) with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
drop policy if exists "orders business owner access" on public.orders;
create policy "orders business owner access" on public.orders for all to authenticated using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid()))) with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
drop policy if exists "history business owner access" on public.order_status_history;
create policy "history business owner access" on public.order_status_history for all to authenticated using (exists (select 1 from public.orders o join public.businesses b on b.id = o.business_id where o.id = order_id and b.owner_id = (select auth.uid()))) with check (exists (select 1 from public.orders o join public.businesses b on b.id = o.business_id where o.id = order_id and b.owner_id = (select auth.uid())));
drop policy if exists "public tracking read" on public.public_tracking;
create policy "public tracking read" on public.public_tracking for select to anon, authenticated using (true);

create or replace function public.sync_public_tracking() returns trigger language plpgsql security invoker set search_path = public, pg_catalog as $$
begin
  insert into public.public_tracking (tracking_token, order_number, product_name, status, rider_name, updated_at, business_whatsapp)
  select new.tracking_token, new.order_number, new.product_name, new.status, new.rider_name, new.updated_at, b.whatsapp_number
  from public.businesses b where b.id = new.business_id
  on conflict (tracking_token) do update set order_number=excluded.order_number, product_name=excluded.product_name, status=excluded.status, rider_name=excluded.rider_name, updated_at=excluded.updated_at, business_whatsapp=excluded.business_whatsapp;
  return new;
end;
$$;

drop trigger if exists orders_public_tracking_sync on public.orders;
create trigger orders_public_tracking_sync after insert or update on public.orders for each row execute function public.sync_public_tracking();

create or replace function public.set_order_updated_at() returns trigger language plpgsql set search_path = public, pg_catalog as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_order_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security invoker set search_path = public, pg_catalog as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Additional production indexes and synchronization for business WhatsApp changes.
create schema if not exists private;
create index if not exists customers_business_phone_idx on public.customers(business_id, phone);
create index if not exists customers_business_name_idx on public.customers(business_id, name);
create index if not exists orders_updated_at_idx on public.orders(updated_at desc);

create or replace function private.sync_business_tracking() returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  update public.public_tracking pt
  set business_whatsapp = new.whatsapp_number
  where exists (
    select 1 from public.orders o
    where o.tracking_token = pt.tracking_token
      and o.business_id = new.id
  );
  return new;
end;
$$;
revoke all on function private.sync_business_tracking() from public;
drop trigger if exists businesses_public_tracking_sync on public.businesses;
create trigger businesses_public_tracking_sync
after update of whatsapp_number on public.businesses
for each row execute function private.sync_business_tracking();
