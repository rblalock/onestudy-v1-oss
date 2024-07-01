import { requireAuth } from '@clerk/nextjs/api'
import { Unkey } from "@unkey/api";
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

if (!process.env.ROOT_API_KEY) {
	throw new Error('Missing root API key');
}
if (!process.env.API_KEY_INSTANCE) {
	throw new Error('Missing API_KEY_INSTANCE');
}

const unkey = new Unkey({ rootKey: process.env.ROOT_API_KEY });

const Body = z.object({
	name: z.string(),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['DELETE', 'PUT', 'POST', 'GET'];

export default function apiKeysAPI(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(apiKeyHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const apiKeyHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	switch (method) {
		case 'GET': {
			logger.info({
				orgId: auth.orgId,
			}, `Getting API keys`);

			let data: any[] = [];
			try {
				const result = await unkey.apis.listKeys({
					apiId: process.env.API_KEY_INSTANCE!,
					ownerId: auth.orgId,
				});
				if (result.result) {
					data = result.result.keys;
				}
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
				data,
			});
		}
		case 'DELETE': {
			logger.info({
				orgId: auth.orgId,
				id: query.id,
			}, `Deleting API Key`);

			if (!query.id || query.id === '' || typeof query.id !== 'string') {
				return throwBadRequestException('Bad record ID');
			}

			const result = await unkey.apis.listKeys({
				apiId: process.env.API_KEY_INSTANCE!,
				ownerId: auth.orgId,
			});
			const keyToDelete = result.result?.keys.find(async (key) => {
				if (key.id === query.id) {
					try {
					} catch (e: any) {
						throw new ApiError(HttpStatusCode.InternalServerError, e.message);
					}
				}
			});

			if (keyToDelete) {
				try {
					await unkey.keys.delete({ keyId: query.id });
				} catch (e: any) {
					throw new ApiError(HttpStatusCode.InternalServerError, e.message);
				}
			} else {
				return throwUnauthorizedException('Unauthorized - API Key delete');
			}

			return res.send({
				success: true,
			});
		}
		case 'POST': {
			const body = await Body.safeParse(req.body);
			if (!body.success) {
				return throwBadRequestException('Invalid request');
			}

			logger.info(
				{ name: body.data.name },
				`Creating API Key`
			);

			try {
				const created = await unkey.keys.create({
					apiId: process.env.API_KEY_INSTANCE!,
					prefix: "osai",
					byteLength: 16,
					ownerId: auth.orgId,
					name: body.data.name,
					meta: {
						organizationId: auth.orgId
					},
					ratelimit: {
						type: "fast",
						limit: 10,
						refillRate: 10,
						refillInterval: 1000
					},
					enabled: true
				});

				logger.info(
					{ name: created.result?.keyId },
					`API Key created`
				);

				return res.send({ 
					success: true,
					data: created.result,
				});
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}
		}
	}
}

