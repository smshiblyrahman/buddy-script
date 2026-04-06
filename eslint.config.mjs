import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const next = require('eslint-config-next')

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...next,
  {
    ignores: [
      'Selection Task for Full Stack Engineer at Appifylab/**',
      'public/**',
      '.next/**',
      'node_modules/**',
    ],
  },
]

export default eslintConfig
