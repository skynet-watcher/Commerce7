import type { Commerce7Client } from "./types.js";

/**
 * Full cursor walk starting at `start`, independent of `sync_state` (for reconciliation).
 */
export async function listAllOrderRefs(client: Commerce7Client, tenantId: string): Promise<
  { id: string; updatedAt: string }[]
> {
  const out: { id: string; updatedAt: string }[] = [];
  let cursor = "start";
  for (;;) {
    const { orders, nextCursor } = await client.listOrders({ tenantId, cursor, limit: 50 });
    out.push(...orders);
    if (nextCursor === null) {
      break;
    }
    cursor = nextCursor;
  }
  return out;
}
