'use client'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Login(){
  const router=useRouter(); const supabase=createClient(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
  async function submit(e:FormEvent){e.preventDefault();setError('');setLoading(true);const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else router.push('/dashboard');setLoading(false)}
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'radial-gradient(circle at 50% 0,#eaf2ff 0,transparent 42%),#f5f7fb'}}><div style={{position:'fixed',top:24,left:24}}><Link href="/" className="subtle">← TrackFlow</Link></div><div className="card" style={{width:'100%',maxWidth:430,padding:30,boxShadow:'0 18px 50px rgba(16,24,40,.08)'}}><div style={{fontWeight:700,fontSize:20}}>Track<span style={{color:'#2563eb'}}>Flow</span></div><h1 style={{fontSize:26,margin:'34px 0 8px'}}>Welcome back</h1><p className="subtle">Log in to manage your orders.</p><form onSubmit={submit} style={{marginTop:26,display:'grid',gap:16}}><div><label className="label">Email</label><input required value={email} onChange={e=>setEmail(e.target.value)} className="input" type="email" placeholder="you@example.com"/></div><div><label className="label">Password</label><input required value={password} onChange={e=>setPassword(e.target.value)} className="input" type="password" placeholder="••••••••"/></div>{error&&<p style={{color:'#b42318',fontSize:14}}>{error}</p>}<button disabled={loading} className="btn btn-primary">{loading?'Logging in…':'Log in'}</button></form><p className="subtle" style={{textAlign:'center',marginTop:20}}>New here? <Link href="/signup" style={{color:'#2563eb',fontWeight:600}}>Create an account</Link></p></div></main>
}
