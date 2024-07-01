import { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@/server/utils/http';
import { throwMethodNotAllowedException } from '@/server/utils/http-exceptions';

/**
 * @param methods
 * @description guard an API endpoint against unsupported methods
 * It can be used as a middleware for your writing your API handlers. For
 * example, if you API only supports GET requests:
 *
 * export default withPipe(
 *    withAdmin(),
 *    withMethodsGuard(['GET']),
 *    (req, res) => {...}
 * );
 */
export function withMethodsGuard(methods: HttpMethod[]) {
	return function methodsGuard(req: NextApiRequest, res: NextApiResponse) {
		const method = req.method as HttpMethod;

		if (!methods.includes(method)) {
			throwMethodNotAllowedException(res, methods, method);
		}
	};
}
