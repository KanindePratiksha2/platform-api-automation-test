/**
 * Generate Fresh Authentication Token
 * 
 * This script logs in to Trek and generates a fresh JWT token.
 * The token is then displayed so you can update your .env file.
 */

require('dotenv').config();
const pactum = require('pactum');

async function generateToken() {
  const trekBaseUrl = process.env.TREK_BASE_URL || 'https://vljvftar07.execute-api.us-west-2.amazonaws.com';
  const username = process.env.TREK_USERNAME || 'platdev1@theprovenancechain.com';
  const password = process.env.TREK_PASSWORD || 'platDev@123';
  const clientId = process.env.TREK_CLIENT_ID || '1000001';
  const roleId = process.env.TREK_ROLE_ID || '1000059';
  const organizationId = process.env.TREK_ORGANIZATION_ID || '1000001';
  const warehouseId = process.env.TREK_WAREHOUSE_ID || '1000001';
  const language = process.env.TREK_LANGUAGE || 'en_US';

  console.log('🔐 Generating fresh authentication token from Trek...\n');
  console.log('📍 Trek URL:', trekBaseUrl);
  console.log('👤 Username:', username);
  console.log('');

  try {
    const response = await pactum
      .spec()
      .post(`${trekBaseUrl}/auth/tokens`)
      .withJson({
        userName: username,
        password: password,
        parameters: {
          clientId: clientId,
          roleId: roleId,
          organizationId: organizationId,
          warehouseId: warehouseId,
          language: language,
        },
      })
      .expectStatus(200);

    const token = response.body.token;

    if (!token) {
      throw new Error('Token not found in response');
    }

    console.log('✅ Successfully generated token!\n');
    console.log('═'.repeat(80));
    console.log('🎫 NEW TOKEN:');
    console.log('═'.repeat(80));
    console.log(token);
    console.log('═'.repeat(80));
    console.log('\n📝 Copy the token above and update AUTH_TOKEN in your .env file\n');

    // Decode the token to show expiry
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          console.log('⏰ Token expires:', expiryDate.toLocaleString());
          console.log('⏳ Valid for:', Math.floor((payload.exp * 1000 - Date.now()) / 1000 / 60 / 60), 'hours\n');
        }
      } catch (e) {
        // Ignore decode errors
      }
    }

    return token;
  } catch (error) {
    console.error('❌ Failed to generate token:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.statusCode);
      console.error('Response body:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  }
}

generateToken();
