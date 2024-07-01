import { defineConfig } from 'vitest/config'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd());

export default defineConfig({
	plugins: [],
	test: {
		environment: 'node',
	},
});