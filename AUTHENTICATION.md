# Authentication Setup Guide

## Overview

This test suite requires authentication to test protected endpoints. The authentication system supports two methods:

1. **Static JWT Token** - Manually provide a valid JWT token
2. **Trek Login** - Automatically fetch tokens from Trek authentication service

## Current Status

### ✅ Working Tests (No Auth Required)
- **Health Check** (`/health`) - Public endpoint, no authentication needed

### ⚠️ Tests Requiring Authentication
- **Profile API** (`/api/auth/profile`) - Requires valid JWT token
- **GraphQL API** (`/graphql`) - Requires valid JWT token for `getMe` query

## Authentication Errors

If you see an error like:

```
⚠️  AUTHENTICATION ERROR
═══════════════════════════════════════════════════════════════
The GraphQL API rejected the authentication token.
```

This means the AUTH_TOKEN in your `.env` file is either:
- Not configured (still set to placeholder)
- Expired
- Invalid for the current environment

## Setup Instructions

### Option 1: Use Static JWT Token

1. Obtain a valid JWT token for your test environment
   - Get this from Postman, API documentation, or your development team
   - The token should be valid for the environment specified in `TEST_ENV`

2. Update your `.env` file:
   ```bash
   # Set the environment
   TEST_ENV=sand

   # Add your API key (required for authenticated endpoints)
   API_KEY=your-api-key-here

   # Add your JWT token
   AUTH_TOKEN=eyJ...your-actual-jwt-token...
   ```

3. Run tests:
   ```bash
   npm test
   ```

### Option 2: Use Trek Login (Recommended)

This method automatically fetches fresh tokens from the Trek authentication service.

1. Add Trek credentials to `.env` (all fields are REQUIRED):
   ```bash
   # API Key (required for authenticated endpoints)
   API_KEY=your-api-key-here
   
   # Trek Authentication Settings (all required)
   TREK_BASE_URL=https://your-trek-host.com/api/v1
   TREK_USERNAME=your-email@theprovenancechain.com
   TREK_PASSWORD=your-password
   TREK_CLIENT_ID=1000001
   TREK_ROLE_ID=PCN-Test User
   TREK_ORGANIZATION_ID=1000001
   TREK_WAREHOUSE_ID=1000001
   TREK_LANGUAGE=en_US
   ```

2. Remove or clear the `AUTH_TOKEN` line (or set it to empty):
   ```bash
   AUTH_TOKEN=
   ```

3. Run tests - tokens will be fetched automatically:
   ```bash
   npm test
   ```

### Finding Trek Credentials

Check your Postman collections for Trek login requests:
1. Look for `/auth/tokens` endpoint
2. Check the request body for required parameters
3. Copy the values to your `.env` file

## Token Caching

- Tokens are cached for 1 hour to avoid repeated login calls
- To clear the cache and fetch a new token, restart your test run
- Cache is automatically cleared when tests complete

## Environment Configuration

Different environments may require different tokens:

```bash
# For sandbox environment
TEST_ENV=sand
SAND_BASE_URL=https://vljvftar07.execute-api.us-west-2.amazonaws.com/sand

# For development environment
TEST_ENV=dev  
DEV_BASE_URL=https://api-dev.theprovenancechain.com
```

Ensure your `AUTH_TOKEN` or Trek credentials match the selected environment.

## Troubleshooting

### Tests Still Failing After Adding Token

1. **Check token expiration:**
   - JWT tokens have an `exp` claim
   - Decode your token at jwt.io to check expiration

2. **Verify environment match:**
   - Token must be valid for the environment in `TEST_ENV`
   - Sandbox tokens won't work for production, etc.

3. **Check header format:**
   - The framework automatically adds `Authorization: Bearer {token}`
   - No need to include "Bearer" in the AUTH_TOKEN value

4. **Test token manually:**
   ```bash
   # Test GraphQL with curl
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"query":"{ getMe }"}' \
        https://your-api-url/graphql
   ```

### Trek Login Not Working

1. Check all required environment variables are set
2. Verify credentials are correct
3. Check network access to Trek service
4. Review console output for specific error messages

## Security Notes

⚠️ **Never commit `.env` file to version control**

Your `.env` file contains sensitive credentials. It's already in `.gitignore`, but double-check before committing:

```bash
git status
# Should NOT show .env in changes
```

## Quick Reference

### Run Specific Tests

```bash
# Health check only (no auth needed)
npm run test:health

# Profile test (requires auth)
npm run test:profile

# GraphQL test (requires auth)
npm run test:graphql

# All smoke tests
npm run test:smoke
```

### Check Current Configuration

```bash
# View environment settings (won't show tokens)
cat .env | grep TEST_ENV
cat .env | grep BASE_URL
```
