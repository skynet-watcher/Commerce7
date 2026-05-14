import { z } from "zod";

/** ADC documented `objectType` values for `POST /app-sync`. */
export const APP_SYNC_OBJECT_TYPES = [
  "Order",
  "Customer",
  "Customer Address",
  "Club Membership",
  "Product",
  "Reservation",
] as const;

export const appSyncCreateInputSchema = z.object({
  objectType: z.enum(APP_SYNC_OBJECT_TYPES),
  objectId: z.string().min(1),
  status: z.enum(["Error", "Success"]),
  issues: z.array(z.string()).optional(),
  actions: z
    .array(
      z.object({
        httpType: z.string().min(1),
        url: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .optional(),
});

export const appSyncRouteBodySchema = z
  .object({
    tenantId: z.string().min(1),
  })
  .and(appSyncCreateInputSchema);

export type AppSyncCreateInput = z.infer<typeof appSyncCreateInputSchema>;
export type AppSyncRouteBody = z.infer<typeof appSyncRouteBodySchema>;
