import { sql } from './db';

export async function subscriberForProfile(user:{id:string;organizationId:string}) {
  const rows=await sql`select s.id,s.name,s.email from profiles p join subscribers s on s.organization_id=p.organization_id and lower(s.email)=lower(p.email) where p.id=${user.id} and p.organization_id=${user.organizationId} and p.active=true limit 1`;
  return rows[0]||null;
}

export async function hasPremiumAccess(
  organizationId:string,
  subscriberId:string,
  scope:{seriesId?:string;episodeId?:string}={},
) {
  const seriesId=scope.seriesId||null;
  const episodeId=scope.episodeId||null;
  const rows=await sql`
    select 1
    from streaming_entitlements e
    left join subscriptions sub
      on sub.id=e.subscription_id and sub.organization_id=e.organization_id
    where e.organization_id=${organizationId}
      and e.subscriber_id=${subscriberId}
      and e.active=true
      and e.starts_at<=now()
      and (e.ends_at is null or e.ends_at>now())
      and (e.subscription_id is null or sub.status='active')
      and (
        e.scope_type='catalog'
        or (e.scope_type='series' and e.series_id=${seriesId})
        or (e.scope_type='episode' and e.episode_id=${episodeId})
        or (
          ${episodeId}::uuid is null
          and e.scope_type='episode'
          and exists(
            select 1 from streaming_episodes ep
            join streaming_seasons ss on ss.id=ep.season_id
            where ep.id=e.episode_id
              and ep.organization_id=e.organization_id
              and ss.organization_id=e.organization_id
              and ss.series_id=${seriesId}
          )
        )
      )
    limit 1`;
  return rows.length>0;
}

export async function canAccessPremiumContent(
  organizationId:string,
  subscriberId:string|null,
  premium:boolean,
  scope:{seriesId?:string;episodeId?:string}={},
) {
  if(!premium)return true;
  if(!subscriberId)return false;
  return hasPremiumAccess(organizationId,subscriberId,scope);
}
