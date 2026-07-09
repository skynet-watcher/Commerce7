import type { Pool } from "pg";

import {
  blockTitleFromBody,
  isConversionLikeEventName,
  recommendedSkuFromBody,
  SURFACE_CART_CARROT,
  SURFACE_PERSONALIZATION_BLOCK,
  surfaceFromBody,
} from "./analytics-contract.js";
import type {
  AnalyticsEventBody,
  AnalyticsEventStore,
  AnalyticsTenantSummary,
  CartCarrotBreakdown,
  CartCarrotRow,
  PersonalizationBlockRow,
  PersonalizationBreakdown,
  SurfaceEngagementSlice,
} from "./analytics-schema.js";

type StoredEventRow = {
  tenantId: string;
  name: string;
  surface: string;
  blockTitle: string | null;
  recommendedSku: string | null;
  recommendedTitle: string | null;
  receivedAt: Date;
};

function emptySlice(): SurfaceEngagementSlice {
  return { byEventName: {}, total: 0 };
}

export class InMemoryAnalyticsEventStore implements AnalyticsEventStore {
  private readonly keys = new Set<string>();
  private readonly rows: StoredEventRow[] = [];

  async record(input: {
    tenantId: string;
    clientEventId: string;
    body: AnalyticsEventBody;
  }): Promise<{ duplicate: boolean }> {
    const key = `${input.tenantId}:${input.clientEventId}`;
    if (this.keys.has(key)) {
      return { duplicate: true };
    }
    this.keys.add(key);
    const rawTitle = input.body.properties?.recommendedProductTitle;
    this.rows.push({
      tenantId: input.tenantId,
      name: input.body.name,
      surface: surfaceFromBody(input.body),
      blockTitle: blockTitleFromBody(input.body),
      recommendedSku: recommendedSkuFromBody(input.body),
      recommendedTitle:
        typeof rawTitle === "string" && rawTitle.trim().length > 0 ? rawTitle.trim() : null,
      receivedAt: new Date(),
    });
    return { duplicate: false };
  }

  async summarizeTenant(
    tenantId: string,
    range?: { startDate?: Date | undefined; endDate?: Date | undefined },
  ): Promise<AnalyticsTenantSummary> {
    const mine = this.rows.filter((r) => {
      if (r.tenantId !== tenantId) return false;
      if (range?.startDate && r.receivedAt < range.startDate) return false;
      if (range?.endDate && r.receivedAt > range.endDate) return false;
      return true;
    });
    const byName: Record<string, number> = {};
    const bySurface: Record<string, number> = {};
    const cartCarrot = emptySlice();
    const personalizationBlock = emptySlice();
    let conversionLikeEvents = 0;

    for (const r of mine) {
      byName[r.name] = (byName[r.name] ?? 0) + 1;
      bySurface[r.surface] = (bySurface[r.surface] ?? 0) + 1;

      if (r.surface === SURFACE_CART_CARROT) {
        cartCarrot.total += 1;
        cartCarrot.byEventName[r.name] = (cartCarrot.byEventName[r.name] ?? 0) + 1;
      }
      if (r.surface === SURFACE_PERSONALIZATION_BLOCK) {
        personalizationBlock.total += 1;
        personalizationBlock.byEventName[r.name] =
          (personalizationBlock.byEventName[r.name] ?? 0) + 1;
      }
      if (isConversionLikeEventName(r.name)) {
        conversionLikeEvents += 1;
      }
    }

    const recent = [...mine]
      .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())
      .slice(0, 8)
      .map((r) => ({
        name: r.name,
        surface: r.surface,
        receivedAt: r.receivedAt.toISOString(),
      }));

