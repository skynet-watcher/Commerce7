import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: process.env.DOTENV_CONFIG_PATH ?? resolve(repoRoot, ".env") });

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().min(1).optional(),
    APP_BASE_URL: z.string().url().optional(),
    OAUTH_REDIRECT_URL: z.string().url().optional(),
    COMMERCE7_CLIENT_ID: z.string().optional(),
    COMMERCE7_CLIENT_SECRET: z.string().optional(),
    COMMERCE7_API_BASE: z.string().url().default("https://api.commerce7.com/v1"),
    /** Set to `1` to force mock Commerce7 client even when API credentials exist (never in production). */
    COMMERCE7_USE_MOCK: z.enum(["0", "1"]).optional(),
    /** When set, `POST /webhooks/commerce7` requires matching `Authorization: Basic …` (ADC Advanced webhook auth). */
    WEBHOOK_BASIC_USER: z.string().optional(),
    WEBHOOK_BASIC_PASSWORD: z.string().optional(),
    /** Optional HMAC verification for webhook providers that expose a signing secret/header. */
    WEBHOOK_SIGNATURE_SECRET: z.string().min(1).optional(),
    WEBHOOK_SIGNATURE_HEADER: z.string().min(1).default("x-commerce7-signature"),
    WEBHOOK_SIGNATURE_ALGORITHM: z.enum(["sha256", "sha1", "sha512"]).default("sha256"),
    /** When set, `POST /sync/orders`, `/reconcile/orders`, and `/v1/events` require `Authorization: Bearer …`. */
    INTERNAL_API_TOKEN: z.string().min(1).optional(),
    /** Run the active-install reconciliation worker inside this API process. */
    ENABLE_SCHEDULED_RECONCILE: z.enum(["0", "1"]).default("0"),
    RECONCILE_INTERVAL_MS: z.coerce.number().int().min(60_000).default(3_600_000),
    RECONCILE_MAX_SYNC_BATCHES_PER_TENANT: z.coerce.number().int().min(1).max(1000).default(20),
    /** When both set, `POST /lifecycle/*` requires matching `Authorization: Basic …` (ADC Installation security). */
    LIFECYCLE_BASIC_USER: z.string().optional(),
    LIFECYCLE_BASIC_PASSWORD: z.string().optional(),
  })
  .refine(
    (e) =>
      (Boolean(e.WEBHOOK_BASIC_USER) && Boolean(e.WEBHOOK_BASIC_PASSWORD)) ||
      (!e.WEBHOOK_BASIC_USER && !e.WEBHOOK_BASIC_PASSWORD),
    { message: "Set both WEBHOOK_BASIC_USER and WEBHOOK_BASIC_PASSWORD (or neither)" },
  )
  .refine(
    (e) =>
      (Boolean(e.LIFECYCLE_BASIC_USER) && Boolean(e.LIFECYCLE_BASIC_PASSWORD)) ||
      (!e.LIFECYCLE_BASIC_USER && !e.LIFECYCLE_BASIC_PASSWORD),
    { message: "Set both LIFECYCLE_BASIC_USER and LIFECYCLE_BASIC_PASSWORD (or neither)" },
  )
  .refine(
    (e) =>
      e.NODE_ENV !== "production" ||
      Boolean(e.WEBHOOK_SIGNATURE_SECRET) ||
      (Boolean(e.WEBHOOK_BASIC_USER) && Boolean(e.WEBHOOK_BASIC_PASSWORD)),
    {
      message:
        "Production webhooks require WEBHOOK_SIGNATURE_SECRET or WEBHOOK_BASIC_USER/WEBHOOK_BASIC_PASSWORD",
    },
  )
  .refine(
    (e) => e.NODE_ENV !== "production" || Boolean(e.INTERNAL_API_TOKEN),
    { message: "INTERNAL_API_TOKEN is required when NODE_ENV=production" },
  );

export type Env = z.infer<typeof schema>;

export function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
