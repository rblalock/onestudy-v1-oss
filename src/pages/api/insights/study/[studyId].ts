import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import {z} from "zod";

import {
	canAccessStudyInsights,
	deleteStudyInsight,
	getStudyInsight,
	getStudyInsights,
	updateStudyInsight
} from '@/server/data/studyInsights';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

export const config = {
	maxDuration: 200
};

const Body = z.object({
	shared: z.boolean(),
	keyQuote: z.string().optional()
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['DELETE', 'GET', 'PUT'];

export default function studyInsightsApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(studyInsightsHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const studyInsightsHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	const studyId = query.studyId as string | undefined;
	if (!studyId) {
		return throwBadRequestException('Missing study id');
	}

	const canAccess = await canAccessStudyInsights(studyId, auth.orgId);
	if (!canAccess) {
		return throwUnauthorizedException('Unauthorized - study insights');
	}

	switch (method) {
		case 'GET': {
			logger.info({
				orgId: auth.orgId,
			}, `Getting study insights ${studyId}`);

			try {
				const id = query.id as string | undefined;
				let data;

				if (id) {
					data = await getStudyInsight(id);
				} else {
					data = await getStudyInsights(studyId, auth.orgId);
				}
				
				return res.send({
					success: true,
					data,
				});
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}
		}
		case 'DELETE': {
			if (!query.id || query.id === '' || typeof query.id !== 'string') {
				return throwBadRequestException('Missing or malformed study insights id');
			}
			logger.info({
				orgId: auth.orgId,
				id: query.id,
			}, `Deleting study insights`);

			try {
				await deleteStudyInsight(query.id);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
			});
		}
		case 'PUT': {
			if (!query.id || query.id === '' || typeof query.id !== 'string') {
				return throwBadRequestException('Missing or malformed study insights id');
			}

			const body = Body.safeParse(req.body);

			if (!body.success) {
				return throwBadRequestException('Invalid request');
			}

			logger.info({
				orgId: auth.orgId,
				id: query.id,
			}, `Updating study insights`);

			const payload: {[key: string]: any} = {};
			if (body.data.shared !== undefined) {
				payload['shared'] = body.data.shared;
			}
			if (body.data.keyQuote) {
				payload['keyQuote'] = body.data.keyQuote;
			}

			try {
				await updateStudyInsight(query.id, {
					...payload
				});
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
			});
		}
	}
}

