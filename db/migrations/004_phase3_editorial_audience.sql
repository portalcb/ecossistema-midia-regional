CREATE TABLE editorial_tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 article_id uuid REFERENCES articles(id) ON DELETE SET NULL,
 title text NOT NULL,
 description text,
 stage text NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea','draft','review','approved','scheduled','published','archived')),
 priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
 assignee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
 due_at timestamptz,
 position integer NOT NULL DEFAULT 0,
 created_by uuid REFERENCES profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz
);
CREATE INDEX idx_editorial_tasks_org_stage ON editorial_tasks(organization_id,stage,position);
CREATE INDEX idx_editorial_tasks_due ON editorial_tasks(organization_id,due_at) WHERE deleted_at IS NULL;

CREATE TABLE editorial_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 article_id uuid REFERENCES articles(id) ON DELETE SET NULL,
 task_id uuid REFERENCES editorial_tasks(id) ON DELETE SET NULL,
 title text NOT NULL,
 event_type text NOT NULL DEFAULT 'deadline' CHECK (event_type IN ('deadline','publication','recording','interview','event','other')),
 starts_at timestamptz NOT NULL,
 ends_at timestamptz,
 location text,
 notes text,
 created_by uuid REFERENCES profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_editorial_events_org_start ON editorial_events(organization_id,starts_at);

CREATE TABLE youtube_channels (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 channel_id text,
 channel_title text,
 channel_url text,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','connected','disabled','error')),
 last_synced_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id)
);

CREATE TABLE public_videos_phase3 (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 youtube_channel_id uuid REFERENCES youtube_channels(id) ON DELETE SET NULL,
 youtube_video_id text NOT NULL,
 title text NOT NULL,
 description text,
 thumbnail_url text,
 published_at timestamptz,
 duration_seconds integer,
 transcript text,
 import_status text NOT NULL DEFAULT 'draft' CHECK (import_status IN ('draft','review','imported','ignored','error')),
 article_id uuid REFERENCES articles(id) ON DELETE SET NULL,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,youtube_video_id)
);
CREATE INDEX idx_public_videos_phase3_org_date ON public_videos_phase3(organization_id,published_at DESC);

CREATE TABLE newsletter_subscribers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 email text NOT NULL,
 name text,
 status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','unsubscribed','bounced','blocked')),
 consent_at timestamptz,
 consent_source text,
 unsubscribe_token_hash text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,email)
);
CREATE INDEX idx_newsletter_subscribers_org_status ON newsletter_subscribers(organization_id,status);

CREATE TABLE newsletter_campaigns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 name text NOT NULL,
 subject text NOT NULL,
 content_html text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','scheduled','sending','sent','cancelled')),
 scheduled_at timestamptz,
 sent_at timestamptz,
 created_by uuid REFERENCES profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_newsletter_campaigns_org_status ON newsletter_campaigns(organization_id,status,created_at DESC);

CREATE TABLE automation_rules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 name text NOT NULL,
 trigger_type text NOT NULL,
 action_type text NOT NULL,
 configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
 active boolean NOT NULL DEFAULT false,
 requires_human_approval boolean NOT NULL DEFAULT true,
 created_by uuid REFERENCES profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_automation_rules_org_active ON automation_rules(organization_id,active);

CREATE TABLE audience_daily_metrics (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 metric_date date NOT NULL,
 pageviews bigint NOT NULL DEFAULT 0,
 unique_visitors bigint NOT NULL DEFAULT 0,
 video_views bigint NOT NULL DEFAULT 0,
 newsletter_subscribers bigint NOT NULL DEFAULT 0,
 newsletter_opens bigint NOT NULL DEFAULT 0,
 newsletter_clicks bigint NOT NULL DEFAULT 0,
 source text NOT NULL DEFAULT 'internal',
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,metric_date,source)
);
CREATE INDEX idx_audience_metrics_org_date ON audience_daily_metrics(organization_id,metric_date DESC);

ALTER TABLE editorial_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_videos_phase3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_daily_metrics ENABLE ROW LEVEL SECURITY;
