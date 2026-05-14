import { timingSafeEqual } from "node:crypto";

import type { Context } from "hono";

/** Optional ADC “Advanced” webhook Basic Auth (username/password). */
export function verifyWebhookBasicAuth(
  c: Context,
  expectedUser: string,
  expectedPassword: string,
): boolean {
  const h = c.req.header("authorization");
  if (!h?.startsWith("Basic ")) {
    return false;
  }
  let decoded: string;
  try {
    decoded = Buffer.from(h.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const idx = decoded.indexOf(":");
  if (idx === -1) {
    return false;
  }
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  if (user !== expectedUser) {
    return false;
  }
  const a = Buffer.from(pass);
  const b = Buffer.from(expectedPassword);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
