# API Automation Tests

API automation tests for CTP Platform Services using PactumJS.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   Copy `.env.example` to `.env` and update with your settings:

   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `TEST_ENV` - Environment to test against (local, dev, sand, prod)
   - `LOCAL_BASE_URL` / `DEV_BASE_URL` / etc. - API base URLs
   - `API_KEY` - API key for authenticated platform endpoints (REQUIRED)
   - `AUTH_TOKEN` - Static JWT token (optional if using Trek login)
   
   **Trek Authentication (all required if not using AUTH_TOKEN):**
   - `TREK_BASE_URL` - Trek authentication API URL
   - `TREK_USERNAME` - Trek username
   - `TREK_PASSWORD` - Trek password
   - `TREK_CLIENT_ID` - Trek client ID
   - `TREK_ROLE_ID` - Trek role ID
   - `TREK_ORGANIZATION_ID` - Trek organization ID
   - `TREK_WAREHOUSE_ID` - Trek warehouse ID
   - `TREK_LANGUAGE` - Trek language (optional, defaults to en_US)

## Running Tests

### Using npm scripts:

```bash
# Run all tests
npm test

# Run smoke tests only
npm run test:smoke

# Run regression tests only
npm run test:regression

# Run specific test file
npm run test:health
npm run test:auth
```

### Using Nx:

```bash
# From repository root
nx e2e api-automation-tests --configuration=smoke
nx e2e api-automation-tests --configuration=regression
```

## Test Structure

```
src/
├── config/          # Environment and endpoint configuration
├── helpers/         # Authentication and utility functions
├── setup/           # Jest setup and configuration
└── tests/
    ├── smoke/       # Quick health checks
    └── regression/  # Full API tests
```

### Current Test Coverage

- **Health Check** (`GET /health`) - Smoke test
- **GraphQL** (`POST /graphql`) - Authenticated query tests

## Authentication

Tests use Trek (external authentication system) to obtain tokens:

1. Token is fetched once before tests run
2. Token is cached and reused across all tests
3. Token is included in Authorization header for authenticated requests

## Reports

Test reports are generated in the `reports/` directory after each test run.

4. **Edit `.env` file with your credentials:**
   ```env
   TEST_ENV=local
   LOCAL_BASE_URL=http://localhost:3000
   
   # API Key (required for authenticated endpoints)
   API_KEY=your-api-key-here
   
   # Option 1: Use static JWT token
   AUTH_TOKEN=your-jwt-token-here
   
   # Option 2: Use Trek login (all fields required if AUTH_TOKEN not provided)
   TREK_BASE_URL=https://your-trek-host.com/api/v1
   TREK_USERNAME=your-email@theprovenancechain.com
   TREK_PASSWORD=your-password
   TREK_CLIENT_ID=1000001
   TREK_ROLE_ID=PCN-Test User
   TREK_ORGANIZATION_ID=1000001
   TREK_WAREHOUSE_ID=1000001
   TREK_LANGUAGE=en_US
   ```

### First Test Run

Run a simple smoke test to verify setup:

```bash
# Using NX (recommended in monorepo)
nx test api-automation-tests --testPathPattern=health

# Or using npm
npm run test:health
```

## 🧪 Running Tests

### Using NX (Recommended)

```bash
# Run all tests
nx test api-automation-tests

# Run smoke tests only
nx test api-automation-tests --configuration=smoke

# Run specific test file
nx test api-automation-tests --testPathPattern=health

# Run tests in watch mode
nx test:watch api-automation-tests

# Run with coverage
nx test api-automation-tests --coverage
```

### Using NPM Scripts

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:smoke         # Quick smoke tests
npm run test:regression    # Full regression suite
npm run test:health        # Health check tests only
npm run test:auth          # Authentication tests
npm run test:evidence      # Evidence API tests
npm run test:dpp           # DPP API tests

# Watch mode
npm run test:watch

# Debug mode
npm run test:debug
```

### Environment-Specific Testing

```bash
# Test against local environment
TEST_ENV=local nx test api-automation-tests

# Test against dev environment
TEST_ENV=dev nx test api-automation-tests

# Test against sandbox environment
TEST_ENV=sand nx test api-automation-tests
```

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import * as pactum from 'pactum';
import { API_ENDPOINTS } from '@config/endpoints.config';
import { TEST_DATA } from '@config/test-data.config';

describe('My API Tests', () => {
  it('should return 200 OK', async () => {
    await pactum
      .spec()
      .get(API_ENDPOINTS.HEALTH)
      .expectStatus(200)
      .expectJsonLike({
        status: 'ok',
      });
  });
});
```

### Test with Authentication

