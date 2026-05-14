import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Pool } from "pg";

import { MockCommerce7Client } from "../c7/mock-client.js";
import { SYNC_RESOURCE_ORDER } from "../c7/types.js";
import { createPool } from "../db/pool.js";
import { runMigrations } from "../db/run-migrations.js";
import { PgSyncStateStore, runOrderSyncStep } from "./sync-state.js";

const testDbUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!testDbUrl)("sync_state (Postgres)", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = createPool(testDbUrl!);
    await runMigrations(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE sync_state");
  });

  it("persists cursor between runOrderSyncStep calls", async () => {
    const sync = new PgSyncStateStore(pool);
    const client = MockCommerce7Client.twoPageDemo();
    const tenant = "pg-sync-tenant";

    const s1 = await runOrderSyncStep(client, sync, tenant);
    expect(s1.completedWalk).toBe(false);
    const row1 = await pool.query(`SELECT cursor FROM sync_state WHERE tenant_id = $1 AND resource = $2`, [
      tenant,
      SYNC_RESOURCE_ORDER,
    ]);
    expect(row1.rows[0]?.cursor).toBe("page-2");

    const s2 = await runOrderSyncStep(client, sync, tenant);
    expect(s2.completedWalk).toBe(true);
    const row2 = await pool.query(`SELECT count(*)::text AS n FROM sync_state WHERE tenant_id = $1`, [tenant]);
    expect(row2.rows[0]?.n).toBe("0");
  });
});
