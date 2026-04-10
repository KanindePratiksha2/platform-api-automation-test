/**
 * Health Check API Tests
 *
 * These tests verify that the health check endpoint is working correctly.
 * This is a smoke test to verify the API is up and running.
 *
 * Tags: @smoke @health
 */

import * as pactum from 'pactum';
import { API_ENDPOINTS } from '@config/endpoints.config';
import { TEST_DATA } from '@config/test-data.config';

describe('Health Check API', () => {
  it('should return 200 and health status', async () => {
    await pactum
      .spec()
      .get(API_ENDPOINTS.HEALTH)
      .expectStatus(TEST_DATA.STATUS_CODES.OK)
      .expectJsonLike({
        status: 'ok',
      });
  });
});
