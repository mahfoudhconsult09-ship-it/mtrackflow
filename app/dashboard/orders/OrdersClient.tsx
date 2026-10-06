'use client';
import Link from 'next/link';
import {Search,Plus,Upload as UploadIcon} from 'lucide-react';
import {useMemo,useState} from 'react';
import {labels} from '@/lib/labels';

const filters=[
 {label:'All',statuses:null},
 {label:'New',statuses:['confirmed']},
 {label:'Preparing',statuses:['preparing']},
 {label:'Out for delivery',statuses:['out_for_delivery']},
 {label:'Delivered',statuses:['delivered']},
 {label:'Failed',statuses:['failed_delivery','returned']}
] as const;

export default function OrdersClient({initialOrders=[]}:{initialOrders?:any[]}){
 const [query,setQuery]=useState('');
 const [active,setActive]=useState('All');
 const list=initialOrders.map((o:any)=>({...o,customer:o.customers?.name||'—'}));
 const filtered=useMemo(()=>{
  const f=filters.find(x=>x.label===active);
  const q=query.trim().toLowerCase();
  return list.filter((o:any)=>{
   const matchesStatus=!f?.statuses||f.statuses.includes(o.status as never);
   const hay=[o.order_number,o.customer,o.product_name].filter(Boolean).join(' ').toLowerCase();
   return matchesStatus&&(!q||hay.includes(q));
  });
 },[list,active,query]);
 return <div className="container" style={{paddingTop:34,paddingBottom:50}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:22}}><div><h1 className="page-title">Orders</h1><p className="subtle">Manage every order from confirmation to delivery.</p></div><div style={{display:'flex',gap:8}}><Link href="/dashboard/orders/import" className="btn btn-secondary"><UploadIcon/> Import orders</Link><Link href="/dashboard/orders/new" className="btn btn-primary"><Plus size={16}/> New order</Link></div></div>
  <div className="card" style={{padding:14,marginBottom:14,display:'flex',gap:8,flexWrap:'wrap'}}><div style={{position:'relative',flex:'1 1 260px'}}><Search size={17} style={{position:'absolute',left:12,top:12,color:'#98a2b3'}}/><input value={query} onChange={e=>setQuery(e.target.value)} className="input" style={{paddingLeft:38}} placeholder="Search order or customer"/></div>{filters.map(f=><button key={f.label} type="button" onClick={()=>setActive(f.label)} className={active===f.label?'btn btn-primary':'btn btn-secondary'} style={{fontSize:13}}>{f.label}</button>)}</div>
  <div className="card" style={{overflow:'hidden'}}><div className="table-wrap"><table className="app-table"><thead><tr>{['Order','Customer','Product','Value','Status','Updated',''].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{filtered.map((o:any)=><tr key={o.id}><td style={{fontWeight:700}}>{o.order_number}</td><td>{o.customer}</td><td>{o.product_name}</td><td>{o.order_value==null?'—':`₦${Number(o.order_value).toLocaleString()}`}</td><td><span className={`badge ${o.status==='delivered'?'badge-green':o.status==='out_for_delivery'?'badge-blue':o.status==='failed_delivery'||o.status==='returned'?'badge-red':'badge-orange'}`}>{labels[o.status]||o.status}</span></td><td className="subtle">{new Date(o.updated_at).toLocaleString()}</td><td><Link href={`/dashboard/orders/${o.id}`} style={{color:'#2563eb',fontWeight:600}}>View</Link></td></tr>)}{filtered.length===0&&<tr><td colSpan={7} style={{padding:35,textAlign:'center'}} className="subtle">No orders match this filter.</td></tr>}</tbody></table></div></div>
 </div>;
}
