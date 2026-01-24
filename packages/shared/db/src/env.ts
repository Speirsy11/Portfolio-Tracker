import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function dbEnv() {
  return createEnv({
    server: {
      PORTFOLIO_DATABASE_URL: z.url().optional(),
      POSTGRES_URL: z.url().optional(),
      NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    },
    experimental__runtimeEnv: {},
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}

export const env = dbEnv();
