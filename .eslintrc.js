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

    'no-console': 'warn', // warn on console.log
    'no-unused-vars': 'off', // disable in favor of plugin below
    '@typescript-eslint/no-unused-vars': 'off', // disable in favor of unused-imports
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
    '@typescript-eslint/no-explicit-any': 'off',

    //#endregion

    //#region ✨ Auto-fixable JSX Consistency
    'react/display-name': 'off',
    'react/jsx-curly-brace-presence': [
      'warn',
      { props: 'never', children: 'never' },
    ],
    'react/no-unescaped-entities': 'off',
    //#endregion

    //#region 🎯 Auto-fixable Import Sort
    'simple-import-sort/exports': 'warn',
    'simple-import-sort/imports': 'warn',
    //#endregion
  },
  globals: {
    React: true,
    JSX: true,
  },
};
