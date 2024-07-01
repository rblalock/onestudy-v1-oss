import { NextApiRequest } from 'next';

/**
 * @name getClientIp
 * @param req
 * @description Given an API request {@link NextApiRequest} return the IP
 * address of the client calling the API
 */
export function getClientIp(req: NextApiRequest) {
	const forwardedFor = req.headers['x-forwarded-for'];

	return (
		(typeof forwardedFor === 'string' && forwardedFor.split(',').shift()) ||
		req.socket?.remoteAddress
	);
}
