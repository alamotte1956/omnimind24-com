# Migration Guide: Base44 to Standalone React Application

## Overview

This guide documents the migration of OmniMind24 from a Base44-dependent application to a standalone React application with custom API integrations.

## What Changed

### 1. Dependencies

**Removed:**
- `@base44/sdk` - All Base44 platform dependencies

**Added:**
- None - Using native `fetch` API for HTTP requests

### 2. Authentication System

**Before (Base44):**
```javascript
import { base44 } from '@/api/base44Client';

// Get current user
const user = await base44.auth.me();

// Logout
base44.auth.logout(redirectUrl);

// Redirect to login
base44.auth.redirectToLogin(returnPath);
```

**After (Custom JWT):**
```javascript
import { apiClient } from '@/api/apiClient';

// Get current user
const user = await apiClient.auth.me();

// Logout
apiClient.auth.logout(redirectUrl);

// Redirect to login
apiClient.auth.redirectToLogin(returnPath);

// New: Login with credentials
const response = await apiClient.auth.login(email, password, remember);
```

### 3. Entity Operations

**Before (Base44):**
```javascript
import { base44 } from '@/api/base44Client';

// Query entities
const users = await base44.entities.User.list('-created_date');

// Create entity
await base44.entities.Document.create(data);
```

**After (Custom API):**
```javascript
import { apiClient } from '@/api/apiClient';
// OR import specific entities
import { User, Document } from '@/api/entities';

// Query entities (same interface)
const users = await apiClient.entities.User.list('-created_date');
// OR
const users = await User.list('-created_date');

// Create entity (same interface)
await apiClient.entities.Document.create(data);
// OR
await Document.create(data);
```

### 4. Function Invocations

**Before (Base44):**
```javascript
import { base44 } from '@/api/base44Client';

const result = await base44.functions.invoke('functionName', params);
```

**After (Custom API):**
```javascript
import { apiClient } from '@/api/apiClient';

const result = await apiClient.functions.invoke('functionName', params);
```

### 5. Integrations

**Before (Base44):**
```javascript
import { base44 } from '@/api/base44Client';

await base44.integrations.Core.InvokeLLM(params);
await base44.integrations.Core.SendEmail(params);
```

**After (Custom API):**
```javascript
import { apiClient } from '@/api/apiClient';
// OR import specific integrations
import { InvokeLLM, SendEmail } from '@/api/integrations';

await apiClient.integrations.Core.InvokeLLM(params);
await apiClient.integrations.Core.SendEmail(params);
// OR
await InvokeLLM(params);
await SendEmail(params);
```

### 6. Environment Variables

**Before:**
```env
VITE_BASE44_APP_ID=6948a16137ff8a8e50ada4e6
VITE_BASE44_API_URL=https://api.base44.com
VITE_BASE44_FUNCTIONS_VERSION=...
```

**After:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_STRIPE_PUBLIC_KEY=pk_...
VITE_AWS_S3_BUCKET=...
VITE_SENDGRID_API_KEY=SG....
```

## API Client Architecture

### New API Client (`src/api/apiClient.js`)

The new API client provides:

1. **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
2. **Authentication**: JWT token management via localStorage/sessionStorage
3. **Error Handling**: Standardized error responses
4. **Entity Operations**: CRUD operations for all entities
5. **Function Invocations**: Backend function calling
6. **Integrations**: Third-party service wrappers

### Token Storage

Tokens are stored in:
- `localStorage` for "remember me" sessions
- `sessionStorage` for temporary sessions

Access via:
```javascript
import { storage } from '@/api/apiClient';

storage.getToken();
storage.setToken(token, remember);
storage.removeToken();
```

## Required Backend Implementation

The frontend now expects a backend API at `VITE_API_BASE_URL` (default: `http://localhost:3000/api`) with the following endpoints:

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout (optional)

### Entity Endpoints

For each entity (users, documents, orders, etc.):

