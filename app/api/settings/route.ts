import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function clean(value: unknown, max = 160) { return String(value ?? '').trim().slice(0, max); }

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please log in first.' }, { status: 401 });
    const { data, error } = await supabase.from('businesses').select('id,name,whatsapp_number,brand_color,logo_url').eq('owner_id', user.id).limit(1).maybeSingle();
    if (error) throw error;
    return NextResponse.json(data || { name: 'My Business', whatsapp_number: '', brand_color: '#2563eb', logo_url: '' });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Could not load settings.' }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const name = clean(body.name, 100) || 'My Business';
    const whatsapp = clean(body.whatsapp_number, 30);
    const color = clean(body.brand_color, 20) || '#2563eb';
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return NextResponse.json({ error: 'Brand color must be a valid 6-digit hex color.' }, { status: 400 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please log in first.' }, { status: 401 });
    let { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).limit(1).maybeSingle();
    if (!business) {
      const created = await supabase.from('businesses').insert({ owner_id: user.id, name, whatsapp_number: whatsapp || null, brand_color: color }).select('id').single();
      if (created.error) throw created.error;
      business = created.data;
    } else {
      const updated = await supabase.from('businesses').update({ name, whatsapp_number: whatsapp || null, brand_color: color }).eq('id', business.id).eq('owner_id', user.id).select('id,name,whatsapp_number,brand_color,logo_url').single();
      if (updated.error) throw updated.error;
      return NextResponse.json(updated.data);
    }
    return NextResponse.json({ id: business.id, name, whatsapp_number: whatsapp || null, brand_color: color, logo_url: null });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Could not save settings.' }, { status: 500 }); }
}
