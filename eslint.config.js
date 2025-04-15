import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import cssModules from 'eslint-plugin-css-modules'
import tseslint from 'typescript-eslint'
import { rules as checkMissingClassesRules } from './eslint-rules/check-missing-classes.js'
export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      // 'css-modules': cssModules,
      "check-missing-classes": { rules: checkMissingClassesRules }
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "check-missing-classes/no-missing-styles": "error" 
    
    },
  },
)
