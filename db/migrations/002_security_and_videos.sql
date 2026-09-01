CREATE TABLE public_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  youtube_url text,
  thumbnail_url text,
  published_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,slug)
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE login_attempts (
  id bigserial PRIMARY KEY,
  email text NOT NULL,
  ip_hash text,
  successful boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_profile ON sessions(profile_id,expires_at);
CREATE INDEX idx_sessions_active ON sessions(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_public_videos_org ON public_videos(organization_id,published_at DESC);
CREATE INDEX idx_login_attempts_email ON login_attempts(email,created_at DESC);

ALTER TABLE public_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
