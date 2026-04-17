/**
 * Test Data Configuration
 *
 * This file exports commonly used test data and constants.
 */

export const TEST_DATA = {
  // Authentication Token (from iDempiere)
  AUTH_TOKEN: process.env['AUTH_TOKEN'] || '',
  
  // API Key for platform endpoints
  API_KEY: process.env['API_KEY'] || '',

  // HTTP Status Codes
  STATUS_CODES: {
    // Success Codes
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // Redirection Codes
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,

    // Client Error Codes
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    CONFLICT: 409,
    GONE: 410,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // Server Error Codes
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },

  // Timeouts (in milliseconds)
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 15000,
    LONG: 30000,
    EXTRA_LONG: 60000,
  },

  // Common Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not Found',
    VALIDATION_ERROR: 'Validation Error',
    SERVER_ERROR: 'Internal Server Error',
  },

  // GraphQL Error Codes
  GRAPHQL_ERROR_CODES: {
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    FORBIDDEN: 'FORBIDDEN',
    BAD_USER_INPUT: 'BAD_USER_INPUT',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  },
};
