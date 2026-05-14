import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: process.env.DOTENV_CONFIG_PATH ?? resolve(repoRoot, ".env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1).optional(),
  APP_BASE_URL: z.string().url().optional(),
  OAUTH_REDIRECT_URL: z.string().url().optional(),
  COMMERCE7_CLIENT_ID: z.string().optional(),
  COMMERCE7_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
