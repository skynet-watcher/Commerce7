import type { Pool } from "pg";

import type { RecordWebhookInput, RecordWebhookResult, WebhookDeliveryStore } from "./store.js";

export class PgWebhookDeliveryStore implements WebhookDeliveryStore {
  constructor(private readonly pool: Pool) {}

  async recordDelivery(input: RecordWebhookInput): Promise<RecordWebhookResult> {
    const client = await this.pool.connect();
    try {
      const inserted = await client.query<{ received_at: Date }>(
        `INSERT INTO webhook_deliveries (idempotency_key, tenant_id, raw_body, body_json, received_at)
         VALUES ($1, $2, $3, $4::jsonb, now())
         ON CONFLICT (idempotency_key) DO NOTHING
         RETURNING received_at`,
        [input.idempotencyKey, input.tenantId, input.rawBody, JSON.stringify(input.body)],
      );

      if (inserted.rowCount === 1 && inserted.rows[0]) {
        return {
          duplicate: false,
          receivedAt: inserted.rows[0].received_at.toISOString(),
        };
      }

      const existing = await client.query<{ received_at: Date }>(
        `SELECT received_at FROM webhook_deliveries WHERE idempotency_key = $1`,
        [input.idempotencyKey],
      );
      const row = existing.rows[0];
      if (!row) {
        throw new Error("webhook_deliveries: missing row after insert conflict");
      }
      return {
        duplicate: true,
        receivedAt: row.received_at.toISOString(),
      };
    } finally {
      client.release();
    }
  }
}
