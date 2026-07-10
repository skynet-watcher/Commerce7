import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

import { verifyInternalBearer } from "./auth/internal-bearer.js";
import { appSyncRouteBodySchema } from "./c7/app-sync-schema.js";
import type { Commerce7Client } from "./c7/types.js";
import type { Env } from "./env.js";
import { analyticsEventBodySchema, type AnalyticsEventStore } from "./events/analytics-schema.js";
import { buildInsightsOverview } from "./insights/build-overview.js";
import { commerce7DataSourceLabel } from "./insights/commerce7-data-source.js";
import {
  installBodySchema,
  uninstallBodySchema,
  type AppInstallWrite,
} from "./lifecycle/install-schema.js";
import type { AppInstallStore } from "./lifecycle/install-store.js";
import { parseTypedPayload } from "./lifecycle/parse-payload.js";
import type { OAuthSessionStore } from "./oauth/oauth-store.js";
import { exchangeOAuthCode, type OAuthTokenExchangeConfig } from "./oauth/token-exchange.js";
import { strategyCreateBodySchema, snapshotFromByName } from "./strategies/schema.js";
import type { StrategyStore } from "./strategies/store.js";
import { promotionInputForStrategy } from "./strategies/promotion.js";
import { computeVerdict } from "./strategies/verdict.js";
import type { BackgroundOrderSyncRunner } from "./sync/background-scheduler.js";
import { reconcileSyncedOrders } from "./sync/reconcile.js";
import type { OrderRefPersistence } from "./sync/order-persistence.js";
import { runOrderSyncStep, type SyncStateStore } from "./sync/sync-state.js";
import { rateLimitMiddleware } from "./middleware/rate-limit.js";
import { verifyWebhookBasicAuth } from "./webhook/basic-auth.js";
import { deriveWebhookIdempotencyKey } from "./webhook/idempotency.js";
import { commerce7WebhookBodySchema } from "./webhook/schema.js";
import { verifyWebhookSignature, type WebhookSignatureConfig } from "./webhook/signature.js";
import type { WebhookDeliveryStore } from "./webhook/store.js";

const syncOrdersBodySchema = z.object({
  tenantId: z.string().min(1),
});

const reconcileBodySchema = z.object({
  tenantId: z.string().min(1),
});

function parseDateQuery(value: string | undefined, field: "startDate" | "endDate") {
  if (!value) return { ok: true as const, value: undefined };
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(dateOnly && field === "endDate" ? `${value}T23:59:59.999Z` : value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false as const, error: `${field} must be a valid ISO date or datetime` };
  }
  return { ok: true as const, value: parsed };
}

function denyUnlessInternalBearer(c: Context, token: string | undefined) {
  if (!token) {
    return undefined;
  }
  if (!verifyInternalBearer(token, c.req.header("Authorization"))) {
    return c.json({ error: "unauthorized" }, 401);
  }
  return undefined;
}

function corsOrigins(env: Env): string | string[] | ((origin: string) => string | undefined) {
  if (!env.APP_BASE_URL) {
    return "*";
  }
  if (env.NODE_ENV !== "development") {
    return env.APP_BASE_URL;
  }
  const staticOrigins = new Set([
    env.APP_BASE_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
  ]);
  return (origin: string) => {
    if (staticOrigins.has(origin)) return origin;
    if (/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/i.test(origin)) return origin;
    return undefined;
  };
}

function toInstallWrite(parsed: z.infer<typeof installBodySchema>): AppInstallWrite {
  const { tenantId, firstName, lastName, email, ...rest } = parsed;
  return {
    tenantId,
    installerFirstName: firstName ?? null,
    installerLastName: lastName ?? null,
    installerEmail: email && email !== "" ? email : null,
    raw: rest,
  };
}

export type CreateAppOptions = {
  env: Env;
  webhookStore: WebhookDeliveryStore;
  /** When both user + password set, webhook endpoint requires Basic auth. */
  webhookBasicAuth?: { user: string; password: string };
  /** Optional HMAC signature verification for Commerce7/provider-specific webhook signing. */
  webhookSignature?: WebhookSignatureConfig;
  /** Commerce7 Install / Uninstall URL targets (ADC Step 4 Installation). */
  lifecycle?: {
    store: AppInstallStore;
    basicAuth?: { user: string; password: string };
  };
  /** When set, `POST /sync/orders`, `/reconcile/orders`, `/v1/events`, `/v1/app-sync`, and `GET /v1/insights/overview` require matching Bearer token. */
  internalApiToken?: string;
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
  /** Persists OAuth redirect query and exchanges codes when token exchange config is present. */
  oauth?: { store: OAuthSessionStore; exchange?: OAuthTokenExchangeConfig };
  /** Background / merchant-triggered sync status and one-shot runner. */
  backgroundSync?: { runner: BackgroundOrderSyncRunner };
  /**
   * Merchant strategies (assistant plays): create with optional Commerce7
   * promotion (auto-expiring at the review date), list with honest verdicts,
   * end early. Requires `sync` (C7 client) and `analytics` to be wired.
   */
  strategies?: { store: StrategyStore };
};

