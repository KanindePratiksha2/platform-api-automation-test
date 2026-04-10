/**
 * Cleanup Script - Delete All DPP Keys
 * 
 * This script deletes all DPP keys from the API.
 * Run with: npx ts-node cleanup-dpp-keys.ts
 */

import { config } from './src/config/environment.config';
import { initializePactum } from './src/config/pactum.config';
import { DPPKeysService } from './src/services/dpp-keys.service';
import { getAuthToken } from './src/helpers/auth.helper';

async function main() {
  try {
    // Initialize Pactum
    initializePactum();
    
    console.log('🔑 Getting authentication token...');
    const token = await getAuthToken();
    
    console.log('🧹 Starting DPP Keys cleanup...');
    console.log(`📍 Environment: ${config.name}`);
    console.log(`🌐 Base URL: ${config.baseUrl}\n`);
    
    // Delete all DPP keys
    const results = await DPPKeysService.deleteAll(token);
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`   Total keys found: ${results.total}`);
    console.log(`   ✅ Successfully deleted: ${results.deleted}`);
    console.log(`   ❌ Failed to delete: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      results.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${JSON.stringify(err, null, 2)}`);
      });
    }
    
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
