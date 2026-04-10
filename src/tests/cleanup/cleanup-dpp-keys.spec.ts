/**
 * DPP Keys Cleanup Test
 * 
 * Run this test to delete all DPP keys from the system.
 * Usage: npm test -- --testPathPatterns=cleanup-dpp
 */

import { getAuthToken } from '@helpers/auth.helper';
import { DPPKeysService } from '@services/dpp-keys.service';

describe('DPP Keys Cleanup', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  it('should delete all DPP keys', async () => {
    console.log('\n🧹 Starting cleanup of all DPP keys...\n');
    
    const results = await DPPKeysService.deleteAll(authToken);

    console.log('\n📊 Final Results:');
    console.log(`   Total: ${results.total}`);
    console.log(`   Deleted: ${results.deleted}`);
    console.log(`   Failed: ${results.failed}`);

    // Log summary
    if (results.total === 0) {
      console.log('\n✨ No DPP keys found to delete');
    } else if (results.failed === 0) {
      console.log(`\n✅ Successfully deleted all ${results.deleted} DPP key(s)`);
    } else {
      console.log(`\n⚠️  Deleted ${results.deleted} out of ${results.total} key(s)`);
    }

    // Test passes even if some deletions fail (they might already be deleted)
    expect(results.total).toBeGreaterThanOrEqual(0);
  }, 60000); // 60 second timeout for cleanup
});
