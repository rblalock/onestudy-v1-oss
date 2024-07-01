import { loadEnvConfig } from "@next/env";
import type { Config } from "drizzle-kit";

loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default {
  schema: "./src/server/data/schema.ts",
  out: "./src/server/data/migrations",
  driver: "pg",
  schemaFilter: ["public"],
  dbCredentials: {
    connectionString,
  },
} satisfies Config;
