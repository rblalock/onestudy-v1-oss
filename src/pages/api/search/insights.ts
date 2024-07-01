import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@clerk/nextjs/api'

import { withPipe } from '@/server/middleware/withPipe';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { ClerkRequest } from '@/server/utils/types';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';

import { canAccessVectorDocuments } from '@/server/data/vectorDocuments';
import logger from '@/server/utils/logger';
import { EventName, sendAnalytics } from '@/server/analytics';
import { createStudyInsight } from '@/server/data/studyInsights';
import { emitGenerateStudyInsight } from '@/server/events/studyInsight';

export const config = {
	maxDuration: 200
};

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['GET'];

export default function searchInsightsApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(searchInsightsHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const searchInsightsHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	const search = req.query.search as string;
	const studyId = req.query.studyId as string;

	if (!search || !studyId) {
		return throwBadRequestException('Missing search or studyId in query');
	}

	const canAccess = await canAccessVectorDocuments(studyId, auth.orgId);
	if (!canAccess) {
		return throwUnauthorizedException('Unauthorized - vector documents');
	}

	logger.info(
		{ orgId: auth.orgId, authUserId: auth.userId, studyId: studyId },
		`Create study insight record for ${search}`
	);

	sendAnalytics(EventName.RAGSearch, {
		userId: auth.userId,
		organizationId: auth.orgId,
		studyId
	});

	const sanitizedQuery = search.trim();

	const studyInsight = await createStudyInsight(
		studyId,
		auth.orgId,
		sanitizedQuery,
		{
			processing: true,
		}
	);

	emitGenerateStudyInsight({
		studyId,
		organizationId: auth.orgId,
		query: sanitizedQuery,
		studyInsightId: studyInsight?.[0].id,
	});

	return res.status(200).json({
		success: true,
		data: {
			id: studyInsight?.[0].id,
		}
	});
}

