import { requireAuth } from '@clerk/nextjs/api'
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { Svix } from "svix";

import { updateOrganizationWebhook } from '@/server/data/organization';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpStatusCode } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';
import logger from '@/server/utils/logger';
import { ClerkRequest } from '@/server/utils/types';

if (!process.env.SVIX_API_KEY) {
	throw new Error('Missing SVIX_API_KEY');
}

const svix = new Svix(process.env.SVIX_API_KEY);

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['POST'];

export default function AccessApi(
	req: ClerkRequest,
	res: NextApiResponse
) {
	const handler = withPipe(
		withMethodsGuard(SUPPORTED_HTTP_METHODS),
		requireAuth(accessHandler)
	);

	return withExceptionFilter(req, res)(handler);
}

const accessHandler = async (
	req: ClerkRequest,
	res: NextApiResponse
) => {
	const { method, auth } = req;

	if (!auth.userId || !auth.orgId) {
		return throwBadRequestException('Missing user/org');
	}

	switch (method) {
		case 'POST': {
			logger.info(
				{
					organizationGroupId: auth.orgId,
				},
				`Retrieving webhook study`
			);

			let id;
			let found = false;
			try {
				const applicationOut = await svix.application.get(auth.orgId);
				id = applicationOut.id;
				found = true;
			} catch (e: any) {
				if (e.code === 'not_found') {
					found = false;
				}
			}

			if (!found) {
				const applicationOut = await svix.application.create({
					name: auth.orgId,
					uid: auth.orgId
				});
				await updateOrganizationWebhook(auth.orgId, applicationOut.id);
				id = applicationOut.id;
			}

			if (!id) {
				throw new ApiError(HttpStatusCode.InternalServerError, 'Failed to create application');
			}

			try {
				const appPortalAccessOut = await svix.authentication.appPortalAccess(
					id,
					{
						featureFlags: []
					}
				);

				return res.send({
					...appPortalAccessOut
				});
			} catch (e: any) {
				throw new ApiError(HttpStatusCode.InternalServerError, e.message);
			}
		}
	}
}

