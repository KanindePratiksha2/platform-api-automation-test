# API Test Framework - Best Practices Guide

This guide explains how to use the enhanced features added to the Pactum.js API automation framework.

## 📁 New Structure

```
src/
├── config/          # Configuration files
├── fixtures/        # NEW: Test data generators using Faker
├── helpers/         # Helper functions (auth, cleanup, assertions, pactum handlers)
├── services/        # NEW: API service layer
├── validators/      # NEW: Response schemas and validators
├── setup/           # Jest setup
└── tests/
    ├── examples/    # NEW: Example tests demonstrating best practices
    ├── smoke/       # Smoke tests
    └── regression/  # Regression tests
```

## 🚀 Quick Start Examples

### 1. Using Services Layer

Instead of writing raw Pactum specs everywhere, use service classes:

```typescript
import { GraphQLService, HealthService } from '@services';
import { getAuthToken } from '@helpers/auth.helper';

// Health check
await HealthService.check().expectStatus(200).toss();

// GraphQL query
const token = await getAuthToken();
await GraphQLService.authenticatedQuery(
  GraphQLService.queries.GET_ME,
  token
).expectStatus(200).toss();
```

### 2. Using Fixtures for Test Data

Generate realistic test data with Faker:

```typescript
import { UserFixture, PaginationFixture } from '@fixtures/test-data.fixture';

// Generate a valid user
const user = UserFixture.validUser();

// Generate custom user with overrides
const customUser = UserFixture.customUser({
  email: 'specific@email.com'
});

// Generate multiple users
const users = UserFixture.multiple(10);

// Generate pagination params
const pagination = PaginationFixture.params(1, 20);
```

### 3. Using Assertion Helpers

Make tests more readable with assertion helpers:

```typescript
import { 
  GraphQLAssertions, 
  CommonAssertions,
  ValidationAssertions 
} from '@helpers/assertion.helper';

// GraphQL assertions
const data = GraphQLAssertions.expectSuccess(response);
GraphQLAssertions.expectField(data, 'user');
GraphQLAssertions.expectFields(data, ['id', 'name', 'email']);

// Error assertions
GraphQLAssertions.expectUnauthenticated(response);
GraphQLAssertions.expectForbidden(response);

// Common assertions
CommonAssertions.expectUUID(userId);
CommonAssertions.expectEmail(user.email);
CommonAssertions.expectISODate(createdAt);
```

### 4. Using Response Validators

Validate response structure with schemas:

```typescript
import { Schemas, Matchers } from '@validators/response.validator';

// Use with Pactum
await pactum.spec()
  .get('/health')
  .expectStatus(200)
  .expectJsonLike(Matchers.healthCheck)
  .toss();

// Validate GraphQL success
await pactum.spec()
  .post('/graphql')
  .withHeaders(authHeaders)
  .withJson({ query })
  .expectStatus(200)
  .expectJsonMatch(Matchers.graphqlSuccess)
  .toss();
```

### 5. Using Cleanup Utilities

Track and cleanup test data automatically:

```typescript
import { CleanupHelper } from '@helpers/cleanup.helper';

describe('My Test Suite', () => {
  it('should create and track resources', async () => {
    // Create a user via API
    const response = await createUser(userData);
    const userId = response.body.id;

    // Track for cleanup
    CleanupHelper.trackResource('user', userId, `/users/${userId}`, authToken);

    // ... perform tests ...

    // Resources automatically cleaned up in afterAll hook
  });
});
```

### 6. Using Pactum Handlers

Use predefined handlers for common patterns:

```typescript
import * as pactum from 'pactum';

// Authenticated GraphQL request
await pactum.spec()
  .use('graphql.authenticated', {
    query: '{ getMe }',
    token: authToken
  })
  .expectStatus(200);

// Paginated request
await pactum.spec()
  .use('rest.paginated', {
    endpoint: '/users',
    page: 1,
    pageSize: 10,
    token: authToken
  })
  .expectStatus(200);
```

## 📊 Enhanced Status Codes

All HTTP status codes are now available:

