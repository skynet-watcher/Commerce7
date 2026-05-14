import { createPool } from "./pool.js";
import { runMigrations } from "./run-migrations.js";
import { loadEnv } from "../env.js";

async function main(): Promise<void> {
  const env = loadEnv();
  if (!env.DATABASE_URL) {
    console.error("db:migrate: set DATABASE_URL (see .env.example)");
    process.exit(1);
  }
  const pool = createPool(env.DATABASE_URL);
  try {
    await runMigrations(pool);
    console.log("db:migrate: ok");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
