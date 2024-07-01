import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { canAccessTag, deleteTag } from '@/server/data/tag';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.record(z.string(), z.any());

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['DELETE'];

export default function tagApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(tagHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const tagHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	const id = query.id as string | undefined;
	if (!id) {
		return throwBadRequestException('Missing tag id');
	}

	const canAccess = await canAccessTag(id, auth.orgId);
	if (!canAccess) {
		return throwUnauthorizedException('Unauthorized - tag');
	}

	switch (method) {
		case 'DELETE': {
			logger.info({
				orgId: auth.orgId,
				id: query.id,
			}, `Deleting tag`);

			if (!query.id || query.id === '' || typeof query.id !== 'string') {
				return throwBadRequestException('Bad record ID');
			}

			try {
				await deleteTag(query.id);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
			});
		}
	}
}

