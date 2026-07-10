-- Merchant strategies: a message (and optional Commerce7 promotion) run for a
-- fixed test window, with a baseline snapshot for honest before/after verdicts.
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  offer JSONB,
  promotion_id TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  review_at TIMESTAMPTZ NOT NULL,
  test_days INTEGER NOT NULL,
  baseline JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS strategies_tenant_started_idx
  ON strategies (tenant_id, started_at DESC);
