import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { getInterviews } from '@/server/data/interview';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.object({
	name: z.string(),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['POST', 'GET'];

export default function studiesApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(interviewsHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const interviewsHandler = async (
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
			}, `Getting interviews`);

			const studyId = query.studyId as string | undefined;
			if (!studyId) {
				return throwBadRequestException('Missing study');
			}

			let data = [];
			try {
				data = await getInterviews(studyId, auth.orgId);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
				data,
			});
		}
		// case 'POST': {
		// 	const body = await Body.safeParse(req.body);

		// 	if (!body.success) {
		// 		return throwBadRequestException('Invalid request');
		// 	}

		// 	logger.info(
		// 		{ name: body.data.name },
		// 		`Creating study`
		// 	);

		// 	try {
		// 		// TODO - Need to protect if user is not in org or can create a study in the org
		// 		await createStudy(
		// 			body.data.name,
		// 			auth.userId,
		// 			auth.orgId
		// 		);
		// 	} catch (e: any) {
		// 		throw new ApiError(HttpStatusCode.InternalServerError, e.message);
		// 	}

		// 	logger.info(
		// 		{ name: body.data.name },
		// 		`Study created`
		// 	);

		// 	return res.send({ success: true });
		// }
	}
}

