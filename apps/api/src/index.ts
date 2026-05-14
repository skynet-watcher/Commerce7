import { serve } from "@hono/node-server";

import { createApp } from "./create-app.js";
import { createPool } from "./db/pool.js";
import { runMigrations } from "./db/run-migrations.js";
import { loadEnv, type Env } from "./env.js";
import { PgWebhookDeliveryStore } from "./webhook/pg-store.js";
import { InMemoryWebhookDeliveryStore } from "./webhook/store.js";
import type { WebhookDeliveryStore } from "./webhook/store.js";

async function createWebhookStore(env: Env): Promise<WebhookDeliveryStore> {
  if (env.DATABASE_URL) {
    const pool = createPool(env.DATABASE_URL);
    await runMigrations(pool);
    return new PgWebhookDeliveryStore(pool);
  }
  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required when NODE_ENV=production");
  }
  console.warn("@commerce7/api: DATABASE_URL unset — using InMemoryWebhookDeliveryStore (dev only)");
  return new InMemoryWebhookDeliveryStore();
}

const env = loadEnv();
const webhookStore = await createWebhookStore(env);
const app = createApp({ env, webhookStore });

const port = env.PORT;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`@commerce7/api listening on http://localhost:${info.port}`);
});
