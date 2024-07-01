import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { emitSummarizeInterview } from '@/server/events/interview';
import { emitSummarizeStudy, emitSummarizeStudyQuotes, emitSummarizeStudyThemes } from '@/server/events/study';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.object({
	id: z.string(),
	type: z.string(),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['POST'];

export default function summarizeApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(summarizeHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const summarizeHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	switch (method) {
		case 'POST': {
			const body = await Body.safeParse(req.body);

			if (!body.success) {
				return throwBadRequestException('Invalid request');
			}

			logger.info(
				{},
				`Creating summary for ${body.data.type} ${body.data.id}`
			);

			try {
				switch (body.data.type) {
					case 'interview': {
						await emitSummarizeInterview({
							interviewId: body.data.id,
						});
						break;
					}
					case 'study': {
						await emitSummarizeStudy({
							studyId: body.data.id,
							organizationId: auth.orgId,
						});
						break;
					}
					case 'themes': {
						await emitSummarizeStudyThemes({
							studyId: body.data.id,
							organizationId: auth.orgId,
						});
						break;
					}
					case 'quotes': {
						await emitSummarizeStudyQuotes({
							studyId: body.data.id,
							organizationId: auth.orgId,
						});
						break;
					}
				}

				return res.send({ success: true });
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}
		}
	}
}

