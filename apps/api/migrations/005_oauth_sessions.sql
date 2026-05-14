CREATE TABLE IF NOT EXISTS oauth_sessions (
  tenant_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'commerce7',
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  last_code TEXT,
  last_error TEXT,
  raw JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