export function createApp(options: CreateAppOptions): Hono {
  const {
    env,
    webhookStore,
    sync,
    webhookBasicAuth,
    webhookSignature,
    analytics,
    oauth,
    lifecycle,
    internalApiToken,
  } = options;
  const app = new Hono();

  app.use("*", logger());
  app.use(
    "*",
    cors({
      origin: corsOrigins(env),
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
        "Commerce7 integration API — webhooks, lifecycle, sync, reconcile, analytics. See docs/IMPLEMENTATION-LOG.md.",
      docs: "See docs/EXECUTION-PLAYBOOK.md",
    }),
  );

  app.get("/oauth/callback", async (c) => {
    const q = c.req.query();
    const tenantId = q.tenantId ?? q.tenant ?? "";
    let exchangeStatus: "not_configured" | "skipped" | "exchanged" | "failed" = "not_configured";
    let exchangeError: string | null = null;
    if (oauth?.store && tenantId) {
      await oauth.store.saveCallbackStub({
        tenantId,
        code: q.code ?? null,
        error: q.error ?? null,
        raw: q,
      });
      if (q.code && oauth.exchange && oauth.store.saveTokenSession) {
        try {
          const exchanged = await exchangeOAuthCode(oauth.exchange, q.code);
          await oauth.store.saveTokenSession({
            tenantId,
            accessToken: exchanged.accessToken,
            refreshToken: exchanged.refreshToken,
            expiresAt: exchanged.expiresAt,
            raw: {
              ...exchanged.raw,
              callbackQueryKeys: Object.keys(q),
            },
          });
          exchangeStatus = "exchanged";
        } catch (error) {
          exchangeStatus = "failed";
          exchangeError = error instanceof Error ? error.message : String(error);
          await oauth.store.saveCallbackStub({
            tenantId,
            code: q.code ?? null,
            error: exchangeError,
            raw: q,
          });
        }
      } else {
        exchangeStatus = q.code ? "skipped" : "not_configured";
      }
    }
    return c.json({
      step: "oauth-callback",
      stored: Boolean(oauth?.store && tenantId),
      tenantId: tenantId || null,
      exchangeStatus,
      exchangeError,
      receivedQueryKeys: Object.keys(q),
    });
  });

  app.get("/oauth/status", async (c) => {
    const denied = denyUnlessInternalBearer(c, internalApiToken);
    if (denied) {
      return denied;
    }
    const tenantId = c.req.query("tenantId")?.trim() ?? "";
    if (!tenantId) {
      return c.json(
        { error: "validation_error", details: { tenantId: ["Query param tenantId is required"] } },
        400,
      );
    }
    const stub = oauth?.store ? await oauth.store.getStub(tenantId) : null;
    const tokenSession = oauth?.store?.getTokenSession
      ? await oauth.store.getTokenSession(tenantId)
      : null;
    return c.json({
      ok: true,
      tenantId,
      callbackSeen: Boolean(stub),
      lastError: stub?.error ?? null,
      hasAccessToken: Boolean(tokenSession?.accessToken),
      hasRefreshToken: Boolean(tokenSession?.refreshToken),
      expiresAt: tokenSession?.expiresAt ?? null,
      updatedAt: tokenSession?.updatedAt ?? null,
    });
  });

  // 30 webhook deliveries per minute per IP (Commerce7 sends at most a handful per second in bursts)
  const webhookRateLimit = rateLimitMiddleware(
    30,
    60_000,
    (c) => c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
  );

  app.post("/webhooks/commerce7", webhookRateLimit, async (c) => {
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

    if (webhookSignature) {
      const ok = verifyWebhookSignature(
        raw,
        c.req.header(webhookSignature.headerName),
        webhookSignature,
      );
      if (!ok) {
        return c.json({ error: "invalid_signature" }, 401);
      }
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

  if (lifecycle?.store) {
    const { store: installStore, basicAuth: lifecycleBasic } = lifecycle;
    app.post("/lifecycle/install", async (c) => {
      if (lifecycleBasic) {
        const ok = verifyWebhookBasicAuth(c, lifecycleBasic.user, lifecycleBasic.password);
        if (!ok) {
          return c.json({ error: "unauthorized" }, 401);
        }
      }
      const raw = await c.req.text();
      if (raw.length > 65_536) {
        return c.json({ error: "payload_too_large" }, 413);
      }
      const payload = parseTypedPayload(raw);
      if (payload == null) {
        return c.json({ error: "invalid_body" }, 400);
      }
      const parsed = installBodySchema.safeParse(payload);
      if (!parsed.success) {
        return c.json({ error: "validation_error", details: parsed.error.flatten() }, 400);
      }
      await installStore.recordInstall(toInstallWrite(parsed.data));
      return c.json({ ok: true, tenantId: parsed.data.tenantId });
    });

    app.post("/lifecycle/uninstall", async (c) => {
      if (lifecycleBasic) {
        const ok = verifyWebhookBasicAuth(c, lifecycleBasic.user, lifecycleBasic.password);
        if (!ok) {
          return c.json({ error: "unauthorized" }, 401);
        }
      }
      const raw = await c.req.text();
      if (raw.length > 65_536) {
        return c.json({ error: "payload_too_large" }, 413);
      }
      const payload = parseTypedPayload(raw);
      if (payload == null) {
        return c.json({ error: "invalid_body" }, 400);
      }
      const parsed = uninstallBodySchema.safeParse(payload);
      if (!parsed.success) {
        return c.json({ error: "validation_error", details: parsed.error.flatten() }, 400);
      }
      await installStore.recordUninstall(parsed.data.tenantId);
      return c.json({ ok: true, tenantId: parsed.data.tenantId });
    });
  }

  if (analytics?.store) {
    const store = analytics.store;
    // 120 events per minute per tenantId in production — generous for legitimate
    // collectors, tight enough to prevent store flooding from a misconfigured client.
    // In development the limit is lifted so seed scripts can run without throttling.
    const eventsRateLimit = rateLimitMiddleware(
      env.NODE_ENV === "development" ? 100_000 : 120,
      60_000,
      (c) => c.req.query("tenantId") ?? "unknown",
    );
    app.post("/v1/events", eventsRateLimit, async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) {
        return denied;
      }
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

  if (sync && analytics?.store) {
    const c7Client = sync.client;
    const analyticsStore = analytics.store;
    app.get("/v1/insights/overview", async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) {
        return denied;
      }
      const tenantId = c.req.query("tenantId")?.trim() ?? "";
      if (!tenantId) {
        return c.json(
          {
            error: "validation_error",
            details: { tenantId: ["Query param tenantId is required"] },
          },
          400,
        );
      }
      const startDate = parseDateQuery(c.req.query("startDate"), "startDate");
      const endDate = parseDateQuery(c.req.query("endDate"), "endDate");
      if (!startDate.ok || !endDate.ok) {
        return c.json(
          {
            error: "validation_error",
            details: {
              ...(startDate.ok ? {} : { startDate: [startDate.error] }),
              ...(endDate.ok ? {} : { endDate: [endDate.error] }),
            },
          },
          400,
        );
      }
      if (startDate.value && endDate.value && startDate.value > endDate.value) {
        return c.json(
          {
            error: "validation_error",
            details: { dateRange: ["startDate must be before or equal to endDate"] },
          },
          400,
        );
      }
      const payload = await buildInsightsOverview({
        tenantId,
        client: c7Client,
        analytics: analyticsStore,
        commerce7DataSource: commerce7DataSourceLabel(env),
        range: { startDate: startDate.value, endDate: endDate.value },
      });
      return c.json(payload);
    });
  }

  if (options.strategies && sync && analytics?.store) {
    const strategyStore = options.strategies.store;
    const c7Client = sync.client;
    const analyticsStore = analytics.store;

    const currentSnapshot = async (tenantId: string) => {
      const summary = await analyticsStore.summarizeTenant(tenantId);
      return snapshotFromByName(summary.byName, summary.totalEvents);
    };

    app.post("/v1/strategies", async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) return denied;

      let json: unknown;
      try {
        json = await c.req.json();
      } catch {
        return c.json({ error: "invalid_json" }, 400);
      }
      const parsed = strategyCreateBodySchema.safeParse(json);
      if (!parsed.success) {
        return c.json({ error: "validation_error", details: parsed.error.flatten() }, 400);
      }
      const body = parsed.data;

      const startedAt = new Date();
      const reviewAt = new Date(startedAt.getTime() + body.testDays * 86_400_000);
      const baseline = await currentSnapshot(body.tenantId);

      const record = await strategyStore.create({
        tenantId: body.tenantId,
        title: body.title,
        message: body.message,
        offer: body.offer ?? null,
        promotionId: null,
        startedAt,
        reviewAt,
        testDays: body.testDays,
        baseline,
      });

      // The offer becomes a real Commerce7 promotion that expires with the
      // test window. A failed push never fails the strategy — the merchant
      // gets the message either way, and the response says so honestly.
      let promotionId: string | null = null;
      let promotionError: string | null = null;
      if (body.offer) {
        try {
          const promo = await c7Client.createPromotion(
            body.tenantId,
            promotionInputForStrategy({
              title: body.title,
              message: body.message,
              offer: body.offer,
              startedAt,
              reviewAt,
            }),
          );
          promotionId = promo.id;
          await strategyStore.setPromotionId(body.tenantId, record.id, promotionId);
        } catch (e) {
          promotionError = e instanceof Error ? e.message : String(e);
        }
      }

      return c.json(
        {
          strategy: { ...record, promotionId },
          verdict: computeVerdict({ ...record, promotionId }, baseline),
          promotionError,
        },
        201,
      );
    });

    app.get("/v1/strategies", async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) return denied;

      const tenantId = c.req.query("tenantId")?.trim() ?? "";
      if (!tenantId) {
        return c.json(
          { error: "validation_error", details: { tenantId: ["Query param tenantId is required"] } },
          400,
        );
      }
      const rows = await strategyStore.listByTenant(tenantId);
      const current = await currentSnapshot(tenantId);
      return c.json({
        tenantId,
        generatedAt: new Date().toISOString(),
        strategies: rows.map((row) => ({ strategy: row, verdict: computeVerdict(row, current) })),
      });
    });

    app.post("/v1/strategies/:id/end", async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) return denied;

      const id = c.req.param("id");
      let json: unknown = {};
      try {
        json = await c.req.json();
      } catch {
        /* body optional */
      }
      const tenantId =
        typeof (json as { tenantId?: unknown }).tenantId === "string"
          ? ((json as { tenantId: string }).tenantId).trim()
          : "";
      if (!tenantId) {
        return c.json(
          { error: "validation_error", details: { tenantId: ["Body field tenantId is required"] } },
          400,
        );
      }

      const existing = await strategyStore.get(tenantId, id);
      if (!existing) {
        return c.json({ error: "not_found" }, 404);
      }

      const endedAt = new Date();
      const record = (await strategyStore.markEnded(tenantId, id, endedAt)) ?? existing;

      let promotionError: string | null = null;
      if (existing.promotionId) {
        try {
          await c7Client.endPromotion(tenantId, existing.promotionId, endedAt.toISOString());
        } catch (e) {
          promotionError = e instanceof Error ? e.message : String(e);
        }
      }

      const current = await currentSnapshot(tenantId);
      return c.json({
        strategy: record,
        verdict: computeVerdict(record, current),
        promotionError,
      });
    });
  }

  if (sync) {
    const { client: c7, syncState, orderPersistence } = sync;

    app.get("/v1/account/user", async (c) => {
      const tenantId = c.req.query("tenantId")?.trim() ?? "";
      if (!tenantId) {
        return c.json(
          {
            error: "validation_error",
            details: { tenantId: ["Query param tenantId is required"] },
          },
          400,
        );
      }
      const authorization = c.req.header("Authorization")?.trim() ?? "";
      if (!authorization) {
        return c.json({ error: "missing_authorization" }, 400);
      }
      const result = await c7.getAccountUser(tenantId, authorization);
      return new Response(JSON.stringify(result.body ?? null), {
        status: result.status,
        headers: { "Content-Type": "application/json" },
      });
    });

    app.post("/sync/orders", async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) {
        return denied;
      }
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
        const denied = denyUnlessInternalBearer(c, internalApiToken);
        if (denied) {
          return denied;
        }
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

    app.post("/v1/app-sync", async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) {
        return denied;
      }
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
      const parsed = appSyncRouteBodySchema.safeParse(json);
      if (!parsed.success) {
        return c.json({ error: "validation_error", details: parsed.error.flatten() }, 400);
      }
      const { tenantId, ...apiBody } = parsed.data;
      await c7.createAppSync(tenantId, apiBody);
      return c.json({ ok: true, tenantId });
    });
  }

  if (options.backgroundSync) {
    const runner = options.backgroundSync.runner;
    app.get("/v1/sync/status", async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) {
        return denied;
      }
      const tenantId = c.req.query("tenantId")?.trim();
      return c.json({ ok: true, statuses: runner.status(tenantId || undefined) });
    });

    app.post("/v1/sync/run", async (c) => {
      const denied = denyUnlessInternalBearer(c, internalApiToken);
      if (denied) {
        return denied;
      }
      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: "invalid_json" }, 400);
      }
      const parsed = syncOrdersBodySchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: "validation_error", details: parsed.error.flatten() }, 400);
      }
      const status = await runner.runOnce(parsed.data.tenantId);
      return c.json({ ok: status.lastOk !== false, status });
    });
  }

  return app;
}
