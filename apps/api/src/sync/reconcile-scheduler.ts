import type { Commerce7Client } from "../c7/types.js";
import type { AppInstallStore } from "../lifecycle/install-store.js";
import type { OrderRefPersistence } from "./order-persistence.js";
import { reconcileSyncedOrders, type ReconcileOrdersResult } from "./reconcile.js";
import { runOrderSyncStep, type SyncStateStore } from "./sync-state.js";

export type ReconcileSchedulerOptions = {
  installStore: Pick<AppInstallStore, "listActiveTenantIds">;
  client: Commerce7Client;
  syncState: SyncStateStore;
  orderPersistence: OrderRefPersistence;
  intervalMs: number;
  maxSyncBatchesPerTenant: number;
  logger?: Pick<Console, "info" | "warn" | "error">;
};

export type ReconcileSweepResult = {
  tenantsChecked: number;
  results: ReconcileOrdersResult[];
  errors: { tenantId: string; message: string }[];
};

async function syncTenantToCompletion(
  options: ReconcileSchedulerOptions,
  tenantId: string,
): Promise<void> {
  for (let i = 0; i < options.maxSyncBatchesPerTenant; i += 1) {
    const step = await runOrderSyncStep(options.client, options.syncState, tenantId, {
      orderPersistence: options.orderPersistence,
    });
    if (step.completedWalk) {
      return;
    }
  }
  throw new Error(
    `Exceeded RECONCILE_MAX_SYNC_BATCHES_PER_TENANT=${options.maxSyncBatchesPerTenant}`,
  );
}

export async function runReconcileSweep(
  options: ReconcileSchedulerOptions,
): Promise<ReconcileSweepResult> {
  const tenants = await options.installStore.listActiveTenantIds();
  const results: ReconcileOrdersResult[] = [];
  const errors: { tenantId: string; message: string }[] = [];

  for (const tenantId of tenants) {
    try {
      await syncTenantToCompletion(options, tenantId);
      const result = await reconcileSyncedOrders(
        options.client,
        options.orderPersistence,
        tenantId,
      );
      results.push(result);
      if (!result.match) {
        options.logger?.warn("@commerce7/api reconcile mismatch", result);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ tenantId, message });
      options.logger?.error("@commerce7/api reconcile failed", { tenantId, message });
    }
  }

  return { tenantsChecked: tenants.length, results, errors };
}

export function startReconcileScheduler(options: ReconcileSchedulerOptions): NodeJS.Timeout {
  const logger = options.logger ?? console;
  let running = false;

  const tick = async () => {
    if (running) {
      logger.warn("@commerce7/api reconcile tick skipped; previous sweep still running");
      return;
    }
    running = true;
    try {
      const result = await runReconcileSweep({ ...options, logger });
      logger.info("@commerce7/api reconcile sweep complete", {
        tenantsChecked: result.tenantsChecked,
        mismatches: result.results.filter((r) => !r.match).length,
        errors: result.errors.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("@commerce7/api reconcile sweep crashed", { message });
    } finally {
      running = false;
    }
  };

  void tick();
  const timer = setInterval(() => void tick(), options.intervalMs);
  timer.unref();
  return timer;
}
