import { sql } from "@vercel/postgres";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres";
import { Pool } from "pg";

import { env } from "./env";
import * as schema from "./schema";

type DbClient = ReturnType<typeof drizzlePg<typeof schema>>;

let _db: DbClient | undefined;

function getDb(): DbClient {
  if (_db) return _db;

  const connectionString = env.POSTGRES_URL ?? env.PORTFOLIO_DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing PORTFOLIO_DATABASE_URL or POSTGRES_URL");
  }

  // In development, use standard node-postgres with the local container
  // In production/preview (Vercel), use the Vercel Postgres SDK
  const shouldUseLocal =
    env.NODE_ENV === "development" ||
    !connectionString.includes("vercel-storage");

  _db = (
    shouldUseLocal
      ? drizzlePg(new Pool({ connectionString }), {
          schema,
          casing: "snake_case",
        })
      : drizzleVercel({ client: sql, schema, casing: "snake_case" })
  ) as DbClient;

  return _db;
}

// Lazy-initialized db client using Proxy to defer initialization until first use
// This allows the module to be imported during build without throwing
export const db: DbClient = new Proxy({} as DbClient, {
  get(_, prop: keyof DbClient) {
    const instance = getDb();
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
