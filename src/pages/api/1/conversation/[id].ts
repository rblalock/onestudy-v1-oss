import * as jose from 'jose';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';

import { getInterview } from '@/server/edgeData/interview';
import { withApiKey } from '@/server/middleware/withApiKey';
import { withCors } from '@/server/middleware/withCors';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['GET'];

export default function interviewConversationPublicApi(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		withCors(),
		interviewConversationPublicHandler
	);

	return withExceptionFilter(req, res)(handler);
}

const interviewConversationPublicHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const id = req.query.id as string | undefined;
	if (!id) {
		return throwBadRequestException('Missing interview id');
	}

	// Check against valid token
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) {
		logger.error(
			{},
			`Missing token`
		);
		return res.status(401).send({ 
			message: 'Missing token',
			success: false
		});
	}
	const creds: { [key: string]: string } = {};
	try {
		const { payload: decoded } = await jose.jwtVerify(
			token,
			new TextEncoder().encode(process.env.JWT_SECRET!)
		);
		creds['studyId'] = decoded.studyId as string;
		creds['interviewId'] = decoded.interviewId as string;
		creds['organizationId'] = decoded.organizationId as string;
		logger.info(
			{ token: decoded },
			`Request sent with valid token`
		);
	} catch (error) {
		logger.error(
			{ token, error },
			`Invalid or expired token`
		);
		return res.status(401).send({ 
			message: 'Invalid or missing token',
			success: false
		});
	}

	logger.info({}, `Getting interview ${id}`);

	try {
		const apiKeyPayload = await withApiKey()(req, res);
		const data = await getInterview(id);

		if (
			process.env.API_KEY_SUPER_OWNER !== apiKeyPayload?.ownerId &&
			(!data ||
			!data.study.organizationId ||
			data.study.organizationId !== apiKeyPayload?.meta?.organizationId)
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

