import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { labels } from '@/lib/labels';
import StatusUpdater from './StatusUpdater';
import TrackingLinkActions from '@/components/TrackingLinkActions';

const statuses=['confirmed','preparing','rider_assigned','picked_up','out_for_delivery','delivered'];
export default async function OrderDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return <div className="container" style={{paddingTop:40}}>Please log in.</div>;
 const {data:order}=await supabase.from('orders').select('id,order_number,tracking_token,product_name,quantity,order_value,status,rider_name,rider_phone,notes,created_at,updated_at,customers(name,phone,address)').eq('id',id).maybeSingle();
 if(!order)return <div className="container" style={{paddingTop:40}}><Link href="/dashboard/orders">← Back to orders</Link><h1>Order not found</h1></div>;
 const customer=(order.customers as any)?.name||'—'; const cphone=(order.customers as any)?.phone||'—'; const address=(order.customers as any)?.address||'—'; const step=Math.max(0,statuses.indexOf(order.status)); const track=`/track/${order.tracking_token}`;
 return <div className="container" style={{maxWidth:950,paddingTop:34,paddingBottom:50}}><Link href="/dashboard/orders" className="subtle">← Back to orders</Link><div style={{display:'flex',justifyContent:'space-between',gap:15,alignItems:'flex-end',margin:'20px 0 25px'}}><div><h1 className="page-title">{order.order_number}</h1><p className="subtle">{customer} · {new Date(order.created_at).toLocaleString()}</p></div><TrackingLinkActions path={track} phone={cphone==='—'?'':cphone} customer={customer}/></div>
 <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}><div className="card" style={{padding:24}}><h3 style={{marginTop:0}}>Delivery timeline</h3><div style={{marginTop:24}}>{statuses.map((s,i)=>{const done=i<=step;return <div key={s} style={{display:'flex',gap:14,minHeight:58}}><div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>{done?<CheckCircle2 size={20}/>:<Circle size={20}/>} {i<statuses.length-1&&<div style={{width:1,flex:1,background:i<step?'#2563eb':'#e4e7ec',margin:'3px 0'}}/>}</div><div><strong>{labels[s]}</strong><div className="subtle" style={{marginTop:4}}>{done?'Completed':'Waiting for update'}</div></div></div>})}</div></div><div style={{display:'grid',gap:16}}><StatusUpdater orderId={order.id} currentStatus={order.status}/><div className="card" style={{padding:22}}><h3 style={{marginTop:0}}>Customer</h3><strong>{customer}</strong><p className="subtle">{cphone}</p><p className="subtle">{address}</p></div><div className="card" style={{padding:22}}><h3 style={{marginTop:0}}>Tracking link</h3><p className="subtle" style={{marginTop:0}}>Copy this link and send it to the customer anytime.</p><TrackingLinkActions path={track} phone={cphone==='—'?'':cphone} customer={customer}/></div></div></div></div>
}
