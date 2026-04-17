/**
 * Token Validation Helper
 * 
 * Validates JWT tokens before running tests
 */

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired, false if valid
 */
export function isTokenExpired(token: string): boolean {
  if (!token || token === '' || token === 'your-jwt-token-here') {
    return true;
  }

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️  Invalid JWT format');
      return true;
    }

    // Decode payload (base64url to base64)
    let payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    while (payload.length % 4 !== 0) {
      payload += '=';
    }
    
    // Decode using Node Buffer
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );

    // Check expiration
    if (decodedPayload.exp) {
      const expirationTime = decodedPayload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (now >= expirationTime) {
        const expDate = new Date(expirationTime);
        const hoursAgo = Math.floor((now - expirationTime) / 1000 / 60 / 60);
        console.error('═'.repeat(80));
        console.error('❌ TOKEN EXPIRED');
        console.error('═'.repeat(80));
        console.error(`Token expired: ${expDate.toLocaleString()} (${hoursAgo} hours ago)`);
        console.error(`Current time:  ${new Date().toLocaleString()}`);
        console.error('\n💡 To fix this:');
        console.error('   1. Get a fresh JWT token from your API/Postman');
        console.error('   2. Update AUTH_TOKEN in .env file');
        console.error('   OR configure Trek credentials for auto-refresh');
        console.error('═'.repeat(80));
        return true;
      }

      // Token is valid
      const expiresIn = Math.floor((expirationTime - now) / 1000 / 60); // minutes
      if (expiresIn < 60) {
        console.log(`⏰ Token expires in ${expiresIn} minutes`);
      } else {
        const hours = Math.floor(expiresIn / 60);
        console.log(`✅ Token is valid (expires in ${hours} hours)`);
      }
      return false;
    }

    // No expiration claim
    console.warn('⚠️  Token has no expiration claim');
    return false;
  } catch (error) {
    console.error('⚠️  Could not validate token:', error);
    return true;
  }
}

/**
 * Get token info for debugging
 */
export function getTokenInfo(token: string): any {
  try {
    const parts = token.split('.');
    let payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    while (payload.length % 4 !== 0) {
      payload += '=';
    }
    
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}
