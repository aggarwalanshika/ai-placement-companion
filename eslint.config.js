import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      'no-unused-vars': 'off', // turned off in favor of TS compiler check
      '@typescript-eslint/no-unused-vars': 'off', // turned off in favor of TS compiler check
      'no-console': 'warn',
    },
  },
];
