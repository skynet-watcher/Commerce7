import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type { StrategyOffer, StrategyRecord, StrategySnapshot } from "./schema.js";

export type StrategyWrite = Omit<StrategyRecord, "id" | "status" | "endedAt">;

export type StrategyStore = {
  create(row: StrategyWrite): Promise<StrategyRecord>;
  get(tenantId: string, id: string): Promise<StrategyRecord | null>;
  listByTenant(tenantId: string): Promise<StrategyRecord[]>;
  markEnded(tenantId: string, id: string, endedAt: Date): Promise<StrategyRecord | null>;
  /** Attach the Commerce7 promotion id after a successful push. */
  setPromotionId(tenantId: string, id: string, promotionId: string): Promise<void>;
};

export class InMemoryStrategyStore implements StrategyStore {
  private readonly rows = new Map<string, StrategyRecord>();

  async create(row: StrategyWrite): Promise<StrategyRecord> {
    const record: StrategyRecord = { ...row, id: randomUUID(), status: "running", endedAt: null };
    this.rows.set(record.id, record);
    return record;
  }

  async get(tenantId: string, id: string): Promise<StrategyRecord | null> {
    const row = this.rows.get(id);
    return row && row.tenantId === tenantId ? row : null;
  }

  async listByTenant(tenantId: string): Promise<StrategyRecord[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.tenantId === tenantId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async markEnded(tenantId: string, id: string, endedAt: Date): Promise<StrategyRecord | null> {
    const row = await this.get(tenantId, id);
    if (!row || row.status === "ended") return row;
    const next: StrategyRecord = { ...row, status: "ended", endedAt };
    this.rows.set(id, next);
    return next;
  }

  async setPromotionId(tenantId: string, id: string, promotionId: string): Promise<void> {
    const row = await this.get(tenantId, id);
    if (!row) return;
    this.rows.set(id, { ...row, promotionId });
  }
}

type StrategyRow = {
  id: string;
  tenant_id: string;
  title: string;
  message: string;
  offer: unknown;
  promotion_id: string | null;
  started_at: Date;
  review_at: Date;
  test_days: number;
  baseline: unknown;
  status: string;
  ended_at: Date | null;
};

function fromRow(row: StrategyRow): StrategyRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    title: row.title,
    message: row.message,
    offer: (row.offer as StrategyOffer | null) ?? null,
    promotionId: row.promotion_id,
    startedAt: row.started_at,
    reviewAt: row.review_at,
    testDays: row.test_days,
    baseline: row.baseline as StrategySnapshot,
    status: row.status === "ended" ? "ended" : "running",
    endedAt: row.ended_at,
  };
}

export class PgStrategyStore implements StrategyStore {
  constructor(private readonly pool: Pool) {}

  async create(row: StrategyWrite): Promise<StrategyRecord> {
    const id = randomUUID();
    const r = await this.pool.query<StrategyRow>(
      `INSERT INTO strategies (id, tenant_id, title, message, offer, promotion_id, started_at, review_at, test_days, baseline, status, ended_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10::jsonb, 'running', NULL)
       RETURNING id, tenant_id, title, message, offer, promotion_id, started_at, review_at, test_days, baseline, status, ended_at`,
      [
        id,
        row.tenantId,
        row.title,
        row.message,
        row.offer ? JSON.stringify(row.offer) : null,
        row.promotionId,
        row.startedAt,
        row.reviewAt,
        row.testDays,
        JSON.stringify(row.baseline),
      ],
    );
    const created = r.rows[0];
    if (!created) {
      throw new Error("strategies insert returned no row");
    }
    return fromRow(created);
  }

  async get(tenantId: string, id: string): Promise<StrategyRecord | null> {
    const r = await this.pool.query<StrategyRow>(
      `SELECT id, tenant_id, title, message, offer, promotion_id, started_at, review_at, test_days, baseline, status, ended_at
       FROM strategies WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id],
    );
    return r.rows[0] ? fromRow(r.rows[0]) : null;
  }

  async listByTenant(tenantId: string): Promise<StrategyRecord[]> {
    const r = await this.pool.query<StrategyRow>(
      `SELECT id, tenant_id, title, message, offer, promotion_id, started_at, review_at, test_days, baseline, status, ended_at
       FROM strategies WHERE tenant_id = $1 ORDER BY started_at DESC`,
      [tenantId],
    );
    return r.rows.map(fromRow);
  }

  async markEnded(tenantId: string, id: string, endedAt: Date): Promise<StrategyRecord | null> {
    const r = await this.pool.query<StrategyRow>(
      `UPDATE strategies SET status = 'ended', ended_at = $3
       WHERE tenant_id = $1 AND id = $2 AND status <> 'ended'
       RETURNING id, tenant_id, title, message, offer, promotion_id, started_at, review_at, test_days, baseline, status, ended_at`,
      [tenantId, id, endedAt],
    );
    if (r.rows[0]) return fromRow(r.rows[0]);
    return this.get(tenantId, id);
  }

  async setPromotionId(tenantId: string, id: string, promotionId: string): Promise<void> {
    await this.pool.query(
      `UPDATE strategies SET promotion_id = $3 WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id, promotionId],
    );
  }
}
