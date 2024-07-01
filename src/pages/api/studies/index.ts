import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { createStudy, getStudies, getStudiesWithInterviewCount } from '@/server/data/study';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.object({
	name: z.string(),
	organizationGroupId: z.string().optional(),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['POST', 'GET'];

export default function studiesApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(studiesHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const studiesHandler = async (
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
			}, `Getting studies`);
			
			const groupId = query.groupId as string | undefined;
			let data = [];
			try {
				data = await getStudiesWithInterviewCount(auth.orgId, groupId);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
				data,
			});
		}
		case 'POST': {
			const body = await Body.safeParse(req.body);
			
			if (!body.success) {
				return throwBadRequestException('Invalid request');
			}

			logger.info(
				{ 
					name: body.data?.name,
					organizationGroupId: body.data?.organizationGroupId,
				},
				`Creating study`
			);

			try {
				const studyId = await createStudy(
					body.data.name,
					auth.userId,
					auth.orgId,
					body.data.organizationGroupId
				);
				logger.info(
					{ name: body.data.name, id: studyId },
					`Study created`
				);

				return res.send({ success: true, id: studyId });
			} catch(e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}
		}
	}
}

