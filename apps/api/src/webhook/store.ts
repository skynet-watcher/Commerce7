import type { Commerce7WebhookBody } from "./schema.js";

export type RecordWebhookInput = {
  idempotencyKey: string;
  tenantId: string;
  rawBody: string;
  body: Commerce7WebhookBody;
};

export type RecordWebhookResult =
  | { duplicate: false; receivedAt: string }
  | { duplicate: true; receivedAt: string };

export interface WebhookDeliveryStore {
  recordDelivery(input: RecordWebhookInput): Promise<RecordWebhookResult>;
}

/** Development / test store. Use `PgWebhookDeliveryStore` when `DATABASE_URL` is set. */
export class InMemoryWebhookDeliveryStore implements WebhookDeliveryStore {
  private readonly deliveries = new Map<
    string,
    { tenantId: string; rawBody: string; body: Commerce7WebhookBody; receivedAt: string }
  >();

  async recordDelivery(input: RecordWebhookInput): Promise<RecordWebhookResult> {
    const existing = this.deliveries.get(input.idempotencyKey);
    if (existing) {
      return { duplicate: true, receivedAt: existing.receivedAt };
    }
    const receivedAt = new Date().toISOString();
    this.deliveries.set(input.idempotencyKey, {
      tenantId: input.tenantId,
      rawBody: input.rawBody,
      body: input.body,
      receivedAt,
    });
    return { duplicate: false, receivedAt };
  }

  /** Test helper: inspect stored payloads for a tenant. */
  size(): number {
    return this.deliveries.size;
  }
}
