/* eslint-disable */
export default {
  displayName: 'api-automation-tests',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js)/)',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage',
  testMatch: ['**/tests/**/*.spec.ts', '**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/setup/jest.setup.ts'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@fixtures/(.*)$': '<rootDir>/src/fixtures/$1',
    '^@validators/(.*)$': '<rootDir>/src/validators/$1',
    '^@services$': '<rootDir>/src/services/index.ts',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@api-types/(.*)$': '<rootDir>/src/types/$1',
  },
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'API Automation Test Report',
        outputPath: '<rootDir>/reports/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
      },
    ],
  ],
  testTimeout: 30000,
  maxWorkers: 5,
  verbose: true,
};
