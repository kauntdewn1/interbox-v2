import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        globals: {
          // Browser globals
          window: 'readonly',
          document: 'readonly',
          navigator: 'readonly',
          console: 'readonly',
          localStorage: 'readonly',
          sessionStorage: 'readonly',
          setTimeout: 'readonly',
          clearTimeout: 'readonly',
          setInterval: 'readonly',
          clearInterval: 'readonly',
          fetch: 'readonly',
          alert: 'readonly',
          process: 'readonly',
          // React globals
          React: 'readonly',
          // TypeScript globals
          HTMLInputElement: 'readonly',
          HTMLTextAreaElement: 'readonly',
          HTMLSelectElement: 'readonly',
          File: 'readonly',
          FileReader: 'readonly',
          Event: 'readonly',
          MediaQueryListEvent: 'readonly',
          URLSearchParams: 'readonly',
          // Database globals
          Database: 'readonly',
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // Regras personalizadas - mais permissivas
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-refresh/only-export-components': 'off',
      
      // Desabilitar regras de formatação por enquanto
      'quotes': 'off',
      'semi': 'off',
      'comma-dangle': 'off',
      'indent': 'off',
      
      // Regras de React essenciais
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      
      // Desabilitar regras problemáticas
      'no-undef': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      'coverage/**',
      'clerk-react/**',
      'dev-dist/**',
      '*.config.js',
      '*.config.ts',
      'vite.config.*',
      'tailwind.config.*',
      'postcss.config.*',
    ],
  },
];
