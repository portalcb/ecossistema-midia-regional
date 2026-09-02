'use server';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import { canAccessPremiumContent, subscriberForProfile } from '@/lib/premium';

async function context(){
  const user=await requireSession();
  const subscriber=await subscriberForProfile(user);
  if(!subscriber)throw new Error('Assinante não vinculado');
  return {user,subscriberId:String(subscriber.id)};
}

export async function toggleFavorite(formData:FormData){
  const {user,subscriberId}=await context();
  const seriesId=String(formData.get('series_id')||'');
  if(!seriesId)throw new Error('Série obrigatória');
  const rows=await sql`select id,premium from streaming_series where id=${seriesId} and organization_id=${user.organizationId} and status='published' limit 1`;
  const series=rows[0];
  if(!series||!await canAccessPremiumContent(user.organizationId,subscriberId,Boolean(series.premium),{seriesId}))throw new Error('Acesso não autorizado');
  const existing=await sql`select id from streaming_favorites where organization_id=${user.organizationId} and subscriber_id=${subscriberId} and series_id=${seriesId}`;
  if(existing.length)await sql`delete from streaming_favorites where id=${existing[0].id} and organization_id=${user.organizationId} and subscriber_id=${subscriberId}`;
  else await sql`insert into streaming_favorites(organization_id,subscriber_id,series_id) values(${user.organizationId},${subscriberId},${seriesId})`;
  revalidatePath('/premium/catalogo');
}

export async function saveProgress(formData:FormData){
  const {user,subscriberId}=await context();
  const episodeId=String(formData.get('episode_id')||'');
  const requested=Math.floor(Number(formData.get('position_seconds')||0));
  if(!episodeId||!Number.isFinite(requested)||requested<0)throw new Error('Progresso inválido');
  const rows=await sql`select e.id,e.duration_seconds,e.premium episode_premium,s.series_id,sr.premium series_premium from streaming_episodes e join streaming_seasons s on s.id=e.season_id and s.organization_id=e.organization_id join streaming_series sr on sr.id=s.series_id and sr.organization_id=e.organization_id where e.id=${episodeId} and e.organization_id=${user.organizationId} and e.status='published' and s.status='published' and sr.status='published' limit 1`;
  const episode=rows[0];
  if(!episode)throw new Error('Episódio inválido');
  const premium=Boolean(episode.episode_premium||episode.series_premium);
  const seriesId=String(episode.series_id);
  if(!await canAccessPremiumContent(user.organizationId,subscriberId,premium,{seriesId,episodeId}))throw new Error('Acesso não autorizado');
  const duration=Math.max(0,Number(episode.duration_seconds||0));
  const position=Math.min(requested,duration||86400,86400);
  const completed=duration>0&&position>=Math.max(0,duration-15);
  await sql`insert into streaming_watch_history(organization_id,subscriber_id,episode_id,progress_seconds,completed,last_watched_at) values(${user.organizationId},${subscriberId},${episodeId},${position},${completed},now()) on conflict(subscriber_id,episode_id) do update set progress_seconds=excluded.progress_seconds,completed=excluded.completed,last_watched_at=now(),updated_at=now()`;
  await sql`insert into streaming_events(organization_id,subscriber_id,episode_id,event_type,position_seconds) values(${user.organizationId},${subscriberId},${episodeId},${completed?'complete':'progress'},${position})`;
  revalidatePath('/premium/catalogo');
}
