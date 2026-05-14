import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Pool } from "pg";

import { createApp } from "../create-app.js";
import { createPool } from "../db/pool.js";
import { runMigrations } from "../db/run-migrations.js";
import { loadEnv } from "../env.js";
import { PgWebhookDeliveryStore } from "./pg-store.js";

const testDbUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!testDbUrl)("POST /webhooks/commerce7 (Postgres store)", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = createPool(testDbUrl!);
    await runMigrations(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE webhook_deliveries");
  });

  it("stores first delivery and marks duplicate on retry", async () => {
    const store = new PgWebhookDeliveryStore(pool);
    const env = loadEnv();
    const app = createApp({ env, webhookStore: store });
    const body = {
      object: "Order",
      action: "Update",
      payload: { id: "o-pg-1", updatedAt: "2024-01-01T00:00:00.000Z" },
      tenantId: "tenant-pg",
    };

    const res1 = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(res1.status).toBe(200);
    const j1 = (await res1.json()) as { duplicate: boolean };
    expect(j1.duplicate).toBe(false);

    const res2 = await app.request("http://localhost/webhooks/commerce7", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(res2.status).toBe(200);
    const j2 = (await res2.json()) as { duplicate: boolean };
    expect(j2.duplicate).toBe(true);

    const count = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM webhook_deliveries`);
    expect(count.rows[0]?.n).toBe("1");
  });
});
