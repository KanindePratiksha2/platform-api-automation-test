/**
 * Response Validators and Schemas
 *
 * This file contains reusable JSON schemas and validators for API responses.
 * Use these with Pactum's expectJsonSchema() or expectJsonMatch() methods.
 */

/**
 * JSON Schemas for API Responses
 */
export const Schemas = {
  /**
   * Health Check Response Schema
   */
  healthCheck: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ok', 'healthy'] },
      timestamp: { type: 'number' },
      version: { type: 'string' },
    },
    required: ['status'],
  },

  /**
   * GraphQL Success Response Schema
   */
  graphqlSuccess: {
    type: 'object',
    properties: {
      data: { type: 'object' },
    },
    required: ['data'],
    not: {
      required: ['errors'],
    },
  },

  /**
   * GraphQL Error Response Schema
   */
  graphqlError: {
    type: 'object',
    properties: {
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            locations: { type: 'array' },
            path: { type: 'array' },
            extensions: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                statusCode: { type: 'number' },
              },
            },
          },
          required: ['message'],
        },
      },
    },
    required: ['errors'],
  },

  /**
   * Standard Error Response Schema
   */
  errorResponse: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      statusCode: { type: 'number' },
      error: { type: 'string' },
      timestamp: { type: 'string' },
    },
    required: ['message', 'statusCode'],
  },

  /**
   * Validation Error Response Schema
   */
  validationError: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      statusCode: { type: 'number' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            message: { type: 'string' },
          },
          required: ['field', 'message'],
        },
      },
    },
    required: ['message', 'statusCode', 'errors'],
  },

  /**
   * Pagination Response Schema
   */
  paginatedResponse: {
    type: 'object',
    properties: {
      data: { type: 'array' },
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          pageSize: { type: 'number' },
          total: { type: 'number' },
          totalPages: { type: 'number' },
        },
        required: ['page', 'pageSize', 'total'],
      },
    },
    required: ['data', 'pagination'],
  },
};

/**
 * Pactum Matchers for Response Validation
 */
export const Matchers = {
  /**
   * Match health check response
   */
  healthCheck: {
    status: /^(ok|healthy)$/,
  },

  /**
   * Match GraphQL success response
   */
  graphqlSuccess: {
    data: 'object',
  },

  /**
   * Match GraphQL error response with specific code
   */
  graphqlErrorWithCode: (code: string) => ({
    errors: [
      {
        message: 'string',
        extensions: {
          code: code,
        },
      },
    ],
  }),

  /**
   * Match UUID format
   */
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  /**
   * Match email format
   */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * Match ISO 8601 date format
   */
  isoDate: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,

  /**
   * Match JWT token format
   */
  jwtToken: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
};

/**
 * Custom Validators
 */
export class ResponseValidator {
  /**
   * Validate that response has no GraphQL errors
   */
  static hasNoGraphQLErrors(response: any): boolean {
    return response.body.errors === undefined;
  }

  /**
   * Validate that response has GraphQL data
   */
  static hasGraphQLData(response: any): boolean {
    return (
      response.body.data !== undefined && response.body.data !== null
    );
  }

  /**
   * Validate GraphQL error code
   */
  static hasGraphQLErrorCode(response: any, expectedCode: string): boolean {
    if (!response.body.errors || response.body.errors.length === 0) {
      return false;
    }
    return response.body.errors.some(
      (error: any) => error.extensions?.code === expectedCode,
    );
  }

  /**
   * Validate response time is within acceptable range
   */
  static isResponseTimeAcceptable(response: any, maxMs: number): boolean {
    return response.responseTime <= maxMs;
  }

  /**
   * Validate pagination metadata
   */
  static hasValidPagination(response: any): boolean {
    const { pagination } = response.body;
    if (!pagination) return false;

    return (
      pagination.page >= 1 &&
      pagination.pageSize > 0 &&
      pagination.total >= 0 &&
      pagination.totalPages >= 0
    );
  }

  /**
   * Validate array is not empty
   */
  static isNonEmptyArray(data: any): boolean {
    return Array.isArray(data) && data.length > 0;
  }
}
