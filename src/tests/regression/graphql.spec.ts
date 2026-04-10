/**
 * GraphQL API Tests
 *
 * These tests verify the GraphQL endpoint with authenticated queries.
 *
 * Tags: @regression @graphql
 */

import * as pactum from 'pactum';
import { API_ENDPOINTS } from '@config/endpoints.config';
import { TEST_DATA } from '@config/test-data.config';
import { getAuthToken, getBearerAuthHeaders } from '@helpers/auth.helper';

describe('GraphQL API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Fetch auth token once and reuse across tests
    authToken = await getAuthToken();
  });

  it('should execute getMe query with authentication', async () => {
    const response = await pactum
      .spec()
      .post(API_ENDPOINTS.GRAPHQL)
      .withHeaders(getBearerAuthHeaders(authToken))
      .withJson({
        query: `
          query {
            getMe
          }
        `,
      })
      .expectStatus(TEST_DATA.STATUS_CODES.OK);

    // Validate GraphQL response structure
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.getMe).toBeDefined();
    expect(response.body.data.getMe).not.toBeNull();

    // Log response for debugging
    console.log('GraphQL Response:', JSON.stringify(response.body, null, 2));
  });
});
