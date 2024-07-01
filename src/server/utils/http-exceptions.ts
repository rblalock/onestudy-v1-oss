import { ApiError } from 'next/dist/server/api-utils';
import { NextApiResponse } from 'next/types';

import { HttpStatusCode } from '@/server/utils/http';

export const throwInternalServerErrorException = buildException(
	HttpStatusCode.InternalServerError
);

export const throwBadRequestException = buildException(
	HttpStatusCode.BadRequest
);

export const throwNotFoundException = buildException(HttpStatusCode.NotFound);

export const throwMethodNotAllowedException = function methodNotAllowed(
	res: NextApiResponse,
	allowedMethodsList: string[],
	methodNotAllowed?: string | undefined
) {
	const errorMessage = `Method ${methodNotAllowed ?? '[unknown]'
		} is not allowed. Please use one of the following methods: ${allowedMethodsList.join(
			', '
		)}`;

	res.setHeader('Allow', allowedMethodsList);

	throw new ApiError(HttpStatusCode.MethodNotAllowed, errorMessage);
};

export const throwUnauthorizedException = buildException(
	HttpStatusCode.Unauthorized
);

export const throwForbiddenException = buildException(HttpStatusCode.Forbidden);

function buildException(statusCode: HttpStatusCode) {
	return (message?: string) => {
		throw new ApiError(statusCode, message ?? `Unknown Error`);
	};
}
