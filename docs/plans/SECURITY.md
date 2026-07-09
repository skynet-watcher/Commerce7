# Security Implementation Plan
## Commerce7 Plugin — Pre-Launch Requirements

---

## Status summary

| Requirement | Status | Blocking go-live? |
|---|---|---|
| OAuth 2.0 token exchange | ✅ Pass | No |
| No tokens exposed to browser | ✅ Pass | No |
| Input validation (Zod) | ✅ Pass | No |
| HTTPS for all Commerce7 API calls | ✅ Pass | No |
| Webhook HMAC-SHA256 verification | ❌ Missing | **Yes** |
| Security headers (CSP, X-Frame-Options) | ❌ Missing | **Yes** |
| Rate limiting on public endpoints | ❌ Missing | **Yes** |

Three items must be implemented before this app can go live or pass Commerce7's app review.

---

## 1. Webhook HMAC-SHA256 Verification

### Why it matters
Commerce7 signs every webhook payload with an HMAC-SHA256 signature derived from the shared app secret. Without verifying this signature, any party that knows the webhook URL can send forged payloads — fake order events, fake installs, fake uninstalls — and the app will process them as real.

### Where to implement
`apps/api/src/webhook/` — the webhook route currently only checks HTTP Basic Auth (a separate, optional mechanism). HMAC verification must be added and run for every request.

### How Commerce7 sends the signature
Commerce7 includes the signature in the request header:
```
X-C7-Signature: sha256=<hex_digest>
```

The digest is computed as:
```
HMAC-SHA256(key=APP_SECRET, message=raw_request_body)
```

### Implementation

**New file: `apps/api/src/webhook/hmac.ts`**

```typescript
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies the Commerce7 HMAC-SHA256 webhook signature.
 * Returns true if valid, false if invalid or missing.
 *
 * @param rawBody  The raw request body as a Buffer (must be read before JSON parsing)
 * @param header   Value of the X-C7-Signature header
 * @param secret   The app's CLIENT_SECRET from Commerce7 developer portal
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  header: string | undefined,
  secret: string,
): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const received = Buffer.from(header.slice(7), "hex");
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}
```

**Key implementation note:** The raw body must be captured **before** any JSON parsing middleware runs. Hono's `c.req.raw.arrayBuffer()` or a custom body reader must be used. Once the body is parsed as JSON, the original bytes are lost and the HMAC cannot be verified.

**Update `apps/api/src/webhook/route.ts`:**

```typescript
import { verifyWebhookSignature } from "./hmac.js";

// Inside the webhook handler, before processing:
const rawBody = Buffer.from(await c.req.raw.arrayBuffer());
const signature = c.req.header("x-c7-signature");
const secret = env.C7_CLIENT_SECRET; // must be added to env schema

if (!verifyWebhookSignature(rawBody, signature, secret)) {
  return c.json({ error: "Invalid signature" }, 401);
}
```

**Environment variable to add:**
- `C7_CLIENT_SECRET` — the app's client secret from the Commerce7 developer portal

**Test to add in `apps/api/src/webhook/`:**
- Valid HMAC → 200
- Missing header → 401
- Wrong secret → 401
- Tampered body → 401

---

## 2. Security Headers

### Why they matter
Without security headers:
- **No `Content-Security-Policy`** — the app is vulnerable to cross-site scripting (XSS) injections
- **No `X-Frame-Options` / `frame-ancestors`** — other sites can embed this app in their own iframes (clickjacking)
- **No `X-Content-Type-Options`** — browsers may MIME-sniff responses and execute unexpected content

Commerce7 specifically requires that embedded apps set appropriate `frame-ancestors` to allow embedding from `*.commerce7.com` and nowhere else.

### Where to implement
`apps/web/next.config.ts` — add a `headers()` export.

### Implementation

