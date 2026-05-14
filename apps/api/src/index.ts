import type { Pool } from "pg";
import { serve } from "@hono/node-server";

import { createCommerce7Client } from "./c7/create-client.js";
import { createApp } from "./create-app.js";
import { createPool } from "./db/pool.js";
import { runMigrations } from "./db/run-migrations.js";
import type { AnalyticsEventStore } from "./events/analytics-schema.js";
import { InMemoryAnalyticsEventStore, PgAnalyticsEventStore } from "./events/analytics-store.js";
import { loadEnv, type Env } from "./env.js";
import { InMemoryOAuthSessionStore, PgOAuthSessionStore, type OAuthSessionStore } from "./oauth/oauth-store.js";
import { InMemoryOrderRefPersistence, PgOrderRefPersistence } from "./sync/order-persistence.js";
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

function createOrderPersistence(env: Env, pool: Pool | undefined) {
  if (pool) {
    return new PgOrderRefPersistence(pool);
  }
  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required when NODE_ENV=production");
  }
  return new InMemoryOrderRefPersistence();
}

function createAnalyticsStore(env: Env, pool: Pool | undefined): AnalyticsEventStore {
  if (pool) {
    return new PgAnalyticsEventStore(pool);
  }
  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required when NODE_ENV=production");
  }
  return new InMemoryAnalyticsEventStore();
}

function createOAuthStore(env: Env, pool: Pool | undefined): OAuthSessionStore {
  if (pool) {
    return new PgOAuthSessionStore(pool);
  }
  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required when NODE_ENV=production");
  }
  return new InMemoryOAuthSessionStore();
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
const orderPersistence = createOrderPersistence(env, pool);
const analyticsStore = createAnalyticsStore(env, pool);
const oauthStore = createOAuthStore(env, pool);
const commerce7Client = createCommerce7Client(env);

const webhookBasicAuth =
  env.WEBHOOK_BASIC_USER && env.WEBHOOK_BASIC_PASSWORD
    ? { user: env.WEBHOOK_BASIC_USER, password: env.WEBHOOK_BASIC_PASSWORD }
    : undefined;

const app = createApp({
  env,
  webhookStore,
  webhookBasicAuth,
  sync: {
    client: commerce7Client,
    syncState: syncStateStore,
    orderPersistence,
  },
  reconcileEnabled: true,
  analytics: { store: analyticsStore },
  oauth: { store: oauthStore },
});

const port = env.PORT;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`@commerce7/api listening on http://localhost:${info.port}`);
});
