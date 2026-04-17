/**
 * Profile API Tests
 *
 * These tests verify the /api/auth/profile endpoint with authentication.
 * This endpoint requires a valid Trek authentication token.
 *
 * Tags: @smoke @profile @auth
 */

import { ProfileService } from '@services/profile.service';
import { getAuthToken } from '@helpers/auth.helper';
import { TEST_DATA } from '@config/test-data.config';
import { isTokenExpired } from '@helpers/token-validator.helper';

describe('Profile API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Fetch auth token once and reuse across tests
    authToken = await getAuthToken();
  });

  it('should return user profile with valid authentication', async () => {
    // Check if token is expired before running test
    if (isTokenExpired(authToken)) {
      console.warn('⚠️  Skipping test: AUTH_TOKEN is expired or invalid');
      console.warn('Update AUTH_TOKEN in .env file or configure Trek credentials');
      return;
    }
    
    const response = await ProfileService.getProfile(authToken);

    // Check if authentication failed
    if (response.statusCode === TEST_DATA.STATUS_CODES.UNAUTHORIZED) {
      console.error('═'.repeat(80));
      console.error('⚠️  AUTHENTICATION ERROR');
      console.error('═'.repeat(80));
      console.error('\nThe Profile API rejected the authentication token.');
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
      
      throw new Error(
        'Authentication failed: Token is invalid or expired. ' +
        'Please configure valid credentials in .env file. ' +
        'See console output above for details.'
      );
    }

    // Assert successful response
    expect(response.statusCode).toBe(TEST_DATA.STATUS_CODES.OK);

    // Validate response has user data
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('username');
    
    // Log response for debugging
    console.log('✅ Profile Response:', JSON.stringify(response.body, null, 2));
  });
});
