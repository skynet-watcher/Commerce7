import { z } from "zod";

/** Commerce7 Install URL POST — tenant + installer fields plus client-settings keys (passthrough). */
export const installBodySchema = z
  .object({
    tenantId: z.string().min(1),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.union([z.string().email(), z.literal("")]).optional(),
  })
  .passthrough();

export const uninstallBodySchema = z.object({ tenantId: z.string().min(1) }).passthrough();

export type AppInstallRecord = {
  tenantId: string;
  installerEmail: string | null;
  installerFirstName: string | null;
  installerLastName: string | null;
  raw: Record<string, unknown>;
  installedAt: Date;
  uninstalledAt: Date | null;
};

export type AppInstallWrite = Omit<AppInstallRecord, "installedAt" | "uninstalledAt">;
