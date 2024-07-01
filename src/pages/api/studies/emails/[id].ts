import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { canAccessStudy } from '@/server/data/study';
import { getStudyEmailByStudyId, updateStudyEmails } from '@/server/data/study/studyEmails';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.object({
	emails: z.array(z.string()),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['PUT', 'GET'];

export default function studyApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(studyEmailsHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const studyEmailsHandler = async (
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
			}, `Getting study emails ${id}`);

			try {
				const data = await getStudyEmailByStudyId(id);
				return res.send({
					success: true,
					data: data || [],
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

			const emails = body.data.emails;

			logger.info(
				{ id },
				`Updating study emails`
			);

			try {
				await updateStudyEmails(id, auth.orgId, emails);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			logger.info(
				{ id },
				`Updated study emails`
			);

			return res.send({ success: true });
		}
	}
}