    // Build per-carrot breakdown
    const ccEventRows = mine.filter((r) => r.surface === SURFACE_CART_CARROT);
    const ccMap = new Map<string, CartCarrotRow>();
    for (const r of ccEventRows) {
      const key = `${r.blockTitle ?? "unknown"}|||${r.recommendedSku ?? ""}`;
      let row = ccMap.get(key);
      if (!row) {
        row = {
          blockTitle: r.blockTitle ?? "unknown",
          recommendedSku: r.recommendedSku,
          recommendedTitle: r.recommendedTitle,
          byEventName: {},
          total: 0,
        };
        ccMap.set(key, row);
      }
      row.byEventName[r.name] = (row.byEventName[r.name] ?? 0) + 1;
      row.total += 1;
      if (!row.recommendedTitle && r.recommendedTitle) {
        row.recommendedTitle = r.recommendedTitle;
      }
    }
    const sortedCcRows = [...ccMap.values()].sort((a, b) => {
      const imp = (row: CartCarrotRow) => row.byEventName.impression ?? 0;
      const adds = (row: CartCarrotRow) => row.byEventName.add_to_cart ?? 0;
      const aRate = imp(a) > 0 ? adds(a) / imp(a) : 0;
      const bRate = imp(b) > 0 ? adds(b) / imp(b) : 0;
      return bRate - aRate;
    });
    const cartCarrotBreakdown: CartCarrotBreakdown = {
      rows: sortedCcRows,
      hasBlockTitleData: ccEventRows.some((r) => r.blockTitle !== null),
    };

    // Build per-block personalization breakdown
    const pbEventRows = mine.filter((r) => r.surface === SURFACE_PERSONALIZATION_BLOCK);
    const pbMap = new Map<string, PersonalizationBlockRow>();
    for (const r of pbEventRows) {
      const key = r.blockTitle ?? "unknown";
      let row = pbMap.get(key);
      if (!row) {
        row = {
          blockTitle: key,
          byEventName: {},
          total: 0,
        };
        pbMap.set(key, row);
      }
      row.byEventName[r.name] = (row.byEventName[r.name] ?? 0) + 1;
      row.total += 1;
    }
    const sortedPbRows = [...pbMap.values()].sort((a, b) => {
      const imp = (row: PersonalizationBlockRow) => row.byEventName.impression ?? 0;
      const adds = (row: PersonalizationBlockRow) => row.byEventName.add_to_cart ?? 0;
      const aRate = imp(a) > 0 ? adds(a) / imp(a) : 0;
      const bRate = imp(b) > 0 ? adds(b) / imp(b) : 0;
      return bRate - aRate;
    });
    const personalizationBreakdown: PersonalizationBreakdown = {
      rows: sortedPbRows,
      hasBlockTitleData: pbEventRows.some((r) => r.blockTitle !== null),
    };

    return {
      totalEvents: mine.length,
      byName,
      bySurface,
      cartCarrot,
      personalizationBlock,
      conversionLikeEvents,
      recent,
      cartCarrotBreakdown,
      personalizationBreakdown,
    };
  }
}

export class PgAnalyticsEventStore implements AnalyticsEventStore {
  constructor(private readonly pool: Pool) {}

