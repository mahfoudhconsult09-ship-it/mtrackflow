import Link from 'next/link';
import { LayoutDashboard, Package, Users, Settings } from 'lucide-react';
import Sidebar from './Sidebar';
const mobileLinks=[[LayoutDashboard,'Home','/dashboard'],[Package,'Orders','/dashboard/orders'],[Users,'Customers','/dashboard/customers'],[Settings,'Settings','/dashboard/settings']] as const;
export default function DashboardShell({children}:{children:React.ReactNode}){return <div style={{display:'flex',minHeight:'100vh'}}><div className="desktop-sidebar"><Sidebar/></div><main style={{flex:1,minWidth:0}}><div className="mobile-header"><strong>Track<span style={{color:'#2563eb'}}>Flow</span></strong></div>{children}</main><nav className="mobile-bottom-nav" aria-label="Mobile navigation">{mobileLinks.map(([Icon,label,href])=><Link key={href} href={href}><Icon size={19}/><span>{label}</span></Link>)}</nav></div>}
