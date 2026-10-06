import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const allowed = ['confirmed','preparing','rider_assigned','picked_up','out_for_delivery','delivered','failed_delivery','returned','cancelled'] as const;
type Status = typeof allowed[number];

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const orderId = typeof body.order_id === 'string' ? body.order_id.trim() : '';
    const status = body.status as Status;
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : '';
    if (!orderId || !allowed.includes(status)) return NextResponse.json({ error: 'A valid order and status are required.' }, { status: 400 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please log in first.' }, { status: 401 });
    const { data: order, error: lookupError } = await supabase.from('orders').select('id,business_id,status').eq('id', orderId).maybeSingle();
    if (lookupError) throw lookupError;
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    const { data: business, error: businessError } = await supabase.from('businesses').select('id').eq('id', order.business_id).eq('owner_id', user.id).maybeSingle();
    if (businessError) throw businessError;
    if (!business) return NextResponse.json({ error: 'You do not have access to this order.' }, { status: 403 });
    if (order.status === status && !note) return NextResponse.json({ ok: true, unchanged: true });
    const { error: updateError } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (updateError) throw updateError;
    const { error: historyError } = await supabase.from('order_status_history').insert({ order_id: orderId, status, note: note || null });
    if (historyError) throw historyError;
    return NextResponse.json({ ok: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not update order status.' }, { status: 500 });
  }
}