```typescript
import { login, getAuthenticatedHeaders } from '@helpers/auth.helper';

describe('Authenticated API Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    const tokens = await login();
    authToken = tokens.accessToken;
  });

  it('should access protected endpoint', async () => {
    await pactum
      .spec()
      .get(API_ENDPOINTS.EVIDENCE.BASE)
      .withHeaders(getAuthenticatedHeaders(authToken))
      .expectStatus(200);
  });
});
```

### POST Request with Body

```typescript
it('should create a new resource', async () => {
  const response = await pactum
    .spec()
    .post(API_ENDPOINTS.EVIDENCE.BASE)
    .withHeaders(getAuthenticatedHeaders(authToken))
    .withJson({
      name: 'Test Evidence',
      type: 'CERTIFICATE',
      description: 'Test description',
    })
    .expectStatus(201);

  // Store ID for later use
  const createdId = response.json.data.id;
});
```

### Response Validation

```typescript
import {
  expectCorrelationId,
  expectUUID,
  expectISODate,
} from '@helpers/validation.helper';

it('should validate response structure', async () => {
  const response = await pactum
    .spec()
    .get(API_ENDPOINTS.EVIDENCE.BY_ID('some-id'))
    .withHeaders(getAuthenticatedHeaders(authToken))
    .expectStatus(200);

  // Validate UUID
  expectUUID(response.json.data.id);

  // Validate ISO date
  expectISODate(response.json.data.createdAt);

  // Validate correlation ID in metadata
  expectCorrelationId(response);
});
```

### Using Test Fixtures

```typescript
import { validEvidence } from '@fixtures/evidence.fixture';

it('should use fixture data', async () => {
  await pactum
    .spec()
    .post(API_ENDPOINTS.EVIDENCE.BASE)
    .withHeaders(getAuthenticatedHeaders(authToken))
    .withJson(validEvidence.basic)
    .expectStatus(201);
});
```

### Using Data Generators

```typescript
import {
  randomString,
  randomEmail,
  randomUUID,
} from '@helpers/data-generator.helper';

it('should create unique test data', async () => {
  const uniqueName = `Evidence-${randomString(8)}`;

  await pactum
    .spec()
    .post(API_ENDPOINTS.EVIDENCE.BASE)
    .withHeaders(getAuthenticatedHeaders(authToken))
    .withJson({
      name: uniqueName,
      type: 'CERTIFICATE',
    })
    .expectStatus(201);
});
```

### Testing Error Scenarios

```typescript
import { expectErrorResponse } from '@helpers/validation.helper';

it('should return 404 for non-existent resource', async () => {
  const response = await pactum
    .spec()
    .get(API_ENDPOINTS.EVIDENCE.BY_ID('non-existent-id'))
    .withHeaders(getAuthenticatedHeaders(authToken))
    .expectStatus(404);

  expectErrorResponse(response, 404, 'Not Found');
});
```

### Advanced: Request Chaining

```typescript
it('should chain requests using data from previous response', async () => {
  // Create evidence
  const createResponse = await pactum
    .spec()
    .post(API_ENDPOINTS.EVIDENCE.BASE)
    .withHeaders(getAuthenticatedHeaders(authToken))
    .withJson(validEvidence.basic)
    .expectStatus(201)
    .stores('evidenceId', 'data.id'); // Store ID

  // Use stored ID in next request
  await pactum
    .spec()
    .get(API_ENDPOINTS.EVIDENCE.BY_ID('$S{evidenceId}'))
    .withHeaders(getAuthenticatedHeaders(authToken))
    .expectStatus(200);
});
```

## ⚙️ Configuration

### Environment Configuration

Edit `src/config/environment.config.ts` to add or modify environments:

```typescript
const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: 'local',
    baseUrl: 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 0,
    logLevel: 'debug',
  },
  // Add more environments...
};
```

### API Endpoints

Update `src/config/endpoints.config.ts` when new endpoints are added:

```typescript
export const API_ENDPOINTS = {
  // Add new endpoints
  MY_NEW_API: {
    BASE: '/api/my-new-api',
    BY_ID: (id: string) => `/api/my-new-api/${id}`,
  },
};
```

### Pactum Settings

Modify global Pactum settings in `src/config/pactum.config.ts`:

```typescript
export function initializePactum(): void {
  pactum.request.setBaseUrl(config.baseUrl);
  pactum.request.setDefaultTimeout(config.timeout);

  // Add custom settings
  pactum.request.setDefaultHeaders({
    'Custom-Header': 'value',
  });
}
```

## 📋 Best Practices

### 1. **Use Descriptive Test Names**

```typescript
// ✅ Good
it('should return 404 when evidence ID does not exist', async () => {});

// ❌ Bad
it('test 1', async () => {});
```

### 2. **Organize Tests by Feature**

