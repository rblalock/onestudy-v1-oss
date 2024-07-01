import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';

import { getClientIp } from '@/server/utils/client-ip';
import { HttpStatusCode } from '@/server/utils/http';
import logger from '@/server/utils/logger';

import { ClerkRequest } from '../utils/types';
/**
 * @description Filter errors from an API handler, report it and ends
 * request gracefully
 *
 * This allows us not to write hyper-defensive code when writing our API
 * routes - simply use it as a middleware.
 *
 * If you encounter errors, please do return an ApiError object so
 * that we can extract as much information as possible (such as the correct
 * status code and the message).
 *
 * Usage:
 *
 * export default function apiHandler(req, res) {
 *   return withExceptionFilter(req, res)(
 *     withPipe(
 *       withAdmin,
 *       yourApiHandler,
 *     )
 *   );
 * }
 *
 */
export function withExceptionFilter(req: ClerkRequest | NextApiRequest, res: NextApiResponse) {
	return async function exceptionFilter(handler: NextApiHandler) {
		try {
			await handler(req, res);
		} catch (exception) {
			// @ts-ignore
			const { url, auth, headers } = req;

			const statusCode = getExceptionStatus(exception);
			const message = getExceptionMessage(exception);
			const stack = getExceptionStack(exception);
			const ip = getClientIp(req);

			const userId = auth?.userId ?? 'Not Authenticated';
			const referer = headers['referer'];
			const userAgent = headers['user-agent'];
			const organizationId = auth?.orgId ?? 'Org not available';

			const requestContext = {
				url,
				ip,
				userId,
				referer,
				userAgent,
				organizationId,
			};

			// Report error to Sentry
			// await captureApiException(exception, requestContext).catch((e) => {
			// 	logger.error(
			// 		e,
			// 		`Encountered error while reporting exception to Sentry`
			// 	);
			// });

			logger.error(requestContext, message);

			// if we are able to retrieve the stack, we add it to the debugging logs
			if (stack) {
				logger.debug(stack);
			}

			const timestamp = new Date().toISOString();

			// return just enough information without leaking any data
			const responseBody = {
				statusCode,
				timestamp,
				path: req.url,
			};

			return res.status(statusCode).send(responseBody);
		}
	};
}

function getExceptionStatus(exception: unknown) {
	return exception instanceof ApiError
		? exception.statusCode
		: HttpStatusCode.InternalServerError;
}

function getExceptionMessage(exception: unknown) {
	return isError(exception) ? exception.message : `Internal Server Error`;
}

function getExceptionStack(exception: unknown) {
	return isError(exception) ? exception.stack : undefined;
}

function isError(exception: unknown): exception is Error {
	return exception instanceof Error;
}
