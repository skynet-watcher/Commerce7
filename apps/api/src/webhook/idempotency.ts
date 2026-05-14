import { createHash } from "node:crypto";

import type { Commerce7WebhookBody } from "./schema.js";

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableJson(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableJson(obj[k])}`).join(",")}}`;
}

/**
 * Stable idempotency key per tenant so duplicate deliveries are deduped safely.
 * Prefer `id` + `updatedAt` from payload when present (orders/customers/etc.).
 */
export function deriveWebhookIdempotencyKey(body: Commerce7WebhookBody): string {
  const { tenantId, object: objectName, action, payload } = body;

  if (action === "Bulk Update" && typeof payload.callbackUrl === "string") {
    return `${tenantId}|${objectName}|${action}|${payload.callbackUrl}`;
  }

  const id = payload.id;
  const updatedAt = payload.updatedAt;
  if (typeof id === "string" && id.length > 0) {
    const u = typeof updatedAt === "string" && updatedAt.length > 0 ? updatedAt : "";
    return `${tenantId}|${objectName}|${action}|${id}|${u}`;
  }

  const hash = createHash("sha256").update(stableJson(payload)).digest("hex");
  return `${tenantId}|${objectName}|${action}|${hash}`;
}
