import type { Context, Next } from "hono";

type Bucket = { tokens: number; lastRefillMs: number };

/**
 * In-memory token bucket rate limiter for Hono routes.
 *
 * Each unique key gets its own bucket. Tokens refill fully at the start of
 * each window — this is a fixed-window counter, not a sliding window.
 *
 * For single-process deployments this is sufficient. If the API ever runs
 * multiple processes, swap the Map for a Redis-backed sliding window.
 *
 * @param maxTokens   Maximum requests allowed per window per key.
 * @param windowMs    Window length in milliseconds.
 * @param keyFn       Extracts the rate-limit key from the request context
 *                    (e.g. tenantId query param, IP address).
 *
 * @example
 * // 120 events per minute per tenantId
 * app.post("/v1/events", rateLimitMiddleware(120, 60_000, (c) =>
 *   c.req.query("tenantId") ?? "unknown"
 * ), handler);
 */
export function rateLimitMiddleware(
  maxTokens: number,
  windowMs: number,
  keyFn: (c: Context) => string,
) {
  const buckets = new Map<string, Bucket>();

  return async function rateLimit(c: Context, next: Next): Promise<Response | void> {
    const key = keyFn(c);
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now - bucket.lastRefillMs >= windowMs) {
      bucket = { tokens: maxTokens, lastRefillMs: now };
    }

    if (bucket.tokens <= 0) {
      c.header("Retry-After", String(Math.ceil(windowMs / 1000)));
      return c.json(
        { error: "rate_limit_exceeded", message: "Too many requests. Please slow down." },
        429,
      );
    }

    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return next();
  };
}
