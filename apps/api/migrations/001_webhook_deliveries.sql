CREATE TABLE IF NOT EXISTS webhook_deliveries (
  idempotency_key TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  raw_body TEXT NOT NULL,
  body_json JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_tenant_received
  ON webhook_deliveries (tenant_id, received_at DESC);
