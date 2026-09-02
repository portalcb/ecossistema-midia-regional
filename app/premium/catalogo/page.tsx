import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import { canAccessPremiumContent, subscriberForProfile } from '@/lib/premium';
import { toggleFavorite } from './actions';

export const dynamic='force-dynamic';

export default async function Page(){
  const user=await requireSession();
  const subscriber=await subscriberForProfile(user);
  if(!subscriber)return <main className="container"><section className="hero-card"><span className="eyebrow">Área Premium</span><h1>Assinatura não vinculada</h1><p>Seu usuário ainda não está associado a um cadastro de assinante. Nenhum conteúdo premium foi liberado.</p></section></main>;
  const subscriberId=String(subscriber.id);
  const rows=await sql`select id,title,slug,description,cover_url,premium from streaming_series where organization_id=${user.organizationId} and status='published' order by created_at desc`;
  const series=await Promise.all(rows.map(async(item:any)=>({...item,canAccess:await canAccessPremiumContent(user.organizationId,subscriberId,Boolean(item.premium),{seriesId:String(item.id)})})));
  const history=await sql`select h.progress_seconds,h.completed,e.title episode,e.slug episode_slug,se.title season,s.title series,s.slug series_slug from streaming_watch_history h join streaming_episodes e on e.id=h.episode_id and e.organization_id=h.organization_id join streaming_seasons se on se.id=e.season_id and se.organization_id=h.organization_id join streaming_series s on s.id=se.series_id and s.organization_id=h.organization_id where h.organization_id=${user.organizationId} and h.subscriber_id=${subscriberId} and h.completed=false order by h.last_watched_at desc limit 8`;
  const favorites=await sql`select s.id,s.title,s.slug from streaming_favorites f join streaming_series s on s.id=f.series_id and s.organization_id=f.organization_id where f.organization_id=${user.organizationId} and f.subscriber_id=${subscriberId} order by f.created_at desc`;
  const favoriteIds=new Set(favorites.map((item:any)=>String(item.id)));
  const unlocked=series.filter((item:any)=>item.premium&&item.canAccess).length;
  return <main className="container"><section className="hero-card"><span className="eyebrow">Área Premium</span><h1>Olá, {subscriber.name}</h1><p>{unlocked?`${unlocked} conteúdo(s) premium liberado(s) para sua conta.`:'Nenhum direito de acesso premium válido está ativo no momento.'}</p></section>{history.length>0&&<section><h2>Continuar assistindo</h2><div className="grid">{history.map((item:any,index:number)=><article className="card" key={index}><strong>{item.series}</strong><p>{item.season} · {item.episode}</p><small>Progresso: {Math.floor(Number(item.progress_seconds)/60)} min</small><p><Link href={`/premium/serie/${item.series_slug}`}>Continuar</Link></p></article>)}</div></section>}<section><h2>Catálogo</h2><div className="grid">{series.length===0?<p>Nenhuma série publicada.</p>:series.map((item:any)=><article className="card" key={item.id}><span className="eyebrow">{item.premium?'Premium':'Livre'}</span><h3>{item.title}</h3><p>{item.description||'Série do catálogo.'}</p>{!item.canAccess?<strong>Conteúdo bloqueado</strong>:<><Link href={`/premium/serie/${item.slug}`}>Ver episódios</Link><form action={toggleFavorite}><input type="hidden" name="series_id" value={item.id}/><button type="submit">{favoriteIds.has(String(item.id))?'Remover da minha lista':'Adicionar à minha lista'}</button></form></>}</article>)}</div></section>{favorites.length>0&&<section><h2>Minha lista</h2><div className="grid">{favorites.map((item:any)=><article className="card" key={item.slug}><strong>{item.title}</strong><p><Link href={`/premium/serie/${item.slug}`}>Abrir série</Link></p></article>)}</div></section>}</main>;
}
