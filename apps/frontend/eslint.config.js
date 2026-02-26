import { getConfig } from '@repo/eslint-config/svelte'

import svelteConfig from './svelte.config.js'

const config = getConfig({ svelteConfig })

/** @type {import("eslint").Linter.Config} */
export default config

// module.exports = {
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     tsconfigRootDir: __dirname,
//     project: ['./tsconfig.json'],
//   },
// }
