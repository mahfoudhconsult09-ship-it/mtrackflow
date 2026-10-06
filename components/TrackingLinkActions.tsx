'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ExternalLink, MessageCircle } from 'lucide-react';

export default function TrackingLinkActions({ path, phone, customer }: { path: string; phone?: string; customer?: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${origin || ''}${fullPath}`;

  function ensureOrigin() {
    if (typeof window !== 'undefined') {
      const next = window.location.origin;
      setOrigin(next);
      return `${next}${fullPath}`;
    }
    return fullPath;
  }

  async function copy() {
    const url = ensureOrigin();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  const whatsapp = `https://wa.me/${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${customer || ''}, here is your order tracking link: ${typeof window !== 'undefined' ? window.location.origin : ''}${fullPath}`)}`;

  return <div style={{display:'grid',gap:10}}>
    <div className="tracking-url-box" style={{display:'flex',alignItems:'center',gap:10,border:'1px solid var(--line)',borderRadius:10,padding:'10px 12px',background:'#f8fafc'}}>
      <span style={{flex:1,wordBreak:'break-all',fontSize:13,color:'var(--text)'}}>{fullUrl}</span>
      <button type="button" className="btn btn-secondary" onClick={copy} style={{flexShrink:0,padding:'9px 12px'}}>{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? 'Copied!' : 'Copy link'}</button>
    </div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <Link href={fullPath} target="_blank" className="btn btn-secondary">Open tracking <ExternalLink size={15}/></Link>
      {phone && <a className="btn btn-primary" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={15}/> Share on WhatsApp</a>}
    </div>
  </div>;
}
