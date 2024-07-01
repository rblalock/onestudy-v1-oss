import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@clerk/nextjs/api'

import { withPipe } from '@/server/middleware/withPipe';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { ClerkRequest } from '@/server/utils/types';
import logger from '@/server/utils/logger';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import { ApiError } from 'next/dist/server/api-utils';
import { HttpStatusCode } from '@/server/utils/http';
import { generateEmbeddings } from '@/server/ai/embedding';
import { canAccessVectorDocuments, vectorSearch } from '@/server/data/vectorDocuments';

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['GET'];

export default function searchApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(searchHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const searchHandler = async (
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

	const embeddings = await generateEmbeddings({
		input: `${search}`
	});
	const vectors = embeddings.data?.[0].embedding;
	const data = await vectorSearch(
		studyId,
		auth.orgId,
		vectors
	);
	const results = data.map((r: any) => {
		return {
			id: r.id,
			organizationId: r.organizationId,
			studyId: r.studyId,
			documentType: r.documentType,
			documentReferenceId: r.documentReferenceId,
			documentTitle: r.documentTitle,
			documentBody: r.documentBody,
		}
	});

	return res.status(200).json({
		success: true,
		data: results
	});
}

