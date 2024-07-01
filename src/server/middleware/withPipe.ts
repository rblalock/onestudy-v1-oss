import { NextApiRequest, NextApiResponse } from 'next';

type Middleware = (req: NextApiRequest, res: NextApiResponse) => unknown;

/**
 * @name withPipe
 * @description combine multiple middleware before handling your API endpoint
 *
 * For example, any function that accepts (req: NextApiRequest, res:
 * NextApiResponse) can be chained
 *
 * export default withPipe(
 *   withAdmin,
 *   withAuthedUser,
 *   withMethodsGuard(['GET']),
 *   (req: NextApiRequest, res: NextApiResponse) => {
 *    // you can decide to kill the request earlier
 *     if (!req.query.data) {
 *       return res.status(500).end()
 *     }
 *   },
 *   (req: NextApiRequest, res: NextApiResponse) => {
 *    // if all is good, the last function will be final
 *     return res.send('Hello');
 *   }
 * )
 *
 * @param middlewares
 */
export function withPipe(...middlewares: Middleware[]) {
	return async function withPipeHandler(
		req: NextApiRequest,
		res: NextApiResponse
	) {
		for (const middleware of middlewares) {
			// return early when the request has
			// been ended by a previous middleware
			if (res.headersSent) {
				return;
			}

			await middleware(req, res);
		}
	};
}
