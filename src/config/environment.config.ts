/**
 * Environment Configuration
 *
 * This file loads environment-specific settings for API testing.
 * You can switch between local, dev, sand, or prod environments.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file if exists
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Helper to get log level from env or default
const getLogLevel = (
  defaultLevel: 'debug' | 'info' | 'warn' | 'error',
): 'debug' | 'info' | 'warn' | 'error' => {
  const envLogLevel = process.env['LOG_LEVEL']?.toLowerCase();
  if (envLogLevel && ['debug', 'info', 'warn', 'error'].includes(envLogLevel)) {
    return envLogLevel as 'debug' | 'info' | 'warn' | 'error';
  }
  return defaultLevel;
};

export interface EnvironmentConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: 'local',
    baseUrl: process.env['LOCAL_BASE_URL'] || 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 0,
    logLevel: getLogLevel('debug'),
  },
  dev: {
    name: 'dev',
    baseUrl: process.env['DEV_BASE_URL'] || 'https://api-dev.example.com',
    timeout: 30000,
    retryAttempts: 1,
    logLevel: getLogLevel('info'),
  },
  sand: {
    name: 'sand',
    baseUrl: process.env['SAND_BASE_URL'] || 'https://api-sand.example.com',
    timeout: 30000,
    retryAttempts: 1,
    logLevel: getLogLevel('info'),
  },
  prod: {
    name: 'prod',
    baseUrl: process.env['PROD_BASE_URL'] || 'https://api.example.com',
    timeout: 30000,
    retryAttempts: 2,
    logLevel: getLogLevel('warn'),
  },
};

// Get current environment from ENV variable or default to 'local'
const currentEnv = process.env['TEST_ENV'] || 'local';

if (!environments[currentEnv]) {
  throw new Error(
    `Invalid environment: ${currentEnv}. Valid options are: ${Object.keys(environments).join(', ')}`,
  );
}

export const config: EnvironmentConfig = environments[currentEnv];
