import { describe, expect, it } from "vitest";

import { commerce7WebhookBodySchema } from "./schema.js";

describe("commerce7WebhookBodySchema", () => {
  it("accepts a documented-shaped body", () => {
    const raw = {
      object: "Order",
      action: "Update",
      payload: { id: "ord_1", updatedAt: "2020-01-02T00:00:00.000Z", total: 100 },
      user: "merchant@example.com",
      tenantId: "wine-club",
    };
    const parsed = commerce7WebhookBodySchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tenantId).toBe("wine-club");
      expect(parsed.data.payload.id).toBe("ord_1");
    }
  });

  it("rejects missing tenantId", () => {
    const parsed = commerce7WebhookBodySchema.safeParse({
      object: "Order",
      action: "Update",
      payload: {},
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid JSON shape for payload (array)", () => {
    const parsed = commerce7WebhookBodySchema.safeParse({
      object: "Order",
      action: "Update",
      payload: [] as unknown as Record<string, unknown>,
      tenantId: "t",
    });
    expect(parsed.success).toBe(false);
  });
});
