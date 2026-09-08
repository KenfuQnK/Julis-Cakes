import { readdir, readFile } from "node:fs/promises";
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
  const migrationsDir = path.join(process.cwd(), "server/migrations");
  const files = (await readdir(migrationsDir)).filter((file) =>
    file.endsWith(".sql"),
  );
  // Filenames are zero-padded (001_, 002_, ...) so lexical order is run order.
  for (const file of files.sort()) {
    const migration = await readFile(path.join(migrationsDir, file), "utf8");
    await getPool().query(migration);
    log.debug("Migration applied", { file });
  }
  log.info("Recipe schema ready", { migrations: files.length });
}
