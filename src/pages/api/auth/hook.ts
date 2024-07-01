import { WebhookEvent } from '@clerk/nextjs/server'
import { buffer } from 'micro'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { Webhook } from 'svix'

import { EventClient } from '@/server/events/client'
import logger from '@/server/utils/logger'

export const config = {
	api: {
		bodyParser: false,
	}
}

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_KEY_SECRET

if (!WEBHOOK_SECRET) {
	throw new Error('Missing CLERK_WEBHOOK_KEY_SECRET')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405)
	}

	// Get the headers
	const svix_id = req.headers["svix-id"] as string;
	const svix_timestamp = req.headers["svix-timestamp"] as string;
	const svix_signature = req.headers["svix-signature"] as string;


	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return res.status(400).json({ error: 'Error occured -- no svix headers' })
	}
	// Get the body
	const body = (await buffer(req)).toString()

	// Create a new Svix instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET!);

	let evt: WebhookEvent

	// Verify the payload with the headers
	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent
	} catch (err) {
		logger.error({ err }, 'Error verifying webhook');
		return res.status(400).json({ 'Error': err })
	}

	// Get the ID and type
	const id = evt.data.id;
	const eventType = evt.type;

	logger.info(`Webhook with and ID of ${id} and type of ${eventType}`)

	try {
		await EventClient.send({
			name: 'hook/auth',
			data: {
				type: eventType,
				data: evt.data,
			},
		});
	} catch (e: any) {
		logger.error({ err: e }, 'Error sending auth webhook event');
		throw new ApiError(500, e.message ?? `Error sending auth webhook event`);
	}

	return res.status(200).json({ response: 'Success' })
}