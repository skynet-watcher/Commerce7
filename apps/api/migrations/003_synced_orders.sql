CREATE TABLE IF NOT EXISTS synced_orders (
  tenant_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (tenant_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_synced_orders_tenant_updated ON synced_orders (tenant_id, updated_at DESC);
