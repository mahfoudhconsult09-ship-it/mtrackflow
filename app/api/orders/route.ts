import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function money(v: unknown){const s=String(v??'').replace(/[^0-9.-]/g,'');if(!s)return null;const n=Number(s);return Number.isFinite(n)&&n>=0?n:null;}
export async function POST(req:Request){
 try{
  const body=await req.json();
  const required=['customer_name','phone','address','product_name'];
  for(const key of required) if(!String(body[key]??'').trim()) return NextResponse.json({error:`${key.replace('_',' ')} is required.`},{status:400});
  const quantity=Number(body.quantity||1); if(!Number.isInteger(quantity)||quantity<1) return NextResponse.json({error:'Quantity must be a whole number greater than 0.'},{status:400});
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:'Please log in first.'},{status:401});
  let {data:business}=await supabase.from('businesses').select('id').eq('owner_id',user.id).limit(1).maybeSingle();
  if(!business){const x=await supabase.from('businesses').insert({owner_id:user.id,name:'My Business'}).select('id').single();if(x.error)throw x.error;business=x.data;}
  let {data:customer}=await supabase.from('customers').select('id').eq('business_id',business.id).eq('phone',String(body.phone).trim()).limit(1).maybeSingle();
  if(!customer){const x=await supabase.from('customers').insert({business_id:business.id,name:String(body.customer_name).trim(),phone:String(body.phone).trim(),address:String(body.address).trim()}).select('id').single();if(x.error)throw x.error;customer=x.data;}
  else {const x=await supabase.from('customers').update({name:String(body.customer_name).trim(),address:String(body.address).trim()}).eq('id',customer.id);if(x.error)throw x.error;}
  const orderNumber=`TF${Date.now().toString().slice(-8)}${Math.floor(Math.random()*90+10)}`;
  const x=await supabase.from('orders').insert({business_id:business.id,customer_id:customer.id,order_number:orderNumber,product_name:String(body.product_name).trim(),quantity,order_value:money(body.order_value),delivery_partner:String(body.delivery_partner||'').trim()||null,rider_name:String(body.rider_name||'').trim()||null,rider_phone:String(body.rider_phone||'').trim()||null,notes:String(body.notes||'').trim()||null,status:'confirmed'}).select('id,order_number,tracking_token').single();
  if(x.error)throw x.error; const h=await supabase.from('order_status_history').insert({order_id:x.data.id,status:'confirmed',note:'Order created'});if(h.error)throw h.error;
  return NextResponse.json({...x.data,customer_name:String(body.customer_name).trim(),customer_phone:String(body.phone).trim()},{status:201});
 }catch(e:any){return NextResponse.json({error:e?.message||'Could not create order.'},{status:500});}
}
