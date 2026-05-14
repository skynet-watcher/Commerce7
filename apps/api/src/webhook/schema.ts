import { z } from "zod";

/**
 * Body Commerce7 POSTs to your webhook URL (see docs/developer/app-platform/webhooks.md).
 * `payload` shape depends on `object` + `action`.
 */
export const commerce7WebhookBodySchema = z.object({
  object: z.string().min(1, "object required"),
  action: z.string().min(1, "action required"),
  /** Record / object payload; bulk updates use `{ callbackUrl }`. */
  payload: z.record(z.string(), z.unknown()),
  user: z.string().optional(),
  tenantId: z.string().min(1, "tenantId required"),
});

export type Commerce7WebhookBody = z.infer<typeof commerce7WebhookBodySchema>;
