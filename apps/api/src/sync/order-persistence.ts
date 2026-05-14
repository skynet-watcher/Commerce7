import type { Pool } from "pg";

import type { C7OrderRef } from "../c7/types.js";

export type OrderRefPersistence = {
  upsertOrderRefs(tenantId: string, orders: C7OrderRef[]): Promise<void>;
  countOrders(tenantId: string): Promise<number>;
};

export class InMemoryOrderRefPersistence implements OrderRefPersistence {
  private readonly byTenant = new Map<string, Map<string, string>>();

  async upsertOrderRefs(tenantId: string, orders: C7OrderRef[]): Promise<void> {
    let m = this.byTenant.get(tenantId);
    if (!m) {
      m = new Map();
      this.byTenant.set(tenantId, m);
    }
    for (const o of orders) {
      m.set(o.id, o.updatedAt);
    }
  }

  async countOrders(tenantId: string): Promise<number> {
    return this.byTenant.get(tenantId)?.size ?? 0;
  }

  /** @internal tests */
  async clearTenant(tenantId: string): Promise<void> {
    this.byTenant.delete(tenantId);
  }
}

export class PgOrderRefPersistence implements OrderRefPersistence {
  constructor(private readonly pool: Pool) {}

  async upsertOrderRefs(tenantId: string, orders: C7OrderRef[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      for (const o of orders) {
        await client.query(
          `INSERT INTO synced_orders (tenant_id, order_id, updated_at)
           VALUES ($1, $2, $3::timestamptz)
           ON CONFLICT (tenant_id, order_id)
           DO UPDATE SET updated_at = EXCLUDED.updated_at`,
          [tenantId, o.id, o.updatedAt],
        );
      }
    } finally {
      client.release();
    }
  }

  async countOrders(tenantId: string): Promise<number> {
    const r = await this.pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM synced_orders WHERE tenant_id = $1`,
      [tenantId],
    );
    return Number(r.rows[0]?.n ?? "0");
  }
}
