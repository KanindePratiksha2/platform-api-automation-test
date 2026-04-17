/**
 * Assertion Helpers
 *
 * This file provides reusable assertion functions for common test scenarios.
 * These helpers make tests more readable and maintainable.
 */

import { TEST_DATA } from '@config/test-data.config';

/**
 * GraphQL Response Assertions
 */
export class GraphQLAssertions {
  /**
   * Assert GraphQL response is successful (no errors)
   *
   * @param response - Pactum response object
   * @returns The data from the response
   */
  static expectSuccess(response: any) {
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toBeNull();

    return response.body.data;
  }

  /**
   * Assert GraphQL response has errors
   *
   * @param response - Pactum response object
   * @param errorCode - Optional expected error code
   * @returns The errors array from the response
   */
  static expectError(response: any, errorCode?: string) {
    expect(response.body.errors).toBeDefined();
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);

    if (errorCode) {
      const hasCode = response.body.errors.some(
        (error: any) => error.extensions?.code === errorCode,
      );
      expect(hasCode).toBe(true);
    }

    return response.body.errors;
  }

  /**
   * Assert GraphQL unauthenticated error
   *
   * @param response - Pactum response object
   */
  static expectUnauthenticated(response: any) {
    const errors = this.expectError(
      response,
      TEST_DATA.GRAPHQL_ERROR_CODES.UNAUTHENTICATED,
    );

    const error = errors[0];
    expect(error.extensions?.statusCode).toBe(
      TEST_DATA.STATUS_CODES.UNAUTHORIZED,
    );
  }

  /**
   * Assert GraphQL forbidden error
   *
   * @param response - Pactum response object
   */
  static expectForbidden(response: any) {
    const errors = this.expectError(
      response,
      TEST_DATA.GRAPHQL_ERROR_CODES.FORBIDDEN,
    );

    const error = errors[0];
    expect(error.extensions?.statusCode).toBe(TEST_DATA.STATUS_CODES.FORBIDDEN);
  }

  /**
   * Assert GraphQL bad user input error
   *
   * @param response - Pactum response object
   */
  static expectBadUserInput(response: any) {
    this.expectError(response, TEST_DATA.GRAPHQL_ERROR_CODES.BAD_USER_INPUT);
  }

  /**
   * Assert GraphQL response has specific field
   *
   * @param data - GraphQL data object
   * @param field - Field name to check
   */
  static expectField(data: any, field: string) {
    expect(data).toHaveProperty(field);
    expect(data[field]).toBeDefined();
  }

  /**
   * Assert GraphQL response has specific fields
   *
   * @param data - GraphQL data object
   * @param fields - Array of field names to check
   */
  static expectFields(data: any, fields: string[]) {
    fields.forEach((field) => this.expectField(data, field));
  }
}

/**
 * REST API Response Assertions
 */
export class RestAssertions {
  /**
   * Assert response has expected status code
   *
   * @param response - Pactum response object
   * @param expectedStatus - Expected HTTP status code
   */
  static expectStatus(response: any, expectedStatus: number) {
    expect(response.statusCode).toBe(expectedStatus);
  }

  /**
   * Assert response is successful (2xx)
   *
   * @param response - Pactum response object
   */
  static expectSuccess(response: any) {
    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(300);
  }

  /**
   * Assert response has error (4xx or 5xx)
   *
   * @param response - Pactum response object
   */
  static expectError(response: any) {
    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  }

  /**
   * Assert response body is an object
   *
   * @param response - Pactum response object
   */
  static expectObject(response: any) {
    expect(response.body).toBeDefined();
    expect(typeof response.body).toBe('object');
    expect(Array.isArray(response.body)).toBe(false);
  }

  /**
   * Assert response body is an array
   *
   * @param response - Pactum response object
   * @param minLength - Optional minimum array length
   */
  static expectArray(response: any, minLength?: number) {
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);

    if (minLength !== undefined) {
      expect(response.body.length).toBeGreaterThanOrEqual(minLength);
    }
  }

  /**
   * Assert response has specific header
   *
   * @param response - Pactum response object
   * @param headerName - Header name to check
   * @param expectedValue - Optional expected header value
   */
  static expectHeader(
    response: any,
    headerName: string,
    expectedValue?: string,
  ) {
    const headerValue = response.headers[headerName.toLowerCase()];
    expect(headerValue).toBeDefined();

    if (expectedValue) {
      expect(headerValue).toBe(expectedValue);
    }
  }

  /**
   * Assert response time is within acceptable range
   *
   * @param response - Pactum response object
   * @param maxMs - Maximum acceptable response time in milliseconds
   */
  static expectFastResponse(response: any, maxMs: number = 2000) {
    expect(response.responseTime).toBeLessThanOrEqual(maxMs);
  }
}

