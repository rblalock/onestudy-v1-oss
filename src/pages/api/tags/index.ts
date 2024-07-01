import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { createTag, getTagsByOrgId, getTagsByStudyId } from '@/server/data/tag';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.object({
	tagName: z.string(),
	color: z.string(),
	studyId: z.string().optional(),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['POST', 'GET'];

export default function tagsApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(tagsHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const tagsHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	const studyId = query.studyId as string | undefined;
	const orgId = auth.orgId;

	switch (method) {
		case 'GET': {
			logger.info({
				orgId: auth.orgId,
				studyId: query.studyId,
			}, `Getting tags`);

			let data = [];
			try {
				if (studyId) {
					data = await getTagsByStudyId(studyId, orgId);
				} else {
					data = await getTagsByOrgId(orgId);
				}
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
				data,
			});
		}
		case 'POST': {
			const body = await Body.safeParse(req.body);

			if (!body.success) {
				return throwBadRequestException('Invalid request');
			}

			logger.info(
				{
					name: body.data?.tagName,
					orgId: orgId,
				},
				`Creating tag`
			);

			try {
				const tagId = await createTag(
					auth.orgId,
					{
						...body.data,
					},
					studyId,
				);
				logger.info(
					{ name: body.data.tagName, id: tagId },
					`Tag created`
				);

				return res.send({ success: true, id: tagId });
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}
		}
	}
}

