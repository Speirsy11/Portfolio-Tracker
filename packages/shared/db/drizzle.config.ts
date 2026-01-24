import type { Config } from "drizzle-kit";

const connectionString =
  process.env.POSTGRES_URL ?? process.env.PORTFOLIO_DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL or PORTFOLIO_DATABASE_URL");
}

// Use non-pooling port for migrations
const nonPoolingUrl = connectionString.replace(":6543", ":5432");

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  casing: "snake_case",
} satisfies Config;
