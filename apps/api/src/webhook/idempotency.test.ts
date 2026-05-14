import { describe, expect, it } from "vitest";

import { deriveWebhookIdempotencyKey } from "./idempotency.js";
import type { Commerce7WebhookBody } from "./schema.js";

function body(partial: Partial<Commerce7WebhookBody> & Pick<Commerce7WebhookBody, "tenantId" | "object" | "action" | "payload">): Commerce7WebhookBody {
  return {
    user: partial.user,
    tenantId: partial.tenantId,
    object: partial.object,
    action: partial.action,
    payload: partial.payload,
  };
}

describe("deriveWebhookIdempotencyKey", () => {
  it("uses id + updatedAt when present", () => {
    const a = body({
      tenantId: "t1",
      object: "Order",
      action: "Update",
      payload: { id: "o1", updatedAt: "2024-06-01T12:00:00.000Z" },
    });
    const b = body({
      tenantId: "t1",
      object: "Order",
      action: "Update",
      payload: { id: "o1", updatedAt: "2024-06-01T12:00:00.000Z", extra: 1 },
    });
    expect(deriveWebhookIdempotencyKey(a)).toBe(deriveWebhookIdempotencyKey(b));
  });

  it("isolates tenants with same order id", () => {
    const a = body({
      tenantId: "tenant-a",
      object: "Order",
      action: "Update",
      payload: { id: "o1", updatedAt: "2024-06-01T12:00:00.000Z" },
    });
    const b = body({
      tenantId: "tenant-b",
      object: "Order",
      action: "Update",
      payload: { id: "o1", updatedAt: "2024-06-01T12:00:00.000Z" },
    });
    expect(deriveWebhookIdempotencyKey(a)).not.toBe(deriveWebhookIdempotencyKey(b));
  });

  it("treats different updatedAt as different deliveries", () => {
    const a = body({
      tenantId: "t1",
      object: "Order",
      action: "Update",
      payload: { id: "o1", updatedAt: "2024-06-01T12:00:00.000Z" },
    });
    const b = body({
      tenantId: "t1",
      object: "Order",
      action: "Update",
      payload: { id: "o1", updatedAt: "2024-06-01T13:00:00.000Z" },
    });
    expect(deriveWebhookIdempotencyKey(a)).not.toBe(deriveWebhookIdempotencyKey(b));
  });

  it("uses callbackUrl for Bulk Update", () => {
    const b = body({
      tenantId: "t1",
      object: "Customer",
      action: "Bulk Update",
      payload: { callbackUrl: "https://api.commerce7.com/v1/customer?cursor=start&tagId=x" },
    });
    expect(deriveWebhookIdempotencyKey(b)).toContain("https://api.commerce7.com");
    expect(deriveWebhookIdempotencyKey(b)).toContain("tagId=x");
  });

  it("falls back to stable hash when id missing", () => {
    const b = body({
      tenantId: "t1",
      object: "Order",
      action: "Update",
      payload: { foo: "bar", nested: { z: 1 } },
    });
    const key = deriveWebhookIdempotencyKey(b);
    const hashPart = key.split("|").pop() ?? "";
    expect(hashPart).toMatch(/^[a-f0-9]{64}$/);
  });
});