  async record(input: {
    tenantId: string;
    clientEventId: string;
    body: AnalyticsEventBody;
  }): Promise<{ duplicate: boolean }> {
    const idempotencyKey = `${input.tenantId}:${input.clientEventId}`;
    const ins = await this.pool.query(
      `INSERT INTO analytics_events (idempotency_key, tenant_id, body, received_at)
       VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [idempotencyKey, input.tenantId, JSON.stringify(input.body)],
    );
    return { duplicate: ins.rowCount === 0 };
  }

  async summarizeTenant(
    tenantId: string,
    range?: { startDate?: Date | undefined; endDate?: Date | undefined },
  ): Promise<AnalyticsTenantSummary> {
    const where = ["tenant_id = $1"];
    const params: unknown[] = [tenantId];
    if (range?.startDate) {
      params.push(range.startDate);
      where.push(`received_at >= $${params.length}`);
    }
    if (range?.endDate) {
      params.push(range.endDate);
      where.push(`received_at <= $${params.length}`);
    }
    const whereSql = where.join(" AND ");

    const counts = await this.pool.query<{ name: string; c: string }>(
      `SELECT COALESCE(body->>'name', 'unknown') AS name, COUNT(*)::text AS c
       FROM analytics_events WHERE ${whereSql}
       GROUP BY COALESCE(body->>'name', 'unknown')
       ORDER BY COUNT(*) DESC`,
      params,
    );
    const surfaceCounts = await this.pool.query<{ surface: string; c: string }>(
      `SELECT COALESCE(body #>> '{properties,surface}', 'unknown') AS surface, COUNT(*)::text AS c
       FROM analytics_events WHERE ${whereSql}
       GROUP BY COALESCE(body #>> '{properties,surface}', 'unknown')
       ORDER BY COUNT(*) DESC`,
      params,
    );
    const totalRow = await this.pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM analytics_events WHERE ${whereSql}`,
      params,
    );
    const carrotRows = await this.pool.query<{ name: string; c: string }>(
      `SELECT COALESCE(body->>'name', 'unknown') AS name, COUNT(*)::text AS c
       FROM analytics_events
       WHERE ${whereSql} AND COALESCE(body #>> '{properties,surface}', 'unknown') = $${params.length + 1}
       GROUP BY COALESCE(body->>'name', 'unknown')`,
      [...params, SURFACE_CART_CARROT],
    );
    const blockRows = await this.pool.query<{ name: string; c: string }>(
      `SELECT COALESCE(body->>'name', 'unknown') AS name, COUNT(*)::text AS c
       FROM analytics_events
       WHERE ${whereSql} AND COALESCE(body #>> '{properties,surface}', 'unknown') = $${params.length + 1}
       GROUP BY COALESCE(body->>'name', 'unknown')`,
      [...params, SURFACE_PERSONALIZATION_BLOCK],
    );
    const convRow = await this.pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM analytics_events
       WHERE ${whereSql}
       AND LOWER(COALESCE(body->>'name', '')) IN ('purchase', 'order_completed', 'checkout_completed', 'conversion')`,
      params,
    );
    const ccBreakdownRows = await this.pool.query<{
      block_title: string;
      recommended_sku: string | null;
      recommended_title: string | null;
      event_name: string;
      c: string;
    }>(
      `SELECT
         COALESCE(body #>> '{properties,blockTitle}', 'unknown') AS block_title,
         body #>> '{properties,recommendedProductSku}'           AS recommended_sku,
         MAX(body #>> '{properties,recommendedProductTitle}')    AS recommended_title,
         COALESCE(body->>'name', 'unknown')                      AS event_name,
         COUNT(*)::text                                          AS c
       FROM analytics_events
       WHERE ${whereSql}
         AND COALESCE(body #>> '{properties,surface}', '') = $${params.length + 1}
       GROUP BY 1, 2, 4
       ORDER BY 1, 2`,
      [...params, SURFACE_CART_CARROT],
    );
    const pbBreakdownRows = await this.pool.query<{
      block_title: string;
      event_name: string;
      c: string;
    }>(
      `SELECT
         COALESCE(body #>> '{properties,blockTitle}', 'unknown') AS block_title,
         COALESCE(body->>'name', 'unknown')                      AS event_name,
         COUNT(*)::text                                          AS c
       FROM analytics_events
       WHERE ${whereSql}
         AND COALESCE(body #>> '{properties,surface}', '') = $${params.length + 1}
       GROUP BY 1, 2
       ORDER BY 1`,
      [...params, SURFACE_PERSONALIZATION_BLOCK],
    );
    const recentQ = await this.pool.query<{ name: string; surface: string; received_at: Date }>(
      `SELECT COALESCE(body->>'name', 'unknown') AS name,
              COALESCE(body #>> '{properties,surface}', 'unknown') AS surface,
              received_at
       FROM analytics_events WHERE ${whereSql}
       ORDER BY received_at DESC LIMIT 8`,
      params,
    );

    const byName: Record<string, number> = {};
    for (const row of counts.rows) {
      byName[row.name] = Number.parseInt(row.c, 10);
    }
    const bySurface: Record<string, number> = {};
    for (const row of surfaceCounts.rows) {
      bySurface[row.surface] = Number.parseInt(row.c, 10);
    }

    const cartCarrot = emptySlice();
    for (const row of carrotRows.rows) {
      const n = Number.parseInt(row.c, 10);
      cartCarrot.byEventName[row.name] = n;
      cartCarrot.total += n;
    }

    const personalizationBlock = emptySlice();
    for (const row of blockRows.rows) {
      const n = Number.parseInt(row.c, 10);
      personalizationBlock.byEventName[row.name] = n;
      personalizationBlock.total += n;
    }

    const totalEvents = Number.parseInt(totalRow.rows[0]?.n ?? "0", 10);
    const conversionLikeEvents = Number.parseInt(convRow.rows[0]?.n ?? "0", 10);
    const recent = recentQ.rows.map((r) => ({
      name: r.name,
      surface: r.surface,
      receivedAt: r.received_at.toISOString(),
    }));

    // Assemble per-carrot breakdown
    const ccBreakdownMap = new Map<string, CartCarrotRow>();
    for (const row of ccBreakdownRows.rows) {
      const key = `${row.block_title}|||${row.recommended_sku ?? ""}`;
      let ccRow = ccBreakdownMap.get(key);
      if (!ccRow) {
        ccRow = {
          blockTitle: row.block_title,
          recommendedSku: row.recommended_sku,
          recommendedTitle: row.recommended_title,
          byEventName: {},
          total: 0,
        };
        ccBreakdownMap.set(key, ccRow);
      }
      const n = Number.parseInt(row.c, 10);
      ccRow.byEventName[row.event_name] = n;
      ccRow.total += n;
      if (!ccRow.recommendedTitle && row.recommended_title) {
        ccRow.recommendedTitle = row.recommended_title;
      }
    }
    const sortedCcBreakdownRows = [...ccBreakdownMap.values()].sort((a, b) => {
      const imp = (r: CartCarrotRow) => r.byEventName.impression ?? 0;
      const adds = (r: CartCarrotRow) => r.byEventName.add_to_cart ?? 0;
      const aRate = imp(a) > 0 ? adds(a) / imp(a) : 0;
      const bRate = imp(b) > 0 ? adds(b) / imp(b) : 0;
      return bRate - aRate;
    });
    const cartCarrotBreakdown: CartCarrotBreakdown = {
      rows: sortedCcBreakdownRows,
      hasBlockTitleData: sortedCcBreakdownRows.some((r) => r.blockTitle !== "unknown"),
    };

    // Assemble per-block personalization breakdown
    const pbBreakdownMap = new Map<string, PersonalizationBlockRow>();
    for (const row of pbBreakdownRows.rows) {
      let pbRow = pbBreakdownMap.get(row.block_title);
      if (!pbRow) {
        pbRow = {
          blockTitle: row.block_title,
          byEventName: {},
          total: 0,
        };
        pbBreakdownMap.set(row.block_title, pbRow);
      }
      const n = Number.parseInt(row.c, 10);
      pbRow.byEventName[row.event_name] = n;
      pbRow.total += n;
    }
    const sortedPbBreakdownRows = [...pbBreakdownMap.values()].sort((a, b) => {
      const imp = (r: PersonalizationBlockRow) => r.byEventName.impression ?? 0;
      const adds = (r: PersonalizationBlockRow) => r.byEventName.add_to_cart ?? 0;
      const aRate = imp(a) > 0 ? adds(a) / imp(a) : 0;
      const bRate = imp(b) > 0 ? adds(b) / imp(b) : 0;
      return bRate - aRate;
    });
    const personalizationBreakdown: PersonalizationBreakdown = {
      rows: sortedPbBreakdownRows,
      hasBlockTitleData: sortedPbBreakdownRows.some((r) => r.blockTitle !== "unknown"),
    };

    return {
      totalEvents,
      byName,
      bySurface,
      cartCarrot,
      personalizationBlock,
      conversionLikeEvents,
      recent,
      cartCarrotBreakdown,
      personalizationBreakdown,
    };
  }
}
