-- Multi-tenant RLS foundation. Authenticated application transactions set
-- app.organization_id, app.profile_id and app.role before every query.
create or replace function app_current_organization_id() returns uuid language sql stable as $$
  select nullif(current_setting('app.organization_id',true),'')::uuid
$$;
create or replace function app_current_profile_id() returns uuid language sql stable as $$
  select nullif(current_setting('app.profile_id',true),'')::uuid
$$;
create or replace function app_current_role() returns text language sql stable as $$
  select nullif(current_setting('app.role',true),'')
$$;

-- Supabase may no longer expose newly created tables automatically. Grant the
-- runtime role table access explicitly; RLS below remains the authorization layer.
grant usage on schema public to authenticated;
grant select,insert,update,delete on all tables in schema public to authenticated;
grant usage,select on all sequences in schema public to authenticated;
alter default privileges in schema public grant select,insert,update,delete on tables to authenticated;
alter default privileges in schema public grant usage,select on sequences to authenticated;

do $$
declare
  t text;
  tenant_tables text[]:=array[
    'profiles','roles','brand_settings','authors','categories','municipalities',
    'articles','media','home_blocks','leads','audit_log','public_videos',
    'editorial_tasks','editorial_events','youtube_channels','public_videos_phase3',
    'newsletter_subscribers','newsletter_campaigns','automation_rules',
    'audience_daily_metrics','crm_companies','crm_contacts','crm_opportunities',
    'sponsors','ad_campaigns','commercial_projects','proposals','contracts',
    'subscription_plans','subscribers','coupons','subscriptions','checkout_orders',
    'financial_entries','commissions','streaming_series','streaming_seasons',
    'streaming_episodes','streaming_entitlements','streaming_watch_history',
    'streaming_favorites','streaming_events'
  ];
begin
  foreach t in array tenant_tables loop
    execute format('alter table %I enable row level security',t);
    execute format('drop policy if exists tenant_isolation on %I',t);
    execute format(
      'create policy tenant_isolation on %I for all to authenticated using (organization_id=app_current_organization_id()) with check (organization_id=app_current_organization_id())',
      t
    );
  end loop;
end $$;

alter table organizations enable row level security;
drop policy if exists tenant_isolation on organizations;
create policy tenant_isolation on organizations for all to authenticated
  using(id=app_current_organization_id())
  with check(id=app_current_organization_id());

alter table sessions enable row level security;
drop policy if exists tenant_isolation on sessions;
create policy tenant_isolation on sessions for all to authenticated
  using(organization_id=app_current_organization_id() and profile_id=app_current_profile_id())
  with check(organization_id=app_current_organization_id() and profile_id=app_current_profile_id());

-- Child tables derive their tenant through a parent and do not have organization_id.
alter table article_versions enable row level security;
drop policy if exists tenant_isolation on article_versions;
create policy tenant_isolation on article_versions for all to authenticated
  using(exists(select 1 from articles a where a.id=article_versions.article_id and a.organization_id=app_current_organization_id()))
  with check(exists(select 1 from articles a where a.id=article_versions.article_id and a.organization_id=app_current_organization_id()));

alter table lead_history enable row level security;
drop policy if exists tenant_isolation on lead_history;
create policy tenant_isolation on lead_history for all to authenticated
  using(exists(select 1 from leads l where l.id=lead_history.lead_id and l.organization_id=app_current_organization_id()))
  with check(exists(select 1 from leads l where l.id=lead_history.lead_id and l.organization_id=app_current_organization_id()));

alter table user_roles enable row level security;
drop policy if exists tenant_isolation on user_roles;
create policy tenant_isolation on user_roles for all to authenticated
  using(exists(select 1 from profiles p where p.id=user_roles.profile_id and p.organization_id=app_current_organization_id()))
  with check(exists(select 1 from profiles p where p.id=user_roles.profile_id and p.organization_id=app_current_organization_id()));

alter table role_permissions enable row level security;
drop policy if exists tenant_isolation on role_permissions;
create policy tenant_isolation on role_permissions for all to authenticated
  using(exists(select 1 from roles r where r.id=role_permissions.role_id and r.organization_id=app_current_organization_id()))
  with check(exists(select 1 from roles r where r.id=role_permissions.role_id and r.organization_id=app_current_organization_id()));

-- Global/security tables are server-only. No permissive policy is created.
alter table permissions enable row level security;
alter table login_attempts enable row level security;
alter table password_setup_tokens enable row level security;
alter table payment_webhook_events enable row level security;
revoke all on table permissions,login_attempts,password_setup_tokens,payment_webhook_events from anon,authenticated;
