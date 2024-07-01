import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

import { canAccessGroup, createOrganizationGroup, deleteOrganizationGroup, getGroups } from '@/server/data/organization/group';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException, throwUnauthorizedException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

const Body = z.object({
	name: z.string(),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['DELETE', 'PUT', 'POST', 'GET'];

export default function groupsApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(groupsHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const groupsHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, query, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	switch (method) {
		case 'GET': {
			logger.info({
				orgId: auth.orgId,
			}, `Getting groups`);

			let data = [];
			try {
				data = await getGroups(auth.orgId);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
				data,
			});
		}
		case 'DELETE': {
			logger.info({
				orgId: auth.orgId,
				id: query.id,
			}, `Deleting group`);

			if (!query.id || query.id === '' || typeof query.id !== 'string') {
				return throwBadRequestException('Bad record ID');
			}

			const canAccess = await canAccessGroup(query.id, auth.orgId);
			if (!canAccess) {
				return throwUnauthorizedException('Unauthorized - group');
			}

			try {
				await deleteOrganizationGroup(query.id);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			return res.send({
				success: true,
			});
		}
		case 'POST': {
			const body = await Body.safeParse(req.body);

			if (!body.success) {
				return throwBadRequestException('Invalid request');
			}

			logger.info(
				{ name: body.data.name },
				`Creating group`
			);

			try {
				await createOrganizationGroup(
					body.data.name,
					auth.orgId
				);
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}

			logger.info(
				{ name: body.data.name },
				`group created`
			);

			return res.send({ success: true });
		}
	}
}

