/**
 * Health Check API Service
 *
 * This service provides methods for health check endpoints.
 */

import { BaseAPIService } from './base.service';
import { API_ENDPOINTS } from '@config/endpoints.config';

export class HealthService extends BaseAPIService {
  /**
   * Perform a health check
   *
   * @returns Pactum spec instance
   */
  static check() {
    return this.createSpec().get(API_ENDPOINTS.HEALTH);
  }

  /**
   * Perform a health check with custom headers
   *
   * @param headers - Custom headers to include
   * @returns Pactum spec instance
   */
  static checkWithHeaders(headers: Record<string, string>) {
    return this.withHeaders(this.createSpec().get(API_ENDPOINTS.HEALTH), headers);
  }

  /**
   * Perform multiple health checks (for load testing)
   *
   * @param count - Number of concurrent requests
   * @returns Array of Pactum spec promises
   */
  static async checkMultiple(count: number) {
    const requests = Array(count)
      .fill(null)
      .map(() => this.check().toss());

    return Promise.all(requests);
  }
}

export default HealthService;
