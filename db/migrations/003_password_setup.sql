CREATE TABLE password_setup_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_password_setup_profile ON password_setup_tokens(profile_id,expires_at DESC);
ALTER TABLE password_setup_tokens ENABLE ROW LEVEL SECURITY;
