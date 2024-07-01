import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

export const dbClient = postgres(connectionString || '')

export const db = drizzle(dbClient, {
	schema,
	logger: true,
	// logger: process.env.NODE_ENV === 'production' ? false : true,
});
