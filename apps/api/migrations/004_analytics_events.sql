CREATE TABLE IF NOT EXISTS analytics_events (
  idempotency_key TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  body JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_received ON analytics_events (tenant_id, received_at DESC);
