import { loadEnvConfig } from '@next/env'
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql);

const main = async () => {
	await migrate(db, { migrationsFolder: './src/server/data/migrations' });
	process.exit(0);
};
main();