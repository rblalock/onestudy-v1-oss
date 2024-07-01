import { verifyKey } from "@unkey/api";
import { NextApiRequest, NextApiResponse } from 'next';

import { throwUnauthorizedException } from '@/server/utils/http-exceptions';

export function withApiKey() {
	return async function apiKeyCheck(req: NextApiRequest, res: NextApiResponse) {
		const key = req.headers['x-api-key'];

		if (!key) {
			throwUnauthorizedException('Missing API key');
		}

		const { result, error } = await verifyKey(key as string);

		if (error || !result.valid) {
			throwUnauthorizedException('Invalid API key');
		}

		return result;
	};
}