Group related tests using `describe` blocks:

```typescript
describe('Evidence API', () => {
  describe('Create Evidence', () => {
    it('should create with valid data', async () => {});
    it('should reject invalid data', async () => {});
  });

  describe('Get Evidence', () => {
    it('should retrieve by ID', async () => {});
    it('should return 404 for non-existent ID', async () => {});
  });
});
```

### 3. **Clean Up Test Data**

```typescript
describe('CRUD Operations', () => {
  let createdId: string;

  afterEach(async () => {
    // Clean up created resources
    if (createdId) {
      await pactum
        .spec()
        .delete(API_ENDPOINTS.EVIDENCE.BY_ID(createdId))
        .withHeaders(getAuthenticatedHeaders(authToken));
    }
  });
});
```

### 4. **Use Fixtures for Reusable Data**

Create fixtures in `src/fixtures/` for commonly used test data instead of hardcoding.

### 5. **Test Both Happy and Unhappy Paths**

```typescript
describe('Login', () => {
  it('should login successfully with valid credentials', async () => {});
  it('should reject invalid password', async () => {});
  it('should reject non-existent user', async () => {});
  it('should reject malformed credentials', async () => {});
});
```

### 6. **Use Helper Functions**

Leverage helper functions to keep tests clean and maintainable:

```typescript
// Instead of repeating authentication logic
const response = await login();
const headers = getAuthenticatedHeaders(response.accessToken);
```

### 7. **Validate Response Structure**

Always validate important fields in responses:

```typescript
expect(response.json.data).toHaveProperty('id');
expectUUID(response.json.data.id);
expectISODate(response.json.data.createdAt);
```

### 8. **Tag Tests Appropriately**

Use descriptive test file names and organize by test type:

- `smoke/` - Quick tests for basic functionality
- `regression/` - Comprehensive test coverage

## 🐛 Troubleshooting

### Common Issues

#### 1. **Tests fail with "Connection Refused"**

**Problem:** API server is not running or wrong base URL.

**Solution:**

- Check that API server is running
- Verify `TEST_ENV` and base URL in `.env`
- Test manually: `curl http://localhost:3000/api/health`

#### 2. **Authentication Errors**

**Problem:** Invalid credentials or expired tokens.

**Solution:**

- Verify `TEST_USERNAME` and `TEST_PASSWORD` in `.env`
- Check if test user exists in the environment
- Ensure API key is valid if using API key auth

#### 3. **TypeScript Errors**

**Problem:** Import errors or type mismatches.

**Solution:**

```bash
# Clear NX cache
nx reset

# Reinstall dependencies
npm install

# Check TypeScript config
cat tsconfig.json
```

#### 4. **Tests Timing Out**

**Problem:** Tests exceed timeout limit.

**Solution:**

- Increase timeout in `jest.config.ts`:
  ```typescript
  testTimeout: 60000; // 60 seconds
  ```
- Or in individual test:
  ```typescript
  it('slow test', async () => {}, 60000);
  ```

#### 5. **Cannot Find Module Errors**

**Problem:** Path aliases not resolved.

**Solution:**

- Check `tsconfig.json` has correct paths
- Verify `moduleNameMapper` in `jest.config.ts`
- Use absolute imports from `src/`

### Getting Help

- **Pactum Documentation:** https://pactumjs.github.io/
- **Jest Documentation:** https://jestjs.io/
- **Team Support:** Contact QA team or check internal docs

## 📊 Test Reports

Test reports are automatically generated after each test run:

- **Location:** `./reports/test-report.html`
- **Format:** HTML with detailed results, console logs, and failure messages

Open the report:

```bash
open reports/test-report.html
```

## 🎓 Learning Resources

### Pactum.js Guides

- [Official Documentation](https://pactumjs.github.io/)
- [API Testing](https://pactumjs.github.io/guides/api-testing)
- [Integration Testing](https://pactumjs.github.io/guides/integration-testing)
- [Data Management](https://pactumjs.github.io/guides/data-management)

### Example Patterns

Check the existing test files in `src/tests/` for examples:

- `smoke/health.spec.ts` - Simple smoke test
- `regression/auth.spec.ts` - Authentication flows
- `regression/evidence.spec.ts` - CRUD operations
- `regression/dpp.spec.ts` - Complex object testing

## 🤝 Contributing

When adding new tests:

1. Follow the established project structure
2. Use existing helpers and fixtures when possible
3. Add new helpers/fixtures if needed
4. Write clear, descriptive test names
5. Test both success and failure scenarios
6. Update this README if adding new patterns

## 📝 License

Internal use only - CTP Platform Services

---

**Happy Testing! 🎉**

For questions or support, reach out to the QA team.
