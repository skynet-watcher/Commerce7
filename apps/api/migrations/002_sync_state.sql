CREATE TABLE IF NOT EXISTS sync_state (
  tenant_id TEXT NOT NULL,
  resource TEXT NOT NULL,
  cursor TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, resource)
);

CREATE INDEX IF NOT EXISTS idx_sync_state_updated ON sync_state (updated_at DESC);
