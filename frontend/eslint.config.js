import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 允许显式 any 类型（数据展示组件中大量使用）
      '@typescript-eslint/no-explicit-any': 'off',
      // 允许未使用变量（以 _ 开头即可）
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // 放宽 react-hooks/exhaustive-deps（warning -> off）
      'react-hooks/exhaustive-deps': 'off',
      // 允许在 effect 中调用 setState（已有其他规范约束）
      'react-hooks/set-state-in-effect': 'off',
      // 允许渲染时调用 impure 函数
      'react-hooks/purity': 'off',
    },
  },
])
