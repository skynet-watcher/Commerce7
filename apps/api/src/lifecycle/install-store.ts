import type { Pool } from "pg";

import type { AppInstallRecord, AppInstallWrite } from "./install-schema.js";

export type AppInstallStore = {
  recordInstall(row: AppInstallWrite): Promise<void>;
  recordUninstall(tenantId: string): Promise<void>;
  getInstall(tenantId: string): Promise<AppInstallRecord | null>;
};

export class InMemoryAppInstallStore implements AppInstallStore {
  private readonly rows = new Map<string, AppInstallRecord>();

  async recordInstall(row: AppInstallWrite): Promise<void> {
    const prev = this.rows.get(row.tenantId);
    const installedAt =
      !prev || prev.uninstalledAt !== null ? new Date() : prev.installedAt;
    this.rows.set(row.tenantId, {
      ...row,
      installedAt,
      uninstalledAt: null,
    });
  }

  async recordUninstall(tenantId: string): Promise<void> {
    const prev = this.rows.get(tenantId);
    if (!prev) {
      return;
    }
    this.rows.set(tenantId, { ...prev, uninstalledAt: new Date() });
  }

  async getInstall(tenantId: string): Promise<AppInstallRecord | null> {
    return this.rows.get(tenantId) ?? null;
  }
}

export class PgAppInstallStore implements AppInstallStore {
  constructor(private readonly pool: Pool) {}

  async recordInstall(row: AppInstallWrite): Promise<void> {
    await this.pool.query(
      `INSERT INTO app_installs (tenant_id, installer_email, installer_first_name, installer_last_name, raw, installed_at, uninstalled_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, now(), NULL, now())
       ON CONFLICT (tenant_id) DO UPDATE SET
         installer_email = EXCLUDED.installer_email,
         installer_first_name = EXCLUDED.installer_first_name,
         installer_last_name = EXCLUDED.installer_last_name,
         raw = EXCLUDED.raw,
         uninstalled_at = NULL,
         installed_at = CASE WHEN app_installs.uninstalled_at IS NOT NULL THEN now() ELSE app_installs.installed_at END,
         updated_at = now()`,
      [
        row.tenantId,
        row.installerEmail,
        row.installerFirstName,
        row.installerLastName,
        JSON.stringify(row.raw),
      ],
    );
  }

  async recordUninstall(tenantId: string): Promise<void> {
    await this.pool.query(
      `UPDATE app_installs SET uninstalled_at = now(), updated_at = now() WHERE tenant_id = $1 AND uninstalled_at IS NULL`,
      [tenantId],
    );
  }

  async getInstall(tenantId: string): Promise<AppInstallRecord | null> {
    const r = await this.pool.query<{
      tenant_id: string;
      installer_email: string | null;
      installer_first_name: string | null;
      installer_last_name: string | null;
      raw: unknown;
      installed_at: Date;
      uninstalled_at: Date | null;
    }>(
      `SELECT tenant_id, installer_email, installer_first_name, installer_last_name, raw, installed_at, uninstalled_at
       FROM app_installs WHERE tenant_id = $1`,
      [tenantId],
    );
    const row = r.rows[0];
    if (!row) {
      return null;
    }
    return {
      tenantId: row.tenant_id,
      installerEmail: row.installer_email,
      installerFirstName: row.installer_first_name,
      installerLastName: row.installer_last_name,
      raw: (row.raw as Record<string, unknown>) ?? {},
      installedAt: row.installed_at,
      uninstalledAt: row.uninstalled_at,
    };
  }
}