/**
 * Validation Error Assertions
 */
export class ValidationAssertions {
  /**
   * Assert validation error response
   *
   * @param response - Pactum response object
   * @param expectedFields - Optional array of field names that should have errors
   */
  static expectValidationError(response: any, expectedFields?: string[]) {
    expect(response.statusCode).toBe(
      TEST_DATA.STATUS_CODES.UNPROCESSABLE_ENTITY,
    );
    expect(response.body.errors).toBeDefined();
    expect(Array.isArray(response.body.errors)).toBe(true);

    if (expectedFields) {
      expectedFields.forEach((field) => {
        const hasError = response.body.errors.some(
          (error: any) => error.field === field,
        );
        expect(hasError).toBe(true);
      });
    }
  }

  /**
   * Assert specific field has validation error
   *
   * @param response - Pactum response object
   * @param field - Field name
   * @param expectedMessage - Optional expected error message
   */
  static expectFieldError(
    response: any,
    field: string,
    expectedMessage?: string,
  ) {
    const fieldError = response.body.errors.find(
      (error: any) => error.field === field,
    );

    expect(fieldError).toBeDefined();

    if (expectedMessage) {
      expect(fieldError.message).toContain(expectedMessage);
    }
  }
}

/**
 * Pagination Assertions
 */
export class PaginationAssertions {
  /**
   * Assert response has valid pagination metadata
   *
   * @param response - Pactum response object
   */
  static expectValidPagination(response: any) {
    expect(response.body.pagination).toBeDefined();

    const { pagination } = response.body;

    expect(pagination.page).toBeGreaterThanOrEqual(1);
    expect(pagination.pageSize).toBeGreaterThan(0);
    expect(pagination.total).toBeGreaterThanOrEqual(0);
    expect(pagination.totalPages).toBeGreaterThanOrEqual(0);

    // Total pages should match calculation
    const expectedPages = Math.ceil(pagination.total / pagination.pageSize);
    expect(pagination.totalPages).toBe(expectedPages);
  }

  /**
   * Assert pagination data array matches page size
   *
   * @param response - Pactum response object
   */
  static expectCorrectPageSize(response: any) {
    const { data, pagination } = response.body;

    expect(Array.isArray(data)).toBe(true);

    // Data length should not exceed page size
    expect(data.length).toBeLessThanOrEqual(pagination.pageSize);

    // If not the last page, data should equal page size
    if (pagination.page < pagination.totalPages) {
      expect(data.length).toBe(pagination.pageSize);
    }
  }
}

/**
 * Common Assertions
 */
export class CommonAssertions {
  /**
   * Assert value is a valid UUID
   *
   * @param value - Value to check
   */
  static expectUUID(value: any) {
    expect(typeof value).toBe('string');
    expect(value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  }

  /**
   * Assert value is a valid email
   *
   * @param value - Value to check
   */
  static expectEmail(value: any) {
    expect(typeof value).toBe('string');
    expect(value).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  /**
   * Assert value is a valid ISO date
   *
   * @param value - Value to check
   */
  static expectISODate(value: any) {
    expect(typeof value).toBe('string');
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(new Date(value).toString()).not.toBe('Invalid Date');
  }

  /**
   * Assert value is a valid URL
   *
   * @param value - Value to check
   */
  static expectURL(value: any) {
    expect(typeof value).toBe('string');
    expect(() => new URL(value)).not.toThrow();
  }

  /**
   * Assert array is not empty
   *
   * @param value - Value to check
   */
  static expectNonEmptyArray(value: any) {
    expect(Array.isArray(value)).toBe(true);
    expect(value.length).toBeGreaterThan(0);
  }

  /**
   * Assert object has required properties
   *
   * @param obj - Object to check
   * @param properties - Array of required property names
   */
  static expectProperties(obj: any, properties: string[]) {
    properties.forEach((prop) => {
      expect(obj).toHaveProperty(prop);
    });
  }

  /**
   * Assert value matches expected type
   *
   * @param value - Value to check
   * @param expectedType - Expected type ('string', 'number', 'boolean', 'object', 'array')
   */
  static expectType(value: any, expectedType: string) {
    if (expectedType === 'array') {
      expect(Array.isArray(value)).toBe(true);
    } else {
      expect(typeof value).toBe(expectedType);
    }
  }
}
