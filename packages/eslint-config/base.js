import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('../../.gitignore', import.meta.url))
console.log('Using gitignore for eslint:', gitignorePath)

console.log(includeIgnoreFile(gitignorePath))

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  includeIgnoreFile(gitignorePath),
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**'],
  },
]
