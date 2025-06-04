export default [
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
  {
    ignores: [
      'dist/**', 
      'node_modules/**', 
      '*.config.js',
      'auto-fix-critical.js',
      'scripts/diagnose.js',
      'scripts/**/*.js'
    ],
  },
];
