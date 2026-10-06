'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import TrackingLinkActions from '@/components/TrackingLinkActions';

export default function NewOrder(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState<any>(null);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;setBusy(true);setError('');setDone(null);const fd=new FormData(form);const payload=Object.fromEntries(fd.entries());
  try{const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json();if(!res.ok)throw new Error(data.error||'Could not create order.');setDone(data);form.reset();}
  catch(err:any){setError(err?.message||'Could not create order.');}finally{setBusy(false)}
 }
 return <div className="container" style={{maxWidth:850,paddingTop:34,paddingBottom:50}}><Link href="/dashboard/orders" className="subtle">← Back to orders</Link><div style={{margin:'20px 0 25px'}}><h1 className="page-title">Create order</h1><p className="subtle">Create an order and instantly get a customer tracking link.</p></div>
 <form onSubmit={submit} className="card" style={{padding:24,display:'grid',gap:25}}>
  <section><h3 style={{margin:'0 0 16px'}}>Customer</h3><div className="form-grid"><div><label className="label">Customer name *</label><input name="customer_name" required className="input" placeholder="Aisha Bello"/></div><div><label className="label">Phone / WhatsApp *</label><input name="phone" required className="input" placeholder="0800 000 0000"/></div><div style={{gridColumn:'1/-1'}}><label className="label">Delivery address *</label><textarea name="address" required className="input" rows={3} placeholder="Full delivery address"/></div></div></section>
  <section><h3 style={{margin:'0 0 16px'}}>Order</h3><div className="order-grid"><div><label className="label">Product *</label><input name="product_name" required className="input" placeholder="Product name"/></div><div><label className="label">Quantity</label><input name="quantity" className="input" type="number" defaultValue="1" min="1" step="1"/></div><div><label className="label">Order value</label><input name="order_value" className="input" inputMode="decimal" placeholder="₦0"/></div></div></section>
  <section><h3 style={{margin:'0 0 16px'}}>Delivery</h3><div className="form-grid"><div><label className="label">Delivery partner</label><input name="delivery_partner" className="input" placeholder="e.g. Local Dispatch"/></div><div><label className="label">Rider name</label><input name="rider_name" className="input" placeholder="Rider name"/></div><div><label className="label">Rider phone</label><input name="rider_phone" className="input" placeholder="Phone number"/></div><div><label className="label">Notes</label><input name="notes" className="input" placeholder="Optional note"/></div></div></section>
  {error&&<div className="card" style={{padding:14,borderColor:'#fca5a5',background:'#fff7f7'}}>{error}</div>}
  {done&&<div className="card" style={{padding:18,display:'grid',gap:14,borderColor:'#bbf7d0',background:'#f7fff9'}}><div style={{display:'flex',gap:8,alignItems:'center'}}><CheckCircle2 size={18}/> <span>Order <strong>{done.order_number}</strong> created successfully.</span></div><div><div className="label" style={{marginBottom:8}}>Customer tracking link</div><TrackingLinkActions path={`/track/${done.tracking_token}`} phone={done.customer_phone || ''} customer={done.customer_name || ''}/></div><Link href="/dashboard/orders" style={{color:'#2563eb',fontSize:14}}>View all orders →</Link></div>}
  <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingTop:5}}><Link href="/dashboard/orders" className="btn btn-secondary">Cancel</Link><button className="btn btn-primary" type="submit" disabled={busy}>{busy&&<Loader2 size={16} className="spin"/>}{busy?'Creating…':'Create order'}</button></div>
 </form></div>
}
