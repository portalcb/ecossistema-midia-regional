-- Multi-tenant RLS foundation. Server transactions set app.organization_id/app.profile_id/app.role.
create or replace function app_current_organization_id() returns uuid language sql stable as $$ select nullif(current_setting('app.organization_id',true),'')::uuid $$;
create or replace function app_current_profile_id() returns uuid language sql stable as $$ select nullif(current_setting('app.profile_id',true),'')::uuid $$;
create or replace function app_current_role() returns text language sql stable as $$ select nullif(current_setting('app.role',true),'') $$;

do $$ declare t text; tenant_tables text[]:=array['profiles','roles','brand_settings','authors','categories','municipalities','articles','article_versions','media','home_blocks','leads','lead_history','audit_log','sessions','public_videos','editorial_tasks','editorial_events','youtube_channels','public_videos_phase3','newsletter_subscribers','newsletter_campaigns','automation_rules','audience_daily_metrics','crm_companies','crm_contacts','crm_opportunities','sponsors','ad_campaigns','commercial_projects','proposals','contracts','subscription_plans','subscribers','coupons','subscriptions','checkout_orders','financial_entries','commissions','streaming_series','streaming_seasons','streaming_episodes','streaming_entitlements','streaming_watch_history','streaming_favorites','streaming_events']; begin foreach t in array tenant_tables loop execute format('drop policy if exists tenant_isolation on %I',t); execute format('create policy tenant_isolation on %I for all using (organization_id = app_current_organization_id()) with check (organization_id = app_current_organization_id())',t); end loop; end $$;

-- Organization itself is visible only to its tenant context.
drop policy if exists tenant_isolation on organizations;create policy tenant_isolation on organizations for all using(id=app_current_organization_id()) with check(id=app_current_organization_id());

-- Join tables are isolated through their tenant-owned parents.
drop policy if exists tenant_isolation on user_roles;create policy tenant_isolation on user_roles for all using(exists(select 1 from profiles p where p.id=user_roles.profile_id and p.organization_id=app_current_organization_id())) with check(exists(select 1 from profiles p where p.id=user_roles.profile_id and p.organization_id=app_current_organization_id()));
drop policy if exists tenant_isolation on role_permissions;create policy tenant_isolation on role_permissions for all using(exists(select 1 from roles r where r.id=role_permissions.role_id and r.organization_id=app_current_organization_id())) with check(exists(select 1 from roles r where r.id=role_permissions.role_id and r.organization_id=app_current_organization_id()));

-- Security tables without organization_id remain server-only by default (RLS + no permissive policy): login_attempts, password_setup_tokens, payment_webhook_events.
