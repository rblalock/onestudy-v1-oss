import { NextApiRequest, NextApiResponse } from 'next';
import { 
	validateMessage,
	validateWrapper 
	// @ts-ignore
 } from 'openai-tokens';
import { z } from 'zod';

import { GPTMessage } from '@/core/types';
import { getStudy } from '@/server/data/study';
import { startInterview } from '@/server/edgeData/interview';
import { emitProcessInterview } from '@/server/events/interview';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { throwBadRequestException, throwForbiddenException, throwInternalServerErrorException, throwNotFoundException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const API_KEY = '43db4138-1905-473d-abb7-97c30a98f2dc';

const Body = z.object({
	studyId: z.string().min(1),
	userMetaData: z.record(z.string(), z.any()).optional(),
	messages: z.array(
		z.object({
			id: z.string().optional(),
			name: z.string().optional(),
			role: z.enum(['system', 'user', 'assistant']),
			content: z.string(),
		})
	),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['POST'];

export default function ingestInterviewApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		ingestInterviewHandler
	);

	return withExceptionFilter(req, res)(handler);
}

const ingestInterviewHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	try {
		const body = await Body.safeParse(req.body);

		if (!body.success) {
			return throwBadRequestException('Invalid request');
		}

		const key = req.headers['x-api-key'];
		if (!key || key !== API_KEY) {
			return throwForbiddenException('Invalid API key');
		}

		const study = await getStudy(body.data.studyId);
		if (!study) {
			return throwNotFoundException(`Study ${body.data.studyId} not found`);
		}

		logger.info(
			{
				studyId: body.data.studyId,
				userMetaData: body.data.userMetaData,
			},
			`Ingesting interview to cache`
		);

		const messages: GPTMessage[] = body.data.messages || [];

		// Validate the entire body
		const promptInfo = validateWrapper({
			model: 'gpt-4',
			messages
		});

		if (!promptInfo.valid) {
			return res.status(400).send({
				success: false,
				message: 'Token limit validation failed. Token total: ' + promptInfo.tokenTotal + ' Token limit: ' + promptInfo.tokenLimit
			});
		}

		const cachedInterview = await startInterview(
			body.data.studyId,
			study as any,
			body.data.userMetaData,
			messages
		);

		logger.info(
			{ id: cachedInterview.id },
			`Saved cached interview`
		);

		await emitProcessInterview({
			interviewId: cachedInterview.id,
			studyId: body.data.studyId,
		});

		return res.send({
			success: true,
			id: cachedInterview.id,
		});
	} catch (e: any) {
		return throwInternalServerErrorException(e.message);
	}
}

