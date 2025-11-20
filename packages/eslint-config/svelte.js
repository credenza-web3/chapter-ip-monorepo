import prettier from 'eslint-config-prettier'

import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'

import { config as baseConfig } from './base.js'

export const getConfig = ({ svelteConfig }) => {
  return ts.config(
    ...baseConfig,
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs.recommended,
    prettier,
    ...svelte.configs.prettier,
    {
      languageOptions: {
        globals: { ...globals.browser, ...globals.node },
      },
      rules: {
        // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
        // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
        'no-undef': 'off',
        'svelte/no-navigation-without-resolve': 'off',
      },
    },
    {
      files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
      languageOptions: {
        parserOptions: {
          projectService: true,
          extraFileExtensions: ['.svelte'],
          parser: ts.parser,
          svelteConfig,
        },
      },
    },
    {
      ignores: ['**/.svelte-kit/**'],
    },
  )
}
