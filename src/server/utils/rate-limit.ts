import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

if (!process.env.RATE_LIMIT_URL || !process.env.RATE_LIMIT_TOKEN) {
	throw new Error(
		"Missing `RATE_LIMIT_URL` and `RATE_LIMIT_TOKEN`"
	);
}

const redis = new Redis({
	url: process.env.RATE_LIMIT_URL,
	token: process.env.RATE_LIMIT_TOKEN,
});

export const conversationRateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(10, "10 s"),
	timeout: 5000,
	analytics: true,
	prefix: "ratelimit:conversation",
});
