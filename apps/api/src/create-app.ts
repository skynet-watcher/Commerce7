import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

import type { Commerce7Client } from "./c7/types.js";
import type { Env } from "./env.js";
import { analyticsEventBodySchema, type AnalyticsEventStore } from "./events/analytics-schema.js";
import type { OAuthSessionStore } from "./oauth/oauth-store.js";
import { reconcileSyncedOrders } from "./sync/reconcile.js";
import type { OrderRefPersistence } from "./sync/order-persistence.js";
import { runOrderSyncStep, type SyncStateStore } from "./sync/sync-state.js";
import { verifyWebhookBasicAuth } from "./webhook/basic-auth.js";
import { deriveWebhookIdempotencyKey } from "./webhook/idempotency.js";
import { commerce7WebhookBodySchema } from "./webhook/schema.js";
import type { WebhookDeliveryStore } from "./webhook/store.js";

const syncOrdersBodySchema = z.object({
  tenantId: z.string().min(1),
});

const reconcileBodySchema = z.object({
  tenantId: z.string().min(1),
});

export type CreateAppOptions = {
  env: Env;
  webhookStore: WebhookDeliveryStore;
  /** When both user + password set, webhook endpoint requires Basic auth. */
  webhookBasicAuth?: { user: string; password: string };
  /** When set, exposes POST /sync/orders (Phase A/B — protect in production). */
  sync?: {
    client: Commerce7Client;
    syncState: SyncStateStore;
    orderPersistence?: OrderRefPersistence;
  };
  /** When set with sync.orderPersistence, exposes POST /reconcile/orders (T9 precursor). */
  reconcileEnabled?: boolean;
  /** POST /v1/events — idempotent analytics sink (T6 / abuse limits). */
  analytics?: { store: AnalyticsEventStore };
  /** Persists OAuth redirect query (dev stub — real token exchange is Phase B). */
  oauth?: { store: OAuthSessionStore };
};

export function createApp(options: CreateAppOptions): Hono {
  const { env, webhookStore, sync, webhookBasicAuth, analytics, oauth } = options;
  const app = new Hono();

  app.use("*", logger());
  app.use(
    "*",
    cors({
      origin: env.APP_BASE_URL ?? "*",
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "OPTIONS"],
    }),
  );

  app.get("/health", (c) =>
    c.json({
      ok: true,
      service: "@commerce7/api",
      env: env.NODE_ENV,
    }),
  );

  app.get("/", (c) =>
    c.json({
      message:
        "Commerce7 integration API — webhooks, sync, reconcile, analytics. See docs/IMPLEMENTATION-LOG.md.",
      docs: "See docs/EXECUTION-PLAYBOOK.md",
    }),
  );

  app.get("/oauth/callback", async (c) => {
    const q = c.req.query();
    if (oauth?.store && q.tenantId) {
      await oauth.store.saveCallbackStub({
        tenantId: q.tenantId,
        code: q.code ?? null,
        error: q.error ?? null,
        raw: q,
      });
    }
    return c.json({
      step: "oauth-callback",
      stored: Boolean(oauth?.store && q.tenantId),
      receivedQueryKeys: Object.keys(q),
    });
  });

  app.post("/webhooks/commerce7", async (c) => {
    if (webhookBasicAuth) {
      const ok = verifyWebhookBasicAuth(c, webhookBasicAuth.user, webhookBasicAuth.password);
      if (!ok) {
        return c.json({ error: "unauthorized" }, 401);
      }
    }

    const raw = await c.req.text();
    if (raw.length > 1_000_000) {
      return c.json({ error: "payload_too_large" }, 413);
    }

    let json: unknown;
    try {
      json = JSON.parse(raw) as unknown;
    } catch {
      return c.json({ error: "invalid_json" }, 400);
    }

    const parsed = commerce7WebhookBodySchema.safeParse(json);
    if (!parsed.success) {
      return c.json(
        {
          error: "validation_error",
          details: parsed.error.flatten(),
        },
        400,
      );
    }

    const idempotencyKey = deriveWebhookIdempotencyKey(parsed.data);
    const result = await webhookStore.recordDelivery({
      idempotencyKey,
      tenantId: parsed.data.tenantId,
      rawBody: raw,
      body: parsed.data,
    });

    return c.json({
      ok: true,
      duplicate: result.duplicate,
      idempotencyKey,
      receivedAt: result.receivedAt,
    });
  });

  if (analytics?.store) {
    const store = analytics.store;
    app.post("/v1/events", async (c) => {
      const raw = await c.req.text();
      if (raw.length > 65_536) {
        return c.json({ error: "payload_too_large" }, 413);
      }
      let json: unknown;
      try {
        json = JSON.parse(raw) as unknown;
      } catch {
        return c.json({ error: "invalid_json" }, 400);
      }
      const parsed = analyticsEventBodySchema.safeParse(json);
      if (!parsed.success) {
        return c.json({ error: "validation_error", details: parsed.error.flatten() }, 400);
      }
      const body = parsed.data;
      const result = await store.record({
        tenantId: body.tenantId,
        clientEventId: body.clientEventId,
        body,
      });
      return c.json({ ok: true, duplicate: result.duplicate });
    });
  }

  if (sync) {
    const { client: c7, syncState, orderPersistence } = sync;
    app.post("/sync/orders", async (c) => {
      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: "invalid_json" }, 400);
      }
      const parsed = syncOrdersBodySchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          {
            error: "validation_error",
            details: parsed.error.flatten(),
          },
          400,
        );
      }
      const result = await runOrderSyncStep(c7, syncState, parsed.data.tenantId, {
        orderPersistence,
      });
      return c.json({ ok: true, tenantId: parsed.data.tenantId, ...result });
    });

    if (options.reconcileEnabled && sync.orderPersistence) {
      const persistence = sync.orderPersistence;
      app.post("/reconcile/orders", async (c) => {
        let body: unknown;
        try {
          body = await c.req.json();
        } catch {
          return c.json({ error: "invalid_json" }, 400);
        }
        const parsed = reconcileBodySchema.safeParse(body);
        if (!parsed.success) {
          return c.json(
            { error: "validation_error", details: parsed.error.flatten() },
            400,
          );
        }
        const r = await reconcileSyncedOrders(c7, persistence, parsed.data.tenantId);
        return c.json({ ok: true, ...r });
      });
    }
  }

  return app;
}
