import type { Pool } from "pg";

import type { AnalyticsEventBody, AnalyticsEventStore } from "./analytics-schema.js";

export class InMemoryAnalyticsEventStore implements AnalyticsEventStore {
  private readonly keys = new Set<string>();

  async record(input: {
    tenantId: string;
    clientEventId: string;
    body: AnalyticsEventBody;
  }): Promise<{ duplicate: boolean }> {
    const key = `${input.tenantId}:${input.clientEventId}`;
    if (this.keys.has(key)) {
      return { duplicate: true };
    }
    this.keys.add(key);
    return { duplicate: false };
  }
}

export class PgAnalyticsEventStore implements AnalyticsEventStore {
  constructor(private readonly pool: Pool) {}

  async record(input: {
    tenantId: string;
    clientEventId: string;
    body: AnalyticsEventBody;
  }): Promise<{ duplicate: boolean }> {
    const idempotencyKey = `${input.tenantId}:${input.clientEventId}`;
    const ins = await this.pool.query(
      `INSERT INTO analytics_events (idempotency_key, tenant_id, body, received_at)
       VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [idempotencyKey, input.tenantId, JSON.stringify(input.body)],
    );
    return { duplicate: ins.rowCount === 0 };
  }
}