```typescript
// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["http://localhost:3001"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Allow embedding only from Commerce7 admin
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js dev; tighten in prod
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' http://localhost:3001 https://api.commerce7.com",
              "frame-ancestors 'self' https://*.commerce7.com",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Note on `X-Frame-Options`:** Do **not** set `X-Frame-Options: DENY` or `SAMEORIGIN` — this would prevent Commerce7 from embedding the app. The `frame-ancestors` CSP directive takes precedence in modern browsers and is the correct mechanism.

**Note on cookies:** If session cookies are added in a future phase, they must be set with `SameSite=None; Secure` to function inside a Commerce7 iframe (third-party cookie context). `SameSite=Strict` or `SameSite=Lax` cookies will be silently blocked.

### Verification
```bash
# After implementing, check headers:
curl -I http://localhost:3000/dashboard
# Should include Content-Security-Policy, X-Content-Type-Options, etc.
```

---

## 3. Rate Limiting

### Why it matters
Two API endpoints are currently public and unthrottled:

| Endpoint | Risk |
|---|---|
| `POST /v1/events` | Any client can flood the in-memory store with millions of fake events, consuming memory and corrupting analytics |
| `POST /webhooks/commerce7` | Can be abused for denial-of-service even with HMAC verification |

### Recommended approach: token bucket in Hono middleware

**New file: `apps/api/src/middleware/rate-limit.ts`**

```typescript
import type { MiddlewareHandler } from "hono";

type Bucket = { tokens: number; lastRefill: number };

/**
 * Simple in-memory token bucket rate limiter.
 * For multi-process / production deployments, replace with Redis.
 *
 * @param maxTokens     Requests allowed per window
 * @param refillMs      Window length in milliseconds
 * @param keyFn         Extracts the rate-limit key from the request (e.g. IP or tenantId)
 */
export function rateLimit(
  maxTokens: number,
  refillMs: number,
  keyFn: (c: Parameters<MiddlewareHandler>[0]) => string,
): MiddlewareHandler {
  const buckets = new Map<string, Bucket>();

  return async (c, next) => {
    const key = keyFn(c);
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now - bucket.lastRefill >= refillMs) {
      bucket = { tokens: maxTokens, lastRefill: now };
    }

    if (bucket.tokens <= 0) {
      return c.json({ error: "Rate limit exceeded. Please slow down." }, 429);
    }

    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return next();
  };
}
```

**Apply to routes in `apps/api/src/index.ts` or the relevant route files:**

```typescript
import { rateLimit } from "./middleware/rate-limit.js";

// Events endpoint: 60 events per minute per tenant
eventsRoute.use(
  rateLimit(60, 60_000, (c) => c.req.query("tenantId") ?? c.req.header("x-forwarded-for") ?? "unknown"),
);

// Webhook endpoint: 30 per minute per IP
webhookRoute.use(
  rateLimit(30, 60_000, (c) => c.req.header("x-forwarded-for") ?? "unknown"),
);
```

### Limits (starting values — adjust based on observed traffic)

| Endpoint | Limit | Window | Key |
|---|---|---|---|
| `POST /v1/events` | 120 requests | 60 seconds | `tenantId` |
| `POST /webhooks/commerce7` | 30 requests | 60 seconds | IP address |
| `GET /v1/insights/overview` | 30 requests | 60 seconds | `tenantId` |

### Production note
The in-memory implementation above works for a single-process deployment. If the API ever runs multiple instances, replace the `Map` with a Redis-backed counter (e.g. `ioredis` with sliding window Lua scripts). For Commerce7's initial pilot scale (1–5 tenants), the in-memory approach is acceptable.

---

## Implementation order

Do these in order — each one is a hard gate before launch:

1. **Webhook HMAC** — implement and test first. Fake webhook events are the highest-severity risk.
2. **Security headers** — one config block, lowest effort, required for iframe embedding to work correctly.
3. **Rate limiting** — middleware layer, medium effort, protects the analytics store from abuse.

---

## Files to create / modify

| File | Change |
|---|---|
| `apps/api/src/webhook/hmac.ts` | Create — HMAC verification function |
| `apps/api/src/webhook/route.ts` | Modify — call HMAC check before processing |
| `apps/api/src/webhook/hmac.test.ts` | Create — 4 test cases (valid, missing, wrong secret, tampered) |
| `apps/api/src/middleware/rate-limit.ts` | Create — token bucket middleware |
| `apps/api/src/index.ts` | Modify — apply rate limit middleware to public routes |
| `apps/api/src/env.ts` | Modify — add `C7_CLIENT_SECRET` to env schema |
| `apps/web/next.config.ts` | Modify — add `headers()` export with CSP and security headers |

---

## Effort estimate

| Item | Estimate |
|---|---|
| Webhook HMAC | 3–4 hours (implementation + tests) |
| Security headers | 1 hour |
| Rate limiting | 2–3 hours |
| **Total** | **~1 day** |
