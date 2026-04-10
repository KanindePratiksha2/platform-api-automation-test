/**
 * Example Test - Demonstrating Best Practices
 *
 * This test file demonstrates how to use the new features:
 * - Services layer
 * - Fixtures for test data
 * - Assertion helpers
 * - Response validators
 * - Pactum handlers
 * - Cleanup utilities
 *
 * Tags: @example @demo
 */

import { getAuthToken } from '@helpers/auth.helper';
import { GraphQLService, HealthService } from '@services';
import { GraphQLAssertions, CommonAssertions } from '@helpers/assertion.helper';
import { UserFixture, GraphQLFixture } from '@fixtures/test-data.fixture';
import { Schemas, Matchers } from '@validators/response.validator';
import { TEST_DATA } from '@config/test-data.config';
import { CleanupHelper } from '@helpers/cleanup.helper';

describe('Example Test - Best Practices', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Health Check Examples', () => {
    it('should check health using service layer', async () => {
      const response = await HealthService.check()
        .expectStatus(TEST_DATA.STATUS_CODES.OK)
        .expectJsonLike(Matchers.healthCheck)
        .toss();

      // Using JSON schema validation
      expect(response.body).toMatchObject({ status: expect.any(String) });
    });

    it('should verify fast response time', async () => {
      const response = await HealthService.check()
        .expectStatus(TEST_DATA.STATUS_CODES.OK)
        .expectResponseTime(1000) // Should respond within 1 second
        .toss();

      console.log(`Response time: ${response.responseTime}ms`);
    });
  });

  describe('GraphQL Examples', () => {
    it('should execute getMe query using service', async () => {
      const response = await GraphQLService.authenticatedQuery(
        GraphQLService.queries.GET_ME,
        authToken,
      )
        .expectStatus(TEST_DATA.STATUS_CODES.OK)
        .toss();

      // Using assertion helpers
      const data = GraphQLAssertions.expectSuccess(response);
      expect(data.getMe).toBeDefined();
    });

    it('should reject unauthenticated GraphQL request', async () => {
      const response = await GraphQLService.query(
        GraphQLService.queries.GET_ME,
      )
        .expectStatus(TEST_DATA.STATUS_CODES.OK)
        .toss();

      // Using assertion helpers for error validation
      GraphQLAssertions.expectUnauthenticated(response);
    });

    it('should use Pactum handler for authenticated query', async () => {
      // Using custom Pactum handler
      const response = await await (pactum as any).spec()
        .use('graphql.authenticated', {
          query: GraphQLService.queries.GET_ME,
          token: authToken,
        })
        .expectStatus(TEST_DATA.STATUS_CODES.OK)
        .toss();

      GraphQLAssertions.expectSuccess(response);
    });
  });

  describe('Fixtures and Test Data Examples', () => {
    it('should generate user test data with Faker', () => {
      // Generate a valid user
      const user = UserFixture.validUser();

      // Verify generated data
      CommonAssertions.expectEmail(user.email);
      expect(user.name).toBeTruthy();
      expect(user.phone).toBeTruthy();

      console.log('Generated user:', JSON.stringify(user, null, 2));
    });

    it('should generate custom user with overrides', () => {
      const customUser = UserFixture.customUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(customUser.email).toBe('test@example.com');
      expect(customUser.name).toBe('Test User');
      expect(customUser.phone).toBeTruthy(); // Other fields are auto-generated
    });

    it('should generate multiple users', () => {
      const users = UserFixture.multiple(3);

      expect(users).toHaveLength(3);
      users.forEach((user) => {
        CommonAssertions.expectEmail(user.email);
      });
    });

    it('should generate GraphQL query using fixtures', () => {
      const query = GraphQLFixture.query('users', ['id', 'name', 'email']);

      expect(query).toContain('query');
      expect(query).toContain('users');
      expect(query).toContain('id');
      expect(query).toContain('name');
      expect(query).toContain('email');
    });
  });

  describe('Cleanup Utilities Examples', () => {
    it('should track and cleanup test resources', async () => {
      // Track a resource for cleanup (example)
      CleanupHelper.trackResource('user', 'test-user-123', '/users/test-user-123', authToken);

      // Verify tracking
      expect(CleanupHelper.getCount()).toBeGreaterThan(0);
      expect(CleanupHelper.getCountByType('user')).toBe(1);

      // Resources will be cleaned up automatically in afterAll hook
    });

    it('should track multiple resources', () => {
      CleanupHelper.trackMultiple(
        [
          { type: 'post', id: 'post-1' },
          { type: 'post', id: 'post-2' },
          { type: 'comment', id: 'comment-1' },
        ],
        authToken,
      );

      expect(CleanupHelper.getCountByType('post')).toBe(2);
      expect(CleanupHelper.getCountByType('comment')).toBe(1);
    });
  });

  describe('Assertion Helpers Examples', () => {
    it('should validate common data types', () => {
      // UUID validation
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      CommonAssertions.expectUUID(uuid);

      // Email validation
      CommonAssertions.expectEmail('test@example.com');

      // ISO Date validation
      const isoDate = new Date().toISOString();
      CommonAssertions.expectISODate(isoDate);

      // Array validation
      const items = [1, 2, 3];
      CommonAssertions.expectNonEmptyArray(items);
    });

    it('should validate object properties', () => {
      const user = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      };

      CommonAssertions.expectProperties(user, ['id', 'name', 'email']);
    });

    it('should validate data types', () => {
      CommonAssertions.expectType('hello', 'string');
      CommonAssertions.expectType(123, 'number');
      CommonAssertions.expectType(true, 'boolean');
      CommonAssertions.expectType([1, 2, 3], 'array');
      CommonAssertions.expectType({ key: 'value' }, 'object');
    });
  });
});

// Note: Import pactum at the top if using handlers
import * as pactum from 'pactum';
