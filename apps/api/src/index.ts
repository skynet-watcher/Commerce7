import type { Pool } from "pg";
import { serve } from "@hono/node-server";

import { createCommerce7Client } from "./c7/create-client.js";
import { createApp } from "./create-app.js";
import { createPool } from "./db/pool.js";
import { runMigrations } from "./db/run-migrations.js";
import type { AnalyticsEventStore } from "./events/analytics-schema.js";
import { InMemoryAnalyticsEventStore, PgAnalyticsEventStore } from "./events/analytics-store.js";
import { loadEnv, type Env } from "./env.js";
import { InMemoryAppInstallStore, PgAppInstallStore, type AppInstallStore } from "./lifecycle/install-store.js";
import { InMemoryOAuthSessionStore, PgOAuthSessionStore, type OAuthSessionStore } from "./oauth/oauth-store.js";
import {
  BackgroundOrderSyncRunner,
  startBackgroundOrderSyncScheduler,
} from "./sync/background-scheduler.js";
import { InMemoryOrderRefPersistence, PgOrderRefPersistence } from "./sync/order-persistence.js";
import { startReconcileScheduler } from "./sync/reconcile-scheduler.js";
import { InMemorySyncStateStore, PgSyncStateStore, type SyncStateStore } from "./sync/sync-state.js";
import { PgWebhookDeliveryStore } from "./webhook/pg-store.js";
import { InMemoryWebhookDeliveryStore } from "./webhook/store.js";
import type { WebhookDeliveryStore } from "./webhook/store.js";

function createAppInstallStore(env: Env, pool: Pool | undefined): AppInstallStore {
  if (pool) {
    return new PgAppInstallStore(pool);
  }
  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required when NODE_ENV=production");
  }
  return new InMemoryAppInstallStore();
}

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
const appInstallStore = createAppInstallStore(env, pool);
const commerce7Client = createCommerce7Client(env);
const backgroundSyncRunner = new BackgroundOrderSyncRunner({
  client: commerce7Client,
  syncState: syncStateStore,
  orderPersistence,
});

const webhookBasicAuth =
  env.WEBHOOK_BASIC_USER && env.WEBHOOK_BASIC_PASSWORD
    ? { user: env.WEBHOOK_BASIC_USER, password: env.WEBHOOK_BASIC_PASSWORD }
    : undefined;

const lifecycleBasicAuth =
  env.LIFECYCLE_BASIC_USER && env.LIFECYCLE_BASIC_PASSWORD
    ? { user: env.LIFECYCLE_BASIC_USER, password: env.LIFECYCLE_BASIC_PASSWORD }
    : undefined;

const oauthExchange =
  env.OAUTH_TOKEN_URL && (env.OAUTH_CLIENT_ID ?? env.COMMERCE7_CLIENT_ID) && (env.OAUTH_CLIENT_SECRET ?? env.COMMERCE7_CLIENT_SECRET)
    ? {
        tokenUrl: env.OAUTH_TOKEN_URL,
        clientId: env.OAUTH_CLIENT_ID ?? env.COMMERCE7_CLIENT_ID!,
        clientSecret: env.OAUTH_CLIENT_SECRET ?? env.COMMERCE7_CLIENT_SECRET!,
        redirectUrl: env.OAUTH_REDIRECT_URL,
      }
    : undefined;

const app = createApp({
  env,
  webhookStore,
  webhookBasicAuth,
  webhookSignature: env.WEBHOOK_SIGNATURE_SECRET
    ? {
        secret: env.WEBHOOK_SIGNATURE_SECRET,
        headerName: env.WEBHOOK_SIGNATURE_HEADER,
        algorithm: env.WEBHOOK_SIGNATURE_ALGORITHM,
      }
    : undefined,
  internalApiToken: env.INTERNAL_API_TOKEN,
  lifecycle: { store: appInstallStore, basicAuth: lifecycleBasicAuth },
  sync: {
    client: commerce7Client,
    syncState: syncStateStore,
    orderPersistence,
  },
  reconcileEnabled: true,
  analytics: { store: analyticsStore },
  oauth: { store: oauthStore, exchange: oauthExchange },
  backgroundSync: { runner: backgroundSyncRunner },
});

const backgroundSyncTenants = (env.BACKGROUND_SYNC_TENANTS ?? "")
  .split(",")
  .map((tenantId) => tenantId.trim())
  .filter(Boolean);
const backgroundSyncIncludesInstalls = env.BACKGROUND_SYNC_INCLUDE_INSTALLS === "1";
if (backgroundSyncTenants.length > 0 || backgroundSyncIncludesInstalls) {
  startBackgroundOrderSyncScheduler({
    runner: backgroundSyncRunner,
    tenantIds: backgroundSyncTenants,
    getTenantIds: backgroundSyncIncludesInstalls
      ? () => appInstallStore.listActiveTenantIds()
      : undefined,
    intervalMs: env.BACKGROUND_SYNC_INTERVAL_MS,
    onError: (error) => console.error("@commerce7/api background sync failed", error),
  });
  const sourceLabel = [
    backgroundSyncTenants.length > 0 ? backgroundSyncTenants.join(", ") : null,
    backgroundSyncIncludesInstalls ? "active installs" : null,
  ]
    .filter(Boolean)
    .join(" + ");
  console.log(
    `@commerce7/api background order sync scheduled for ${sourceLabel} every ${env.BACKGROUND_SYNC_INTERVAL_MS}ms`,
  );
}

if (env.ENABLE_SCHEDULED_RECONCILE === "1") {
  startReconcileScheduler({
    installStore: appInstallStore,
    client: commerce7Client,
    syncState: syncStateStore,
    orderPersistence,
    intervalMs: env.RECONCILE_INTERVAL_MS,
    maxSyncBatchesPerTenant: env.RECONCILE_MAX_SYNC_BATCHES_PER_TENANT,
  });
}

const port = env.PORT;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`@commerce7/api listening on http://localhost:${info.port}`);
});
