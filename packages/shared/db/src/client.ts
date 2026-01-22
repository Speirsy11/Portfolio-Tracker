import { sql } from "@vercel/postgres";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const connectionString =
  process.env.PORTFOLIO_DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing PORTFOLIO_DATABASE_URL or POSTGRES_URL");
}

// In development, use standard node-postgres with the local container
// In production/preview (Vercel), use the Vercel Postgres SDK
const shouldUseLocal =
  process.env.NODE_ENV === "development" ||
  !connectionString.includes("vercel-storage");

export const db = shouldUseLocal
  ? drizzlePg(new Pool({ connectionString }), { schema, casing: "snake_case" })
  : drizzleVercel({ client: sql, schema, casing: "snake_case" });
