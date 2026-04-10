/**
 * Authentication Helper
 *
 * This module provides helper functions for authentication in API tests.
 * Can use either a static JWT token or dynamically fetch from Trek Login endpoint.
 */

import * as pactum from 'pactum';
import { TEST_DATA } from '@config/test-data.config';

// Cache for token to avoid repeated login calls
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Login to Trek and get authentication token
 * @returns Access token from Trek Login API
 */
export async function loginToTrek(): Promise<string> {
  const trekBaseUrl = process.env['TREK_BASE_URL'];
  const username = process.env['TREK_USERNAME'];
  const password = process.env['TREK_PASSWORD'];
  const clientId = process.env['TREK_CLIENT_ID'];
  const roleId = process.env['TREK_ROLE_ID'];
  const organizationId = process.env['TREK_ORGANIZATION_ID'];
  const warehouseId = process.env['TREK_WAREHOUSE_ID'];
  const language = process.env['TREK_LANGUAGE'] || 'en_US';

  if (!trekBaseUrl || !username || !password) {
    throw new Error(
      'Trek login credentials not configured. Set TREK_BASE_URL, TREK_USERNAME, and TREK_PASSWORD in .env'
    );
  }

  console.log('🔐 Logging in to Trek to get authentication token...');

  try {
    const response = await pactum
      .spec()
      .post(`${trekBaseUrl}/auth/tokens`)
      .withJson({
        userName: username,
        password: password,
        parameters: {
          clientId: clientId,
          roleId: roleId,
          organizationId: organizationId,
        },
        language: language,
        menuIseeId: 10,
      })
      .expectStatus(200);

    const token = response.body.token;

    if (!token) {
      throw new Error('Token not found in Trek login response');
    }

    console.log('✅ Successfully obtained authentication token from Trek');
    return token;
  } catch (error) {
    console.error('❌ Failed to login to Trek:', error);
    throw new Error(`Trek login failed: ${error}`);
  }
}

/**
 * Get authentication token
 * First tries to use cached token, then static token from env, then fetches from Trek Login
 * @returns Access token
 */
export async function getAuthToken(): Promise<string> {
  // Check if cached token is still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('ℹ️  Using cached authentication token');
    return cachedToken;
  }

  // Try static token from environment first
  const staticToken = TEST_DATA.AUTH_TOKEN;
  if (staticToken && staticToken !== 'your-jwt-token-here') {
    console.log('ℹ️  Using static token from .env file');
    cachedToken = staticToken;
    // Set expiry for 1 hour (adjust based on your token TTL)
    tokenExpiry = Date.now() + 3600000;
    return staticToken;
  }

  // Fetch from Trek Login if no static token
  console.log('ℹ️  No static token found, fetching from Trek Login...');
  const token = await loginToTrek();

  // Cache the token
  cachedToken = token;
  // Set expiry for 1 hour (adjust based on your token TTL)
  tokenExpiry = Date.now() + 3600000;

  return token;
}

/**
 * Clear cached token (useful for testing token refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = null;
  console.log('🔄 Token cache cleared');
}

/**
 * Get authorization headers with Bearer token
 * @param token - Access token
 * @returns Headers object with Authorization
 */
export function getBearerAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}
