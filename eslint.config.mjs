// ESLint configuration for API Automation Tests
// Standalone configuration - no base config needed

export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Add project-specific rules here
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // TypeScript-specific rules
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      // JavaScript-specific rules
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'reports/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];
