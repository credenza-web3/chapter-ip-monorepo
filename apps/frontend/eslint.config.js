import { getConfig } from '@repo/eslint-config/svelte'

import svelteConfig from './svelte.config.js'

const config = getConfig({ svelteConfig, tsconfigRootDir: import.meta.dirname })

/** @type {import("eslint").Linter.Config} */
export default config
