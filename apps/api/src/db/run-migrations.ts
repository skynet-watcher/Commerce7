import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";

const here = dirname(fileURLToPath(import.meta.url));

/** Resolved for both `tsx src/...` and `node dist/...` (`dist/db` → repo `migrations/`). */
export function migrationsDirectory(): string {
  return join(here, "..", "..", "migrations");
}

export async function runMigrations(pool: Pool): Promise<void> {
  const dir = migrationsDirectory();
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = await readFile(join(dir, file), "utf8");
    await pool.query(sql);
  }
}
