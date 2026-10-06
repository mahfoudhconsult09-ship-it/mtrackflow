'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
const statuses = [['confirmed','Confirmed'],['preparing','Preparing'],['rider_assigned','Rider assigned'],['picked_up','Picked up'],['out_for_delivery','Out for delivery'],['delivered','Delivered'],['failed_delivery','Failed delivery'],['returned','Returned'],['cancelled','Cancelled']] as const;
export default function StatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
 const [status,setStatus]=useState(currentStatus); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 async function update(){if(status===currentStatus)return;setBusy(true);setMessage('');try{const res=await fetch('/api/orders/status',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:orderId,status})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Update failed.');window.location.reload();}catch(e:any){setMessage(e.message||'Could not update status.');setStatus(currentStatus);}finally{setBusy(false);}}
 return <div className="card" style={{padding:22}}><h3 style={{marginTop:0}}>Update status</h3><select className="input" value={status} onChange={e=>setStatus(e.target.value)} disabled={busy}>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="btn btn-primary" onClick={update} disabled={busy||status===currentStatus} style={{marginTop:10,width:'100%',justifyContent:'center'}}>{busy&&<Loader2 size={15}/>} {busy?'Updating…':'Save status'}</button>{message&&<p className="subtle" style={{fontSize:13,marginBottom:0}}>{message}</p>}</div>;
}
