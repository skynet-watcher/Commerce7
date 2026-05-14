import type { Pool } from "pg";

export type OAuthCallbackStub = {
  tenantId: string;
  code: string | null;
  error: string | null;
  raw: Record<string, string | undefined>;
};

export type OAuthSessionStore = {
  saveCallbackStub(stub: OAuthCallbackStub): Promise<void>;
  getStub(tenantId: string): Promise<OAuthCallbackStub | null>;
};

export class InMemoryOAuthSessionStore implements OAuthSessionStore {
  private readonly rows = new Map<string, OAuthCallbackStub>();

  async saveCallbackStub(stub: OAuthCallbackStub): Promise<void> {
    this.rows.set(stub.tenantId, stub);
  }

  async getStub(tenantId: string): Promise<OAuthCallbackStub | null> {
    return this.rows.get(tenantId) ?? null;
  }
}

export class PgOAuthSessionStore implements OAuthSessionStore {
  constructor(private readonly pool: Pool) {}

  async saveCallbackStub(stub: OAuthCallbackStub): Promise<void> {
    await this.pool.query(
      `INSERT INTO oauth_sessions (tenant_id, last_code, last_error, raw, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, now())
       ON CONFLICT (tenant_id) DO UPDATE SET
         last_code = EXCLUDED.last_code,
         last_error = EXCLUDED.last_error,
         raw = EXCLUDED.raw,
         updated_at = now()`,
      [stub.tenantId, stub.code, stub.error, JSON.stringify(stub.raw)],
    );
  }

  async getStub(tenantId: string): Promise<OAuthCallbackStub | null> {
    const r = await this.pool.query<{
      last_code: string | null;
      last_error: string | null;
      raw: unknown;
    }>(`SELECT last_code, last_error, raw FROM oauth_sessions WHERE tenant_id = $1`, [tenantId]);
    const row = r.rows[0];
    if (!row) {
      return null;
    }
    return {
      tenantId,
      code: row.last_code,
      error: row.last_error,
      raw: (row.raw as Record<string, string | undefined>) ?? {},
    };
  }
}
