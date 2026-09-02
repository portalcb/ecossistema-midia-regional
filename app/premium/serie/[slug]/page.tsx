import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import { canAccessPremiumContent, subscriberForProfile } from '@/lib/premium';

export const dynamic='force-dynamic';

export default async function Page({params}:{params:Promise<{slug:string}>}){
  const user=await requireSession();
  const {slug}=await params;
  const rows=await sql`select id,title,description,premium from streaming_series where organization_id=${user.organizationId} and slug=${slug} and status='published' limit 1`;
  if(!rows.length)notFound();
  const series=rows[0];
  const seriesId=String(series.id);
  const subscriber=await subscriberForProfile(user);
  const subscriberId=subscriber?String(subscriber.id):null;
  const seriesAllowed=await canAccessPremiumContent(user.organizationId,subscriberId,Boolean(series.premium),{seriesId});
  if(!seriesAllowed)return <main className="container"><section className="hero-card"><span className="eyebrow">Premium</span><h1>{series.title}</h1><p>Este conteúdo exige uma assinatura ou direito de acesso premium válido.</p><Link href="/premium/catalogo">Voltar ao catálogo</Link></section></main>;
  const episodeRows=await sql`select e.id,e.title,e.slug,e.episode_number,e.description,e.duration_seconds,e.premium,se.title season,se.season_number from streaming_episodes e join streaming_seasons se on se.id=e.season_id and se.organization_id=e.organization_id where e.organization_id=${user.organizationId} and se.series_id=${seriesId} and e.status='published' and se.status='published' order by se.season_number,e.episode_number`;
  const episodes=await Promise.all(episodeRows.map(async(episode:any)=>({...episode,canAccess:await canAccessPremiumContent(user.organizationId,subscriberId,Boolean(series.premium||episode.premium),{seriesId,episodeId:String(episode.id)})})));
  return <main className="container"><section className="hero-card"><span className="eyebrow">Streaming Premium</span><h1>{series.title}</h1><p>{series.description}</p></section><section><h2>Episódios</h2><div className="grid">{episodes.length===0?<p>Nenhum episódio publicado.</p>:episodes.map((episode:any)=><article className="card" key={episode.id}><span className="eyebrow">Temporada {episode.season_number} · Episódio {episode.episode_number}</span><h3>{episode.title}</h3><p>{episode.description||''}</p>{episode.canAccess?<small>{episode.duration_seconds?`${Math.ceil(Number(episode.duration_seconds)/60)} min`:'Duração não informada'} · player aguardando provedor seguro</small>:<strong>Episódio bloqueado</strong>}</article>)}</div></section></main>;
}
