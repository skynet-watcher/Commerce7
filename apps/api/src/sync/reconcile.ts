import type { Commerce7Client } from "../c7/types.js";
import { listAllOrderRefs } from "../c7/walk-orders.js";
import type { OrderRefPersistence } from "./order-persistence.js";

export type ReconcileOrdersResult = {
  tenantId: string;
  localCount: number;
  remoteCount: number;
  match: boolean;
};

/**
 * Compares persisted `synced_orders` count with a **fresh** cursor walk (T9 precursor).
 */
export async function reconcileSyncedOrders(
  client: Commerce7Client,
  persistence: OrderRefPersistence,
  tenantId: string,
): Promise<ReconcileOrdersResult> {
  const remote = await listAllOrderRefs(client, tenantId);
  const localCount = await persistence.countOrders(tenantId);
  const remoteCount = remote.length;
  return {
    tenantId,
    localCount,
    remoteCount,
    match: localCount === remoteCount,
  };
}
