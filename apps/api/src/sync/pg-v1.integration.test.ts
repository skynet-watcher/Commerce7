import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { createPool } from "../db/pool.js";
import { runMigrations } from "../db/run-migrations.js";
import { PgAnalyticsEventStore } from "../events/analytics-store.js";
import { analyticsEventBodySchema } from "../events/analytics-schema.js";
import { PgOAuthSessionStore } from "../oauth/oauth-store.js";
import { PgOrderRefPersistence } from "./order-persistence.js";
import { reconcileSyncedOrders } from "./reconcile.js";
import { PgSyncStateStore } from "./sync-state.js";
import { runOrderSyncStep } from "./sync-state.js";
import type { Pool } from "pg";

const testDbUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!testDbUrl)("Postgres V1 tables (integration)", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = createPool(testDbUrl!);
    await runMigrations(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query(
      `TRUNCATE analytics_events, oauth_sessions, synced_orders, sync_state, webhook_deliveries RESTART IDENTITY`,
    );
  });

  it("analytics idempotency + oauth + order persistence + reconcile", async () => {
    const tenant = "pg-v1";
    const analytics = new PgAnalyticsEventStore(pool);
    const oauth = new PgOAuthSessionStore(pool);
    const orders = new PgOrderRefPersistence(pool);
    const syncState = new PgSyncStateStore(pool);
    const client = MockCommerce7Client.twoPageDemo();

    const body = analyticsEventBodySchema.parse({
      tenantId: tenant,
      clientEventId: "e1",
      name: "test",
    });
    expect((await analytics.record({ tenantId: tenant, clientEventId: "e1", body })).duplicate).toBe(false);
    expect((await analytics.record({ tenantId: tenant, clientEventId: "e1", body })).duplicate).toBe(true);

    await oauth.saveCallbackStub({
      tenantId: tenant,
      code: "c",
      error: null,
      raw: { x: "y" },
    });
    const o = await oauth.getStub(tenant);
    expect(o?.code).toBe("c");

    await runOrderSyncStep(client, syncState, tenant, { orderPersistence: orders });
    await runOrderSyncStep(client, syncState, tenant, { orderPersistence: orders });
    const rec = await reconcileSyncedOrders(client, orders, tenant);
    expect(rec.match).toBe(true);
  });
});
