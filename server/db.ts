import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool, type PoolClient } from "pg";

import { createLogger } from "../src/utils/logger";

const log = createLogger("NeonDB");
let pool: Pool | undefined;

function normalizeConnectionString(connectionString: string): string {
  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  return url.toString().replace(/\?$/, "");
}

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error("DATABASE_URL is required by the API server");

  pool = new Pool({
    connectionString: normalizeConnectionString(connectionString),
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    ssl: { rejectUnauthorized: true },
  });

  pool.on("error", (error) =>
    log.error("Unexpected idle client error", { message: error.message }),
  );
  return pool;
}

export async function withTransaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function runMigrations(): Promise<void> {
  const migrationPath = path.join(
    process.cwd(),
    "server/migrations/001_recipes.sql",
  );
  const migration = await readFile(migrationPath, "utf8");
  await getPool().query(migration);
  log.info("Recipe schema ready");
}
