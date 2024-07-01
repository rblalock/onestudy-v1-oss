import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';

import { getInterview } from '@/server/data/interview/public';
import { withApiKey } from '@/server/middleware/withApiKey';
import { withCors } from '@/server/middleware/withCors';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['GET'];

export default function interviewPublicApi(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		withCors(),
		interviewPublicHandler
	);

	return withExceptionFilter(req, res)(handler);
}

const interviewPublicHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const id = req.query.id as string | undefined;
	if (!id) {
		return throwBadRequestException('Missing interview id');
	}

	logger.info({}, `Getting interview ${id}`);

	try {
		const apiKeyPayload = await withApiKey()(req, res);
		const data = await getInterview(id);

		// Make sure the apiKey is allowed to access this study
		if (
			process.env.API_KEY_SUPER_OWNER !== apiKeyPayload?.ownerId &&
			(!data ||
				!data.organizationId ||
				data.organizationId !== apiKeyPayload?.meta?.organizationId)
		) {
			return res.status(401).send({
				success: false,
				message: 'Unauthorized - mismatch'
			});
		}

		return res.send({
			success: true,
			data,
		});
	} catch (e: any) {
		throw new ApiError(HttpStatusCode.InternalServerError, e.message);
	}
}

