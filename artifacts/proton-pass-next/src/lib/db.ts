import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { vaultsTable, itemsTable } from "@workspace/db";

const { Pool } = pg;

let _pool: pg.Pool | null = null;

function getPool() {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set.");
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

export function getDb() {
  return drizzle(getPool(), {
    schema: { vaultsTable, itemsTable },
  });
}

export { vaultsTable, itemsTable };