```typescript
import { TEST_DATA } from '@config/test-data.config';

// Success codes
TEST_DATA.STATUS_CODES.OK                    // 200
TEST_DATA.STATUS_CODES.CREATED               // 201
TEST_DATA.STATUS_CODES.NO_CONTENT            // 204

// Client error codes
TEST_DATA.STATUS_CODES.BAD_REQUEST           // 400
TEST_DATA.STATUS_CODES.UNAUTHORIZED          // 401
TEST_DATA.STATUS_CODES.FORBIDDEN             // 403
TEST_DATA.STATUS_CODES.NOT_FOUND             // 404
TEST_DATA.STATUS_CODES.UNPROCESSABLE_ENTITY  // 422

// Server error codes
TEST_DATA.STATUS_CODES.INTERNAL_SERVER_ERROR // 500
TEST_DATA.STATUS_CODES.SERVICE_UNAVAILABLE   // 503

// GraphQL error codes
TEST_DATA.GRAPHQL_ERROR_CODES.UNAUTHENTICATED
TEST_DATA.GRAPHQL_ERROR_CODES.FORBIDDEN
TEST_DATA.GRAPHQL_ERROR_CODES.BAD_USER_INPUT
```

## 🎯 Example Test

Here's a complete example using all best practices:

```typescript
import { GraphQLService } from '@services';
import { getAuthToken } from '@helpers/auth.helper';
import { GraphQLAssertions } from '@helpers/assertion.helper';
import { UserFixture } from '@fixtures/test-data.fixture';
import { CleanupHelper } from '@helpers/cleanup.helper';
import { TEST_DATA } from '@config/test-data.config';

describe('User API', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  it('should create a new user', async () => {
    // Generate test data
    const userData = UserFixture.validUser();

    // Make API call using service
    const response = await GraphQLService.mutation(
      GraphQLService.mutations.CREATE_USER,
      { input: userData },
      authToken
    )
      .expectStatus(TEST_DATA.STATUS_CODES.OK)
      .toss();

    // Assert response using helpers
    const data = GraphQLAssertions.expectSuccess(response);
    const user = data.createUser;

    // Validate response
    GraphQLAssertions.expectFields(user, ['id', 'name', 'email']);
    CommonAssertions.expectUUID(user.id);
    CommonAssertions.expectEmail(user.email);

    // Track for cleanup
    CleanupHelper.trackResource('user', user.id, `/users/${user.id}`, authToken);
  });
});
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
TEST_ENV=sand
SAND_BASE_URL=https://your-api.com
AUTH_TOKEN=your-jwt-token
LOG_LEVEL=info
DEBUG=false
```

### Jest Configuration

Jest config has been updated to:
- ✅ Remove deprecated `globals` config
- ✅ Move `isolatedModules` to transform config
- ✅ Add path mappings for new folders
- ✅ Enable coverage tracking

## 📝 Writing New Tests

Follow this pattern for new tests:

1. **Use services** instead of raw Pactum specs
2. **Generate test data** using fixtures
3. **Assert responses** using assertion helpers
4. **Validate schemas** using validators
5. **Track resources** for cleanup
6. **Use handlers** for common patterns

## 🎨 Code Organization

- `@services/*` - API requests and queries
- `@fixtures/*` - Test data generation
- `@helpers/*` - Utilities (auth, cleanup, assertions, handlers)
- `@validators/*` - Response schemas and validators
- `@config/*` - Configuration files

## 🚦 Running Tests

```bash
# All tests
npm test

# Smoke tests
npm run test:smoke

# Regression tests
npm run test:regression

# Example tests
npm test -- --testPathPattern=examples

# With coverage
npm test -- --coverage
```

## 📚 Further Reading

- See `src/tests/examples/best-practices.spec.ts` for complete examples
- Check individual service/helper files for detailed documentation
- Review validators for available schemas and matchers

## ✨ Benefits

- **Reusability**: Services and helpers reduce code duplication
- **Maintainability**: Centralized logic easier to update
- **Readability**: Assertion helpers make tests self-documenting
- **Reliability**: Automatic cleanup prevents test pollution
- **Flexibility**: Fixtures generate varied test data
- **Consistency**: Standardized patterns across tests
