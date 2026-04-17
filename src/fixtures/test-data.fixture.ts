/**
 * Test Data Fixtures
 *
 * This file provides factory functions to generate test data using Faker.js
 * Use these to create consistent, realistic test data for your API tests.
 */

import { faker } from '@faker-js/faker';

/**
 * User Fixtures
 */
export class UserFixture {
  /**
   * Generate a valid user object
   */
  static validUser() {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      dateOfBirth: faker.date
        .birthdate({ min: 18, max: 65, mode: 'age' })
        .toISOString()
        .split('T')[0],
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
    };
  }

  /**
   * Generate a user with specific fields
   */
  static customUser(overrides: any = {}) {
    return {
      ...this.validUser(),
      ...overrides,
    };
  }

  /**
   * Generate invalid email formats
   */
  static invalidEmail() {
    const invalidEmails = [
      'invalid-email',
      'missing@domain',
      '@nodomain.com',
      'no-at-sign.com',
      'spaces in@email.com',
      '',
    ];
    return invalidEmails[Math.floor(Math.random() * invalidEmails.length)];
  }

  /**
   * Generate a user with invalid data
   */
  static invalidUser() {
    return {
      name: '', // Empty name
      email: this.invalidEmail(),
      phone: '123', // Invalid phone
    };
  }

  /**
   * Generate multiple users
   */
  static multiple(count: number = 5) {
    return Array.from({ length: count }, () => this.validUser());
  }
}

/**
 * GraphQL Query Fixtures
 */
export class GraphQLFixture {
  /**
   * Generate a valid GraphQL query
   */
  static query(queryName: string, fields: string[] = ['id', 'name']) {
    return `
      query {
        ${queryName} {
          ${fields.join('\n          ')}
        }
      }
    `;
  }

  /**
   * Generate a GraphQL mutation
   */
  static mutation(
    mutationName: string,
    input: Record<string, any>,
    returnFields: string[] = ['id', 'name'],
  ) {
    const inputString = JSON.stringify(input).replace(/"([^"]+)":/g, '$1:');

    return `
      mutation {
        ${mutationName}(input: ${inputString}) {
          ${returnFields.join('\n          ')}
        }
      }
    `;
  }

  /**
   * Generate GraphQL variables
   */
  static variables(data: Record<string, any>) {
    return { ...data };
  }
}

/**
 * Pagination Fixtures
 */
export class PaginationFixture {
  /**
   * Generate pagination parameters
   */
  static params(page: number = 1, pageSize: number = 10) {
    return {
      page,
      pageSize,
    };
  }

  /**
   * Generate random pagination
   */
  static random() {
    return {
      page: faker.number.int({ min: 1, max: 10 }),
      pageSize: faker.number.int({ min: 5, max: 50 }),
    };
  }
}

/**
 * Common Test Data Fixtures
 */
export class CommonFixture {
  /**
   * Generate a random UUID
   */
  static uuid() {
    return faker.string.uuid();
  }

  /**
   * Generate a random date
   */
  static date(past: boolean = true) {
    return past ? faker.date.past() : faker.date.future();
  }

  /**
   * Generate an ISO date string
   */
  static isoDate(past: boolean = true) {
    return this.date(past).toISOString();
  }

  /**
   * Generate a random number
   */
  static number(min: number = 1, max: number = 100) {
    return faker.number.int({ min, max });
  }

  /**
   * Generate random text
   */
  static text(sentences: number = 3) {
    return faker.lorem.sentences(sentences);
  }

  /**
   * Generate random paragraph
   */
  static paragraph() {
    return faker.lorem.paragraph();
  }

  /**
   * Generate random title
   */
  static title() {
    return faker.lorem.sentence({ min: 3, max: 6 });
  }

  /**
   * Generate random URL
   */
  static url() {
    return faker.internet.url();
  }

  /**
   * Generate random image URL
   */
  static imageUrl() {
    return faker.image.url();
  }

  /**
   * Generate random boolean
   */
  static boolean() {
    return faker.datatype.boolean();
  }

  /**
   * Generate random enum value
   */
  static enum<T>(values: T[]): T {
    return values[Math.floor(Math.random() * values.length)];
  }

  /**
   * Generate random array of items
   */
  static array<T>(generator: () => T, count: number = 5): T[] {
    return Array.from({ length: count }, generator);
  }
}

/**
 * Error Fixtures
 */
export class ErrorFixture {
  /**
   * Generate validation error
   */
  static validationError(field: string, message: string) {
    return {
      field,
      message,
      code: 'VALIDATION_ERROR',
    };
  }

  /**
   * Generate multiple validation errors
   */
  static multipleValidationErrors(
    errors: Array<{ field: string; message: string }>,
  ) {
    return errors.map((err) => this.validationError(err.field, err.message));
  }

  /**
   * Generate GraphQL error
   */
  static graphqlError(message: string, code: string = 'BAD_REQUEST') {
    return {
      message,
      extensions: {
        code,
        statusCode: 400,
      },
    };
  }
}
