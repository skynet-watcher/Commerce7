import type { Pool } from "pg";

export type OAuthCallbackStub = {
  tenantId: string;
  code: string | null;
  error: string | null;
  raw: Record<string, string | undefined>;
};

export type OAuthTokenSession = {
  tenantId: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  raw: Record<string, unknown>;
  updatedAt: string;
};

export type OAuthTokenWrite = {
  tenantId: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  raw: Record<string, unknown>;
};

export type OAuthSessionStore = {
  saveCallbackStub(stub: OAuthCallbackStub): Promise<void>;
  getStub(tenantId: string): Promise<OAuthCallbackStub | null>;
  saveTokenSession?(session: OAuthTokenWrite): Promise<void>;
  getTokenSession?(tenantId: string): Promise<OAuthTokenSession | null>;
};

export class InMemoryOAuthSessionStore implements OAuthSessionStore {
  private readonly rows = new Map<string, OAuthCallbackStub>();
  private readonly tokens = new Map<string, OAuthTokenSession>();

  async saveCallbackStub(stub: OAuthCallbackStub): Promise<void> {
    this.rows.set(stub.tenantId, stub);
  }

  async getStub(tenantId: string): Promise<OAuthCallbackStub | null> {
    return this.rows.get(tenantId) ?? null;
  }

  async saveTokenSession(session: OAuthTokenWrite): Promise<void> {
    this.tokens.set(session.tenantId, {
      tenantId: session.tenantId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt?.toISOString() ?? null,
      raw: session.raw,
      updatedAt: new Date().toISOString(),
    });
  }

  async getTokenSession(tenantId: string): Promise<OAuthTokenSession | null> {
    return this.tokens.get(tenantId) ?? null;
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

  async saveTokenSession(session: OAuthTokenWrite): Promise<void> {
    await this.pool.query(
      `INSERT INTO oauth_sessions (
         tenant_id, access_token, refresh_token, expires_at, raw, updated_at
       )
       VALUES ($1, $2, $3, $4, $5::jsonb, now())
       ON CONFLICT (tenant_id) DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         expires_at = EXCLUDED.expires_at,
         raw = COALESCE(oauth_sessions.raw, '{}'::jsonb) || EXCLUDED.raw,
         updated_at = now()`,
      [
        session.tenantId,
        session.accessToken,
        session.refreshToken,
        session.expiresAt,
        JSON.stringify(session.raw),
      ],
    );
  }

  async getTokenSession(tenantId: string): Promise<OAuthTokenSession | null> {
    const r = await this.pool.query<{
      access_token: string | null;
      refresh_token: string | null;
      expires_at: Date | string | null;
      raw: unknown;
      updated_at: Date | string;
    }>(
      `SELECT access_token, refresh_token, expires_at, raw, updated_at
       FROM oauth_sessions WHERE tenant_id = $1`,
      [tenantId],
    );
    const row = r.rows[0];
    if (!row) {
      return null;
    }
    return {
      tenantId,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
      raw: (row.raw as Record<string, unknown>) ?? {},
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }
}
