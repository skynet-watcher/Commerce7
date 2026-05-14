import { z } from "zod";

export const analyticsEventBodySchema = z.object({
  tenantId: z.string().min(1),
  clientEventId: z.string().min(1),
  name: z.string().min(1),
  properties: z.record(z.string(), z.unknown()).optional(),
});

export type AnalyticsEventBody = z.infer<typeof analyticsEventBodySchema>;

export type AnalyticsEventStore = {
  record(input: {
    tenantId: string;
    clientEventId: string;
    body: AnalyticsEventBody;
  }): Promise<{ duplicate: boolean }>;
};
