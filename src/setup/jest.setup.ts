/**
 * Jest Setup File
 *
 * This file runs before each test suite and initializes Pactum.
 */

import { initializePactum, cleanupPactum } from '@config/pactum.config';
import { config } from '@config/environment.config';
import { CleanupHelper } from '@helpers/cleanup.helper';

// Initialize Pactum before all tests
beforeAll(() => {
  console.log(`\n🚀 Starting API Tests`);
  console.log(`📍 Environment: ${config.name}`);
  console.log(`🌐 Base URL: ${config.baseUrl}`);
  console.log(`⏱️  Timeout: ${config.timeout}ms\n`);

  initializePactum();
});

// Cleanup after all tests
afterAll(async () => {
  // Clean up any tracked resources
  await CleanupHelper.cleanupAll();
  
  console.log('\n✅ All tests completed');
  cleanupPactum();
});

// Set longer timeout for integration tests
jest.setTimeout(config.timeout);
