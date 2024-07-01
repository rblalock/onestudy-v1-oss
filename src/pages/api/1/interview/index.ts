import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { getInterviews } from '@/server/data/interview/public';
import { canAccessStudy } from '@/server/data/study';
import { withApiKey } from '@/server/middleware/withApiKey';
import { withCors } from '@/server/middleware/withCors';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['GET'];

export default function studiesApi(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		withCors(),
		interviewsHandler
	);

	return withExceptionFilter(req, res)(handler);
}

const interviewsHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const { query } = req;

	const id = query.studyId as string | undefined;
	if (!id) {
		return throwBadRequestException('Missing study id');
	}

	const apiKeyPayload = await withApiKey()(req, res);

	logger.info({
		studyId: id,
	}, `Getting interviews`);

	const orgId = apiKeyPayload?.meta?.organizationId as string;

	if (orgId) {
		try {
			const canAccess = await canAccessStudy(id, orgId);
			if (!canAccess) {
				return res.send({
					success: false,
					message: 'Unauthorized'
				});
			}

			const data = await getInterviews(id, orgId);
			return res.send({
				success: true,
				data,
			});
		} catch (e: any) {
			throw new ApiError(HttpStatusCode.InternalServerError, e.message);
		}
	} else {
		return res.status(401).send({
			success: false,
			message: 'Unauthorized - missing organization'
		});
	}

}

