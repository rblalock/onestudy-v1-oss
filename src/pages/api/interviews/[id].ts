import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { canAccessInterview,deleteInterview, getInterview, updateInterview } from '@/server/data/interview';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.record(z.string(), z.any());

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['DELETE', 'PUT', 'GET'];

export default function interviewApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(interviewHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const interviewHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	const id = query.id as string | undefined;
	if (!id) {
		return throwBadRequestException('Missing interview id');
	}

	const canAccess = await canAccessInterview(id, auth.orgId);
	if (!canAccess) {
		return res.send({
			success: true,
			data: undefined
		});
	}

	switch (method) {
		case 'GET': {
			logger.info({
				orgId: auth.orgId,
			}, `Getting interview ${id}`);

			try {
				const data = await getInterview(id);
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
				`Updating interview`
			);

			try {
				await updateInterview(id, {
					...body.data,
				});
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			logger.info(
				{ id },
				`Updated interview`
			);

			return res.send({ success: true });
		}
		case 'DELETE': {
			logger.info({
				orgId: auth.orgId,
				id: query.id,
			}, `Deleting interview`);

			if (!query.id || query.id === '' || typeof query.id !== 'string') {
				return throwBadRequestException('Bad record ID');
			}

			try {
				await deleteInterview(query.id);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
			});
		}
	}
}

