import type { Pool } from "pg";

import { SYNC_RESOURCE_ORDER, type Commerce7Client } from "../c7/types.js";

export type SyncStateStore = {
  getCursor(tenantId: string, resource: string): Promise<string | null>;
  setCursor(tenantId: string, resource: string, cursor: string): Promise<void>;
  /** After a full cursor walk (`nextCursor === null`), clear so the next job starts at `start`. */
  clearCursor(tenantId: string, resource: string): Promise<void>;
};

export class InMemorySyncStateStore implements SyncStateStore {
  private readonly cursors = new Map<string, string>();

  private key(tenantId: string, resource: string): string {
    return `${tenantId}|${resource}`;
  }

  async getCursor(tenantId: string, resource: string): Promise<string | null> {
    return this.cursors.get(this.key(tenantId, resource)) ?? null;
  }

  async setCursor(tenantId: string, resource: string, cursor: string): Promise<void> {
    this.cursors.set(this.key(tenantId, resource), cursor);
  }

  async clearCursor(tenantId: string, resource: string): Promise<void> {
    this.cursors.delete(this.key(tenantId, resource));
  }
}

export class PgSyncStateStore implements SyncStateStore {
  constructor(private readonly pool: Pool) {}

  async getCursor(tenantId: string, resource: string): Promise<string | null> {
    const r = await this.pool.query<{ cursor: string | null }>(
      `SELECT cursor FROM sync_state WHERE tenant_id = $1 AND resource = $2`,
      [tenantId, resource],
    );
    const row = r.rows[0];
    return row?.cursor ?? null;
  }

  async setCursor(tenantId: string, resource: string, cursor: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO sync_state (tenant_id, resource, cursor, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (tenant_id, resource)
       DO UPDATE SET cursor = EXCLUDED.cursor, updated_at = now()`,
      [tenantId, resource, cursor],
    );
  }

  async clearCursor(tenantId: string, resource: string): Promise<void> {
    await this.pool.query(`DELETE FROM sync_state WHERE tenant_id = $1 AND resource = $2`, [
      tenantId,
      resource,
    ]);
  }
}

export type OrderSyncBatchResult = {
  fetched: number;
  /** `true` when the client returned no further `nextCursor` for this batch. */
  completedWalk: boolean;
  nextCursor: string | null;
  persistedCursor: string | null;
};

/**
 * One cursor step toward listing all orders for a tenant (Commerce7-style pagination).
 */
export async function runOrderSyncStep(
  client: Commerce7Client,
  syncState: SyncStateStore,
  tenantId: string,
): Promise<OrderSyncBatchResult> {
  const stored = await syncState.getCursor(tenantId, SYNC_RESOURCE_ORDER);
  const cursor = stored ?? "start";

  const { orders, nextCursor } = await client.listOrders({
    tenantId,
    cursor,
    limit: 50,
  });

  if (nextCursor !== null) {
    await syncState.setCursor(tenantId, SYNC_RESOURCE_ORDER, nextCursor);
    return {
      fetched: orders.length,
      completedWalk: false,
      nextCursor,
      persistedCursor: nextCursor,
    };
  }

  await syncState.clearCursor(tenantId, SYNC_RESOURCE_ORDER);
  return {
    fetched: orders.length,
    completedWalk: true,
    nextCursor: null,
    persistedCursor: null,
  };
}
