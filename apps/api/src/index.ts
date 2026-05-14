import type { Pool } from "pg";
import { serve } from "@hono/node-server";

import { MockCommerce7Client } from "./c7/mock-client.js";
import { createApp } from "./create-app.js";
import { createPool } from "./db/pool.js";
import { runMigrations } from "./db/run-migrations.js";
import { loadEnv, type Env } from "./env.js";
import { InMemorySyncStateStore, PgSyncStateStore, type SyncStateStore } from "./sync/sync-state.js";
import { PgWebhookDeliveryStore } from "./webhook/pg-store.js";
import { InMemoryWebhookDeliveryStore } from "./webhook/store.js";
import type { WebhookDeliveryStore } from "./webhook/store.js";

function createWebhookStore(env: Env, pool: Pool | undefined): WebhookDeliveryStore {
  if (pool) {
    return new PgWebhookDeliveryStore(pool);
  }
  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required when NODE_ENV=production");
  }
  console.warn("@commerce7/api: DATABASE_URL unset — using InMemoryWebhookDeliveryStore (dev only)");
  return new InMemoryWebhookDeliveryStore();
}

function createSyncStateStore(env: Env, pool: Pool | undefined): SyncStateStore {
  if (pool) {
    return new PgSyncStateStore(pool);
  }
  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required when NODE_ENV=production");
  }
  return new InMemorySyncStateStore();
}

const env = loadEnv();

let pool: Pool | undefined;
if (env.DATABASE_URL) {
  pool = createPool(env.DATABASE_URL);
  await runMigrations(pool);
} else if (env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL is required when NODE_ENV=production");
}

const webhookStore = createWebhookStore(env, pool);
const syncStateStore = createSyncStateStore(env, pool);
const commerce7Client = MockCommerce7Client.twoPageDemo();

const app = createApp({
  env,
  webhookStore,
  sync: {
    client: commerce7Client,
    syncState: syncStateStore,
  },
});

const port = env.PORT;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`@commerce7/api listening on http://localhost:${info.port}`);
});
