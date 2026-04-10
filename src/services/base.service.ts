/**
 * Base API Service
 *
 * This base class provides common functionality for all API services.
 * Extend this class to create specific service implementations.
 */

import * as pactum from 'pactum';
import { API_ENDPOINTS } from '@config/endpoints.config';

export class BaseAPIService {
  /**
   * Create a new Pactum spec with common configuration
   */
  protected static createSpec() {
    return pactum.spec();
  }

  /**
   * Add authorization header to request
   */
  protected static withAuth(spec: any, token: string) {
    return spec.withHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Add custom headers to request
   */
  protected static withHeaders(spec: any, headers: Record<string, string>) {
    return spec.withHeaders(headers);
  }

  /**
   * Add query parameters to request
   */
  protected static withQuery(spec: any, params: Record<string, any>) {
    return spec.withQueryParams(params);
  }

  /**
   * Add JSON body to request
   */
  protected static withBody(spec: any, body: any) {
    return spec.withJson(body);
  }

  /**
   * Store response data for later use
   */
  protected static store(spec: any, key: string, path: string) {
    return spec.stores(key, path);
  }
}

export default BaseAPIService;
