import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Ignore build output and generated files
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Hooks rules (exhaustive-deps catches missing useEffect deps)
      ...reactHooks.configs.recommended.rules,

      // Vite HMR: only export components from TSX files
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript — relax a few overly strict defaults
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // React 19: no need to import React for JSX
      'no-unused-vars': 'off', // handled by @typescript-eslint/no-unused-vars
    },
  },

  // Test files: relax rules that are impractical for mock-heavy test code
  {
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Context files legitimately export both provider + hook
      'react-refresh/only-export-components': 'off',
    },
  },

  // Disable all formatting rules — Prettier owns those
  prettierConfig,
);
