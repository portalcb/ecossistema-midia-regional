'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function AdminSearch({items}:{items:{href:string;label:string;group:string}[]}){
  const [query,setQuery]=useState('');
  const results=useMemo(()=>{const term=query.trim().toLocaleLowerCase('pt-BR');if(!term)return [];return items.filter(item=>`${item.label} ${item.group}`.toLocaleLowerCase('pt-BR').includes(term)).slice(0,7)},[items,query]);
  return <div className="admin-search-box">
    <label className="admin-search"><svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input value={query} onChange={event=>setQuery(event.target.value)} aria-label="Buscar no painel" placeholder="Buscar módulos, pessoas, conteúdos…" autoComplete="off"/></label>
    {query&&<div className="admin-search-results">{results.length?results.map(item=><Link href={item.href} key={item.href} onClick={()=>setQuery('')}><span>{item.label}</span><small>{item.group}</small></Link>):<p>Nenhum módulo encontrado.</p>}</div>}
  </div>;
}
