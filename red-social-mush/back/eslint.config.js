import {defineConfig} from 'eslint/config'

export default defineConfig(
// disable prettier error reporting for TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'prettier/prettier': 'off',
      '@typescript-eslint': 'off',
      'linebreak-style': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
)
