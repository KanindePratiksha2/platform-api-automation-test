/**
 * Pactum Handlers
 *
 * Custom Pactum handlers for reusable request patterns and retry logic.
 * Register these handlers in pactum.config.ts initialization.
 */

import * as pactum from 'pactum';
import { API_ENDPOINTS } from '@config/endpoints.config';

/**
 * Register all Pactum spec handlers
 */
export function registerSpecHandlers(): void {
  /**
   * Handler for authenticated GraphQL requests
   * Usage: .use('graphql.authenticated', { query, variables, token })
   */
  pactum.handler.addSpecHandler('graphql.authenticated', (ctx) => {
    const { query, variables, token } = ctx.data;

    const spec = pactum
      .spec()
      .post(API_ENDPOINTS.GRAPHQL)
      .withHeaders({ Authorization: `Bearer ${token}` });

    const body: any = { query };
    if (variables) {
      body.variables = variables;
    }

    return spec.withJson(body);
  });

  /**
   * Handler for GraphQL requests without authentication
   * Usage: .use('graphql.public', { query, variables })
   */
  pactum.handler.addSpecHandler('graphql.public', (ctx) => {
    const { query, variables } = ctx.data;

    const spec = pactum.spec().post(API_ENDPOINTS.GRAPHQL);

    const body: any = { query };
    if (variables) {
      body.variables = variables;
    }

    return spec.withJson(body);
  });

  /**
   * Handler for authenticated REST API requests
   * Usage: .use('rest.authenticated', { method, endpoint, token, body, query })
   */
  pactum.handler.addSpecHandler('rest.authenticated', (ctx) => {
    const { method, endpoint, token, body, query } = ctx.data;

    let spec = pactum.spec();

    // Set HTTP method
    switch (method.toLowerCase()) {
      case 'get':
        spec = spec.get(endpoint);
        break;
      case 'post':
        spec = spec.post(endpoint);
        break;
      case 'put':
        spec = spec.put(endpoint);
        break;
      case 'patch':
        spec = spec.patch(endpoint);
        break;
      case 'delete':
        spec = spec.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // Add authorization
    spec.withHeaders({ Authorization: `Bearer ${token}` });

    // Add body if provided
    if (body) {
      spec.withJson(body);
    }

    // Add query params if provided
    if (query) {
      spec.withQueryParams(query);
    }

    return spec;
  });

  /**
   * Handler for paginated requests
   * Usage: .use('rest.paginated', { endpoint, page, pageSize, token })
   */
  pactum.handler.addSpecHandler('rest.paginated', (ctx) => {
    const { endpoint, page = 1, pageSize = 10, token } = ctx.data;

    const spec = pactum
      .spec()
      .get(endpoint)
      .withQueryParams({
        page,
        pageSize,
      });

    if (token) {
      spec.withHeaders({ Authorization: `Bearer ${token}` });
    }

    return spec;
  });

  /**
   * Handler for health check with retry
   * Usage: .use('health.check')
   */
  pactum.handler.addSpecHandler('health.check', () => {
    return pactum.spec().get(API_ENDPOINTS.HEALTH);
  });
}

/**
 * Register retry handlers
 */
export function registerRetryHandlers(): void {
  /**
   * Retry on timeout (503 Service Unavailable)
   */
  pactum.handler.addRetryHandler('onTimeout', async (ctx) => {
    const { res } = ctx;

    // Retry if service is unavailable
    if (res.statusCode === 503) {
      console.log(`⏳ Service unavailable, retrying in 1 second...`);
      return {
        fetch: true,
        delay: 1000,
      };
    }

    // Retry on 5xx errors (max 3 times)
    if (res.statusCode >= 500 && ctx.retryCount < 3) {
      console.log(
        `⏳ Server error (${res.statusCode}), retrying (attempt ${ctx.retryCount + 1}/3)...`,
      );
      return {
        fetch: true,
        delay: 1000 * (ctx.retryCount + 1), // Exponential backoff
      };
    }

    return { fetch: false };
  });

  /**
   * Retry on rate limit (429 Too Many Requests)
   */
  pactum.handler.addRetryHandler('onRateLimit', async (ctx) => {
    const { res } = ctx;

    if (res.statusCode === 429) {
      const retryAfter = res.headers['retry-after']
        ? parseInt(res.headers['retry-after']) * 1000
        : 5000;

      console.log(`⏳ Rate limited, retrying after ${retryAfter}ms...`);
      return {
        fetch: true,
        delay: retryAfter,
      };
    }

    return { fetch: false };
  });
}

/**
 * Register custom assert handlers
 * These handlers can be used with .expect() for custom validations
 */
export function registerAssertHandlers(): void {
  /**
   * Custom assertion: Validate JWT token in Authorization header
   * Usage: .expect('validToken')
   */
  pactum.handler.addAssertHandler('validToken', (ctx) => {
    const auth = ctx.res.headers['authorization'];

    if (!auth) {
      return { success: false, message: 'Authorization header is missing' };
    }

    if (!auth.startsWith('Bearer ')) {
      return { success: false, message: 'Authorization header should start with "Bearer "' };
    }

    const token = auth.substring(7);
    const parts = token.split('.');

    if (parts.length !== 3) {
      return { success: false, message: 'Invalid JWT token format' };
    }

    return { success: true };
  });

  /**
   * Custom assertion: Response time within limit
   * Usage: .expect('fastResponse', 2000) - where 2000 is max time in ms
   */
  pactum.handler.addAssertHandler('fastResponse', (ctx) => {
    const maxTime = ctx.data || 2000; // Default 2 seconds

    if (ctx.res.responseTime > maxTime) {
      return {
        success: false,
        message: `Response time ${ctx.res.responseTime}ms exceeds limit ${maxTime}ms`,
      };
    }

    return { success: true };
  });

  /**
   * Custom assertion: No GraphQL errors in response
   * Usage: .expect('noGraphQLErrors')
   */
  pactum.handler.addAssertHandler('noGraphQLErrors', (ctx) => {
    if (ctx.res.body.errors && ctx.res.body.errors.length > 0) {
      return {
        success: false,
        message: `GraphQL errors found: ${JSON.stringify(ctx.res.body.errors)}`,
      };
    }

    return { success: true };
  });

  /**
   * Custom assertion: Valid pagination structure
   * Usage: .expect('validPagination')
   */
  pactum.handler.addAssertHandler('validPagination', (ctx) => {
    const { pagination } = ctx.res.body;

    if (!pagination) {
      return { success: false, message: 'Pagination object is missing' };
    }

    const requiredFields = ['page', 'pageSize', 'total', 'totalPages'];
    const missingFields = requiredFields.filter(
      (field) => !(field in pagination),
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing pagination fields: ${missingFields.join(', ')}`,
      };
    }

    if (pagination.page < 1) {
      return { success: false, message: 'Page number must be >= 1' };
    }

    if (pagination.pageSize < 1) {
      return { success: false, message: 'Page size must be >= 1' };
    }

    if (pagination.total < 0) {
      return { success: false, message: 'Total must be >= 0' };
    }

    return { success: true };
  });
}

/**
 * Register all handlers
 */
export function registerAllHandlers(): void {
  registerSpecHandlers();
  registerRetryHandlers();
  registerAssertHandlers();
  console.log('📦 Pactum handlers registered');
}
