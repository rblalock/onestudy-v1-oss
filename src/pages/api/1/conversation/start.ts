import * as jose from 'jose';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { EventName, sendAnalytics } from '@/server/analytics';
import { getStudy } from '@/server/data/study';
import { startInterview } from '@/server/edgeData/interview';
import { withApiKey } from '@/server/middleware/withApiKey';
import { withCors } from '@/server/middleware/withCors';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { throwBadRequestException, throwForbiddenException, throwInternalServerErrorException, throwNotFoundException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';

const Body = z.object({
	studyId: z.string(),
	userMetaData: z.record(z.any()).optional(),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['POST'];

if (!process.env.JWT_SECRET) {
	throw new Error('Missing JWT_SECRET');
}

export default function startInterviewApi(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		withCors(),
		startInterviewHandler
	);

	return withExceptionFilter(req, res)(handler);
}

const startInterviewHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	try {
		const body = await Body.safeParse(req.body);

		if (!body.success) {
			return throwBadRequestException('Invalid request');
		}

		const apiKeyPayload = await withApiKey()(req, res);
		const study = await getStudy(body.data.studyId);
		if (!study) {
			return throwNotFoundException(`Study ${body.data.studyId} not found`);
		}

		if (
			process.env.API_KEY_SUPER_OWNER !== apiKeyPayload?.ownerId &&
			(!study.organizationId ||
			study.organizationId !== apiKeyPayload?.meta?.organizationId)
		) {
			return res.status(401).send({
				success: false,
				message: 'Unauthorized - mismatch'
			});
		}

		logger.info(
			{
				studyId: body.data.studyId,
				userMetaData: body.data.userMetaData,
			},
			`Starting interview`
		);

		const interview = await startInterview(
			body.data.studyId,
			study as any,
			body.data.userMetaData
		);

		sendAnalytics(EventName.InterviewStarted, {
			studyId: body.data.studyId,
			interviewId: interview.id,
			organizationId: study.organizationId,
		});

		logger.info(
			{ id: interview.id },
			`Started interview`
		);

		// Generate a temp. token
		const ip = req.headers['x-forwarded-for'];
		const token = await new jose.SignJWT({
			studyId: body.data.studyId,
			interviewId: interview.id,
			organizationId: study.organizationId,
			ip: ip || '',
		})
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(new TextEncoder().encode(process.env.JWT_SECRET!));

		return res.send({
			success: true,
			token,
			id: interview.id,
		});
	} catch (e: any) {
		return throwInternalServerErrorException(e.message);
	}
}

