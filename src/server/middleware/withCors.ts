import { NextApiRequest, NextApiResponse } from "next";
import NextCors from 'nextjs-cors';

export function withCors(
	methods?: HttpMethod[],
	origin?: string
) {
	return async function corsHandler(req: NextApiRequest, res: NextApiResponse) {
		await NextCors(req, res, {
			methods: methods || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
			origin: origin || '*',
			optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
		});
	};
}