/**
 * Profile API Service
 *
 * This service provides methods for making Profile API requests.
 */

import { BaseAPIService } from './base.service';
import { API_ENDPOINTS } from '@config/endpoints.config';

export class ProfileService extends BaseAPIService {
  /**
   * Get current user profile (requires authentication)
   *
   * @param token - Authentication token
   * @returns Pactum spec instance
   */
  static getProfile(token: string) {
    const spec = this.createSpec().get(API_ENDPOINTS.PROFILE);
    this.withAuth(spec, token);
    return spec;
  }
}
