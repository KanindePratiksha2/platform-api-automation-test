/**
 * Pactum Configuration
 *
 * This file contains global Pactum.js settings including:
 * - Request/response logging
 * - Default headers
 * - Custom matchers
 * - Retry logic
 */

import * as pactum from 'pactum';
import { config } from './environment.config';
import { registerAllHandlers } from '@helpers/pactum.handlers';

/**
 * Initialize Pactum with global settings
 */
export function initializePactum(): void {
  // Set base URL
  pactum.request.setBaseUrl(config.baseUrl);

  // Set default timeout
  pactum.request.setDefaultTimeout(config.timeout);

  // Set default headers (will be applied to all requests)
  pactum.request.setDefaultHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'Pactum-API-Tests/1.0',
  });

  // Enable request/response logging based on log level
  if (config.logLevel === 'debug') {
    pactum.settings.setLogLevel('DEBUG');
  } else if (config.logLevel === 'info') {
    pactum.settings.setLogLevel('INFO');
  } else {
    pactum.settings.setLogLevel('ERROR');
  }

  // Configure retry settings
  pactum.settings.setReporterAutoRun(false);

  // Register custom handlers, matchers, and retry logic
  registerAllHandlers();
}

/**
 * Cleanup Pactum after tests
 */
export function cleanupPactum(): void {
  // Add any cleanup logic here if needed
  // Note: handler.clear() and state.clear() are not available in newer versions
}

export default {
  initializePactum,
  cleanupPactum,
};