- `GET /api/{entity}` - List entities (supports `?sort=`, `?limit=`, `?filter=`)
- `GET /api/{entity}/:id` - Get entity by ID
- `POST /api/{entity}` - Create entity
- `PUT /api/{entity}/:id` - Update entity
- `PATCH /api/{entity}/:id` - Partial update
- `DELETE /api/{entity}/:id` - Delete entity
- `POST /api/{entity}/query` - Custom query

### Function Endpoints

- `POST /api/functions/:name` - Invoke backend function

### Integration Endpoints

- `POST /api/integrations/llm` - Invoke LLM (OpenAI, Anthropic, etc.)
- `POST /api/integrations/email` - Send email
- `POST /api/integrations/upload` - Upload file to S3
- `POST /api/integrations/image` - Generate image
- `POST /api/integrations/extract` - Extract data from file
- `POST /api/integrations/signed-url` - Create file signed URL
- `POST /api/integrations/private-upload` - Upload private file

## Migration Checklist for Developers

### If you're adding new features:

1. ✅ Import from `@/api/apiClient` instead of `@/api/base44Client`
2. ✅ Use `apiClient` instead of `base44`
3. ✅ Store auth tokens using `storage` helper
4. ✅ Define new backend endpoints in API documentation

### If you're maintaining existing code:

1. ✅ All imports already updated (global search/replace completed)
2. ✅ Entity operations use same interface (backward compatible)
3. ✅ Function invocations use same interface
4. ✅ Authentication methods have same signatures

## Breaking Changes

### None for Frontend Code

The migration was designed to be backward compatible. All existing code patterns continue to work with the new API client.

### For Backend Implementation

You need to implement:

1. **JWT Authentication** - Login, register, token refresh
2. **Entity CRUD Operations** - For all 25+ entities
3. **Function Handlers** - For all 40+ backend functions
4. **Integration Wrappers** - For LLM, email, file storage, etc.

## Testing the Migration

### 1. Build Test
```bash
npm run build
```
✅ Should build without errors

### 2. Linting
```bash
npm run lint
```

### 3. Development Server
```bash
npm run dev
```
Note: Without backend, you'll see API errors - this is expected.

### 4. With Mock Backend

Create a simple Express server at `http://localhost:3000` with:
- JWT authentication
- Basic entity endpoints
- Health check endpoint

## Security Considerations

### Token Security

- Tokens stored in localStorage (persistent) or sessionStorage (temporary)
- Tokens sent via `Authorization: Bearer {token}` header
- No tokens in URL parameters

### XSS Protection

- All existing sanitization remains in place (`@/lib/sanitizer`)
- Error messages sanitized (`@/lib/errorHandler`)

### CSRF Protection

- Consider implementing CSRF tokens in backend
- Use SameSite cookies if using cookie-based auth

## Performance

### Bundle Size

**Before:** 1,212 KB (with Base44 SDK)
**After:** 1,173 KB (without Base44 SDK)
**Savings:** ~39 KB (3.2% reduction)

### API Calls

- Same number of API calls
- Direct HTTP requests (no SDK overhead)
- Faster response handling

## Rollback Plan

If needed, you can rollback by:

1. Restore previous commit: `git revert {commit-hash}`
2. Reinstall Base44 SDK: `npm install @base44/sdk@^0.1.2`
3. Update environment variables back to Base44 config

## Support

For questions or issues:
- Check API client implementation: `src/api/apiClient.js`
- Review entity examples: `src/api/entities.js`
- See function examples: `src/api/functions.js`
- Contact: Development Team

## Future Enhancements

Consider implementing:

1. **Request Retry Logic** - Automatic retry on network failures
2. **Request Caching** - Cache GET requests for performance
3. **Request Queuing** - Queue requests when offline
4. **Request Logging** - Log all API calls for debugging
5. **API Versioning** - Support multiple API versions
6. **GraphQL Support** - Alternative to REST endpoints

---

**Migration Date:** January 2026  
**Migration Status:** ✅ Complete  
**Build Status:** ✅ Passing
