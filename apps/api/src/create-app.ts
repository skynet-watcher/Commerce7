import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import type { Env } from "./env.js";
import { deriveWebhookIdempotencyKey } from "./webhook/idempotency.js";
import { commerce7WebhookBodySchema } from "./webhook/schema.js";
import type { WebhookDeliveryStore } from "./webhook/store.js";

export type CreateAppOptions = {
  env: Env;
  webhookStore: WebhookDeliveryStore;
};

export function createApp(options: CreateAppOptions): Hono {
  const { env, webhookStore } = options;
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
      message: "Commerce7 integration API — OAuth stub + webhook ingestion (in-memory store).",
      docs: "See docs/EXECUTION-PLAYBOOK.md",
    }),
  );

  app.get("/oauth/callback", (c) => {
    const q = c.req.query();
    return c.json({ step: "oauth-callback", receivedQueryKeys: Object.keys(q) });
  });

  app.post("/webhooks/commerce7", async (c) => {
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
    const result = webhookStore.recordDelivery({
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

  return app;
}
