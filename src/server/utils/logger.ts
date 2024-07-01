import pino from 'pino';

/**
 * @name getPino
 * @description Get a Pino logger instance
 */
function getPino() {
	const isDev = process.env.NODE_ENV !== 'production';

	// we inject "pino-pretty" only in dev mode to make our console logs look nice
	if (isDev) {
		// const pretty = require('pino-pretty');

		return pino(
			{
				browser: {},
				level: 'debug',
				base: {
					env: process.env.NODE_ENV
				},
			},
			// pretty({
			// 	colorize: true,
			// })
		);
	}

	return pino({
		browser: {},
		level: 'info',
		base: {
			env: process.env.NODE_ENV,
			revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
		},
	});
}

export default getPino();
