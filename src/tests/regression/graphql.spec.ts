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
import { isTokenExpired } from '@helpers/token-validator.helper';

describe('GraphQL API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Fetch auth token once and reuse across tests
    authToken = await getAuthToken();
  });

  it('should execute getMe query with authentication', async () => {
    // Check if token is expired before running test
    if (isTokenExpired(authToken)) {
      console.warn('⚠️  Skipping test: AUTH_TOKEN is expired or invalid');
      console.warn('Update AUTH_TOKEN in .env file or configure Trek credentials');
      return;
    }
    
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
      });

    // Debug: Log response details
    console.log('\n📋 Response Status:', response.statusCode);
    console.log('📋 Response Body:', JSON.stringify(response.body, null, 2));
    
    // Check if authentication failed with helpful message
    if (response.statusCode === TEST_DATA.STATUS_CODES.OK && response.body.errors) {
      const authError = response.body.errors.find(
        (err: any) => err.extensions?.code === 'UNAUTHENTICATED'
      );
      
      if (authError) {
        console.error('═'.repeat(80));
        console.error('⚠️  AUTHENTICATION ERROR');
        console.error('═'.repeat(80));
        console.error('\nThe GraphQL API rejected the authentication token.');
        console.error('\nTo fix this issue:');
        console.error('1. Set API_KEY in .env file (required for all authenticated endpoints)');
        console.error('2. Get a valid JWT token for the test environment');
        console.error('3. Update AUTH_TOKEN in .env file, OR');
        console.error('4. Configure Trek login credentials in .env:');
        console.error('   - TREK_BASE_URL');
        console.error('   - TREK_USERNAME');
        console.error('   - TREK_PASSWORD');
        console.error('   - TREK_CLIENT_ID');
        console.error('   - TREK_ROLE_ID');
        console.error('   - TREK_ORGANIZATION_ID');
        console.error('   - TREK_WAREHOUSE_ID');
        console.error('   - TREK_LANGUAGE (optional)');
        console.error('\nCurrent token (first 50 chars):', authToken.substring(0, 50) + '...');
        console.error('═'.repeat(80));
        
        // Fail the test with a clear message
        throw new Error(
          'Authentication failed: Token is invalid or expired. ' +
          'Please configure valid credentials in .env file. ' +
          'See console output above for details.'
        );
      }
    }

    // Assert successful response
    expect(response.statusCode).toBe(TEST_DATA.STATUS_CODES.OK);
    
    // Validate GraphQL response structure
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.getMe).toBeDefined();
    expect(response.body.data.getMe).not.toBeNull();

    // Log response for debugging
    console.log('✅ GraphQL Response:', JSON.stringify(response.body, null, 2));
  });
});
