CREATE TABLE IF NOT EXISTS app_installs (
  tenant_id TEXT PRIMARY KEY,
  installer_email TEXT,
  installer_first_name TEXT,
  installer_last_name TEXT,
  raw JSONB NOT NULL DEFAULT '{}',
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uninstalled_at TIMESTAMPTZ
);
