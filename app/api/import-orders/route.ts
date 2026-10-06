import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function POST(req:Request){
 try{
  const {rows=[]}=await req.json(); if(!Array.isArray(rows)||rows.length===0) return NextResponse.json({error:'No valid rows to import.'},{status:400});
  if(rows.length>1000) return NextResponse.json({error:'A single import can contain at most 1,000 rows.'},{status:400});
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) return NextResponse.json({error:'Please log in first.'},{status:401});
  let {data:business}=await supabase.from('businesses').select('id').eq('owner_id',user.id).limit(1).maybeSingle();
  if(!business){const {data:b,error}=await supabase.from('businesses').insert({owner_id:user.id,name:'My Business'}).select('id').single(); if(error) throw error; business=b;}
  let imported=0;
  for(let i=0;i<rows.length;i++){
   const r=rows[i];
   let customer:any=null;
   if(r.phone) customer=(await supabase.from('customers').select('id').eq('business_id',business.id).eq('phone',r.phone).limit(1).maybeSingle()).data;
   if(!customer) customer=(await supabase.from('customers').select('id').eq('business_id',business.id).eq('name',r.customer_name).limit(1).maybeSingle()).data;
   if(!customer){const x=await supabase.from('customers').insert({business_id:business.id,name:r.customer_name,phone:r.phone||null,address:r.address||null}).select('id').single(); if(x.error) throw x.error; customer=x.data;}
   else if(r.address||r.phone){await supabase.from('customers').update({phone:r.phone||undefined,address:r.address||undefined}).eq('id',customer.id);}
   const orderNumber=`TF${Date.now().toString().slice(-7)}${String(i+1).padStart(2,'0')}`;
   const x=await supabase.from('orders').insert({business_id:business.id,customer_id:customer.id,order_number:orderNumber,product_name:r.product_name,quantity:Number(r.quantity||1),order_value:r.order_value?Number(String(r.order_value).replace(/[^0-9.-]/g,'')):null,delivery_partner:r.delivery_partner||null,rider_name:r.rider_name||null,rider_phone:r.rider_phone||null,notes:r.notes||null,status:'confirmed'}).select('id').single();
   if(x.error) throw x.error; await supabase.from('order_status_history').insert({order_id:x.data.id,status:'confirmed',note:'Imported'}); imported++;
  }
  return NextResponse.json({imported});
 }catch(e:any){return NextResponse.json({error:e?.message||'Import failed.'},{status:500});}
}
