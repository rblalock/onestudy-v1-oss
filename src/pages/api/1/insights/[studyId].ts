import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';

import { canAccessStudyInsights } from '@/server/data/studyInsights';
import { getStudyInsights } from '@/server/data/studyInsights/public';
import { withApiKey } from '@/server/middleware/withApiKey';
import { withCors } from '@/server/middleware/withCors';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['GET'];

export default function studyInsightPublicApi(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		withCors(),
		studyInsightPublicHandler
	);

	return withExceptionFilter(req, res)(handler);
}

const studyInsightPublicHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const id = req.query.studyId as string | undefined;
	if (!id) {
		return throwBadRequestException('Missing study id');
	}

	logger.info({}, `Getting study insight ${id}`);

	try {
		const apiKeyPayload = await withApiKey()(req, res);
		const orgId = apiKeyPayload?.meta?.organizationId as string;

		if (orgId) {
			try {
				const canAccess = await canAccessStudyInsights(id, orgId);
				if (!canAccess) {
					return res.send({
						success: false,
						message: 'Unauthorized'
					});
				}

				const data = await getStudyInsights(id, orgId);
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
	} catch (e: any) {
		throw new ApiError(HttpStatusCode.InternalServerError, e.message);
	}
}

