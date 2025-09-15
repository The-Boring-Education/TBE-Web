module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'simple-import-sort', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'next',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier', // Prettier disables conflicting formatting rules
  ],
  rules: {
    //#region 🔧 Auto-fixable Code Cleanliness

    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'no-duplicate-imports': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'object-shorthand': ['warn', 'always'],
    'arrow-body-style': ['warn', 'as-needed'],
    'prefer-template': 'warn',
    'template-curly-spacing': ['warn', 'never'],
    'no-multi-spaces': 'warn',

    //#endregion

    //#region 📦 Import Sorting and Management
    'simple-import-sort/exports': 'warn',
    'simple-import-sort/imports': 'warn',
    'import/no-duplicates': 'warn',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    //#endregion

    //#region ⚛️ JSX and React Practices
    'react/display-name': 'off',
    'react/jsx-curly-brace-presence': [
      'warn',
      { props: 'never', children: 'never' },
    ],
    'react/no-unescaped-entities': 'off',
    'react/jsx-boolean-value': ['warn', 'never'],
    'react/self-closing-comp': 'warn',
    //#endregion

    //#region 🧼 TypeScript Enhancements
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    //#endregion
  },
  globals: {
    React: true,
    JSX: true,
  },
};
