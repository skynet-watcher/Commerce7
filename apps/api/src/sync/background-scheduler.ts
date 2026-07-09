import type { Commerce7Client } from "../c7/types.js";
import type { OrderRefPersistence } from "./order-persistence.js";
import { runOrderSyncStep, type SyncStateStore } from "./sync-state.js";

export type SyncRunStatus = {
  tenantId: string;
  running: boolean;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastOk: boolean | null;
  lastError: string | null;
  lastFetched: number | null;
  lastCompletedWalk: boolean | null;
  runs: number;
};

export type BackgroundOrderSyncRunnerOptions = {
  client: Commerce7Client;
  syncState: SyncStateStore;
  orderPersistence?: OrderRefPersistence;
};

export class BackgroundOrderSyncRunner {
  private readonly statuses = new Map<string, SyncRunStatus>();

  constructor(private readonly options: BackgroundOrderSyncRunnerOptions) {}

  private getOrCreateStatus(tenantId: string): SyncRunStatus {
    const existing = this.statuses.get(tenantId);
    if (existing) {
      return existing;
    }
    const created: SyncRunStatus = {
      tenantId,
      running: false,
      lastStartedAt: null,
      lastFinishedAt: null,
      lastOk: null,
      lastError: null,
      lastFetched: null,
      lastCompletedWalk: null,
      runs: 0,
    };
    this.statuses.set(tenantId, created);
    return created;
  }

  status(tenantId?: string): SyncRunStatus[] {
    if (tenantId) {
      return [this.getOrCreateStatus(tenantId)];
    }
    return Array.from(this.statuses.values()).sort((a, b) =>
      a.tenantId.localeCompare(b.tenantId),
    );
  }

  async runOnce(tenantId: string): Promise<SyncRunStatus> {
    const status = this.getOrCreateStatus(tenantId);
    if (status.running) {
      return status;
    }

    status.running = true;
    status.lastStartedAt = new Date().toISOString();
    status.lastFinishedAt = null;
    status.lastError = null;

    try {
      const result = await runOrderSyncStep(
        this.options.client,
        this.options.syncState,
        tenantId,
        { orderPersistence: this.options.orderPersistence },
      );
      status.lastOk = true;
      status.lastFetched = result.fetched;
      status.lastCompletedWalk = result.completedWalk;
      status.runs += 1;
    } catch (error) {
      status.lastOk = false;
      status.lastError = error instanceof Error ? error.message : String(error);
      status.runs += 1;
    } finally {
      status.running = false;
      status.lastFinishedAt = new Date().toISOString();
    }

    return status;
  }
}

export function startBackgroundOrderSyncScheduler(options: {
  runner: BackgroundOrderSyncRunner;
  tenantIds?: string[];
  getTenantIds?: () => Promise<string[]>;
  intervalMs: number;
  onError?: (error: unknown) => void;
}): { stop: () => void } {
  const tick = () => {
    void resolveTenantIds(options)
      .then((tenantIds) => {
        for (const tenantId of tenantIds) {
          void options.runner.runOnce(tenantId).catch((error) => {
            options.onError?.(error);
          });
        }
      })
      .catch((error) => {
        options.onError?.(error);
      });
  };

  tick();
  const timer = setInterval(tick, options.intervalMs);
  timer.unref?.();
  return {
    stop: () => clearInterval(timer),
  };
}

async function resolveTenantIds(options: {
  tenantIds?: string[];
  getTenantIds?: () => Promise<string[]>;
}): Promise<string[]> {
  const configured = options.tenantIds ?? [];
  const discovered = options.getTenantIds ? await options.getTenantIds() : [];
  return Array.from(new Set([...configured, ...discovered].map((tenantId) => tenantId.trim()).filter(Boolean))).sort();
}
