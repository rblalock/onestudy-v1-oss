import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { canAccessStudy,deleteStudy, getStudy, updateStudy } from '@/server/data/study';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.record(z.string(), z.any());

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['DELETE', 'PUT', 'GET'];

export default function studyApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(studyHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const studyHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	const id = query.id as string | undefined;
	if (!id) {
		return throwBadRequestException('Missing study id');
	}

	const canAccess = await canAccessStudy(id, auth.orgId);
	if (!canAccess) {
		return throwUnauthorizedException('Unauthorized - study');
	}

	switch (method) {
		case 'GET': {
			logger.info({
				orgId: auth.orgId,
			}, `Getting study ${id}`);

			try {
				const data = await getStudy(id);
				return res.send({
					success: true,
					data,
				});
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}
		}
		case 'PUT': {
			const body = await Body.safeParse(req.body);

			if (!body.success) {
				return throwBadRequestException('Invalid request');
			}

			logger.info(
				{ id },
				`Updating study`
			);

			try {
				await updateStudy(id, {
					...body.data,
				});
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			logger.info(
				{ id },
				`Updated study`
			);

			return res.send({ success: true });
		}
		case 'DELETE': {
			logger.info({
				orgId: auth.orgId,
				id: query.id,
			}, `Deleting study`);

			if (!query.id || query.id === '' || typeof query.id !== 'string') {
				return throwBadRequestException('Bad record ID');
			}

			try {
				await deleteStudy(query.id);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
			});
		}
	}
}

