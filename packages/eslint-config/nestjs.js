// @ts-check
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { config as baseConfig } from './base.js'

/** @param {{ tsconfigRootDir?: string }} options */
export const getConfig = ({ tsconfigRootDir }) => {
  return tseslint.config(
    ...baseConfig,
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
        parserOptions: {
          projectService: {
            allowDefaultProject: ['*.js', '*.mjs', '*.config.mjs', '*.config.js', '*.config.ts'],
          },
          ...(tsconfigRootDir ? { tsconfigRootDir } : {}),
        },
      },
    },
    {
      files: ['*.mjs', '*.js', '*.config.mjs', '*.config.js'],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
      },
    },
  )
}

export default getConfig({ tsconfigRootDir: import.meta.dirname })
