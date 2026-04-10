/**
 * Data Cleanup Helper
 *
 * This helper manages cleanup of test data created during test execution.
 * Use this to track and cleanup resources to maintain test isolation.
 */

import * as pactum from 'pactum';
import { API_ENDPOINTS } from '@config/endpoints.config';

interface Resource {
  type: string;
  id: string;
  endpoint?: string;
  token?: string;
}

export class CleanupHelper {
  private static createdResources: Resource[] = [];

  /**
   * Track a resource for cleanup
   *
   * @param type - Type of resource (e.g., 'user', 'post', 'comment')
   * @param id - Resource identifier
   * @param endpoint - Optional deletion endpoint (defaults to REST convention)
   * @param token - Optional auth token for deletion
   */
  static trackResource(
    type: string,
    id: string,
    endpoint?: string,
    token?: string,
  ): void {
    this.createdResources.push({
      type,
      id,
      endpoint: endpoint || `/${type}s/${id}`,
      token,
    });

    console.log(`📝 Tracking ${type} for cleanup: ${id}`);
  }

  /**
   * Track multiple resources at once
   *
   * @param resources - Array of resources to track
   */
  static trackMultiple(resources: Omit<Resource, 'token'>[], token?: string): void {
    resources.forEach((resource) => {
      this.trackResource(
        resource.type,
        resource.id,
        resource.endpoint,
        token,
      );
    });
  }

  /**
   * Clean up a specific resource
   *
   * @param resource - Resource to clean up
   * @returns Cleanup result
   */
  private static async cleanupResource(resource: Resource): Promise<{
    success: boolean;
    error?: any;
  }> {
    try {
      console.log(`🧹 Cleaning up ${resource.type}: ${resource.id}`);

      const spec = pactum.spec().delete(resource.endpoint!);

      if (resource.token) {
        spec.withHeaders({ Authorization: `Bearer ${resource.token}` });
      }

      await spec.expectStatus((status) => {
        // Accept 200, 204 (success), or 404 (already deleted)
        return [200, 204, 404].includes(status);
      });

      console.log(`✅ Successfully cleaned up ${resource.type}: ${resource.id}`);
      return { success: true };
    } catch (error) {
      console.warn(
        `⚠️  Failed to cleanup ${resource.type}: ${resource.id}`,
        error,
      );
      return { success: false, error };
    }
  }

  /**
   * Clean up all tracked resources
   * Resources are cleaned in reverse order (LIFO)
   *
   * @param continueOnError - Continue cleanup even if one fails
   * @returns Cleanup summary
   */
  static async cleanupAll(continueOnError = true): Promise<{
    total: number;
    successful: number;
    failed: number;
  }> {
    const total = this.createdResources.length;
    let successful = 0;
    let failed = 0;

    if (total === 0) {
      console.log('✨ No resources to clean up');
      return { total: 0, successful: 0, failed: 0 };
    }

    console.log(`\n🧹 Starting cleanup of ${total} resource(s)...`);

    // Clean up in reverse order (LIFO - Last In First Out)
    const resources = [...this.createdResources].reverse();

    for (const resource of resources) {
      const result = await this.cleanupResource(resource);

      if (result.success) {
        successful++;
      } else {
        failed++;
        if (!continueOnError) {
          break;
        }
      }
    }

    // Clear the tracked resources
    this.createdResources = [];

    console.log(
      `\n✨ Cleanup complete: ${successful} successful, ${failed} failed\n`,
    );

    return { total, successful, failed };
  }

  /**
   * Clean up resources of a specific type
   *
   * @param type - Resource type to clean up
   */
  static async cleanupByType(type: string): Promise<void> {
    const resourcesOfType = this.createdResources.filter(
      (r) => r.type === type,
    );

    console.log(`🧹 Cleaning up ${resourcesOfType.length} ${type}(s)...`);

    for (const resource of resourcesOfType.reverse()) {
      await this.cleanupResource(resource);
    }

    // Remove cleaned resources from tracking
    this.createdResources = this.createdResources.filter(
      (r) => r.type !== type,
    );
  }

  /**
   * Remove a specific resource from tracking without cleanup
   *
   * @param type - Resource type
   * @param id - Resource ID
   */
  static untrack(type: string, id: string): void {
    const index = this.createdResources.findIndex(
      (r) => r.type === type && r.id === id,
    );

    if (index !== -1) {
      this.createdResources.splice(index, 1);
      console.log(`🔓 Untracked ${type}: ${id}`);
    }
  }

  /**
   * Clear all tracked resources without cleanup
   */
  static reset(): void {
    const count = this.createdResources.length;
    this.createdResources = [];
    console.log(`🔄 Reset cleanup tracker (${count} resources removed)`);
  }

  /**
   * Get all tracked resources
   */
  static getTrackedResources(): Resource[] {
    return [...this.createdResources];
  }

  /**
   * Get count of tracked resources
   */
  static getCount(): number {
    return this.createdResources.length;
  }

  /**
   * Get count of tracked resources by type
   */
  static getCountByType(type: string): number {
    return this.createdResources.filter((r) => r.type === type).length;
  }
}

export default CleanupHelper;
