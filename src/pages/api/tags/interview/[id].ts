import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { VectorDocumentType } from '@/core/vectorDocuments/types';
import { canAccessInterview,deleteInterview, getInterview, updateInterview } from '@/server/data/interview';
import { generateTags } from '@/server/data/tag';
import { emitInterviewAutoTag } from '@/server/events/interview';
import { emitGenerateEmbeddings } from '@/server/events/vectorDocument';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.record(z.string(), z.any());


const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['GET'];

export default function interviewTagApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(interviewTagHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const interviewTagHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	const id = query.id as string | undefined;
	const studyId = query.studyId as string | undefined;
	if (!id || !studyId) {
		return throwBadRequestException('Missing interview id and/or study id');
	}

	const canAccess = await canAccessInterview(id, auth.orgId);
	if (!canAccess) {
		return throwUnauthorizedException('Unauthorized - interview');
	}

	switch (method) {
		case 'GET': {
			logger.info({
				orgId: auth.orgId,
			}, `Tagging interview ${id}`);

			try {
				await generateTags(auth.orgId, studyId, id);
				await emitGenerateEmbeddings({
					documentReferenceId: id,
					type: VectorDocumentType.Interview,
					studyId,
					organizationId: auth.orgId,
				});

				return res.send({
					success: true,
				});
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}
		}
	}
}

