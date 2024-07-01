import { Redis } from '@upstash/redis'

if (!process.env.CACHE_URL || !process.env.CACHE_TOKEN) {
	throw new Error('Missing cache env variables')
}

export const edgeDbClient = new Redis({
	url: process.env.CACHE_URL,
	token: process.env.CACHE_TOKEN,
});
