# Authentication API Documentation

This document describes the authentication API endpoints for the OmniMind24 application.

## Base URL

```
Development: http://localhost:5173/api/auth
Production: https://omnimind24-com.base44.com/api/auth
```

## Authentication Flow

The application supports three authentication methods:
1. **Email/Password** - Traditional login with credentials
2. **Google OAuth 2.0** - Social login via Google
3. **Base44 OAuth** - Platform-native authentication

## Endpoints

### 1. Email/Password Login

Authenticate a user with email and password.

**Endpoint:** `POST /api/auth/login`

**Request Headers:**
```
Content-Type: application/json
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123456",
    "email": "user@example.com",
    "name": "John Doe",
    "profile_picture": "https://example.com/avatar.jpg"
  },
  "expiresIn": 86400
}
```

**Error Responses:**

**400 Bad Request - Invalid Input:**
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

**401 Unauthorized - Invalid Credentials:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**429 Too Many Requests - Rate Limited:**
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "retryAfter": 900
}
```

**Example Usage:**

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    rememberMe: true
  })
});

const data = await response.json();
if (data.success) {
  // Store token and redirect
  localStorage.setItem('auth_token', data.token);
  window.location.href = '/dashboard';
}
```

---

### 2. Google OAuth Login

Authenticate a user via Google OAuth 2.0.

**Endpoint:** `POST /api/auth/google`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (ID Token Flow):**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "state": "csrf_token_value"
}
```

**Request Body (Authorization Code Flow):**
```json
{
  "code": "4/0AX4XfWh...",
  "state": "csrf_token_value"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_789012",
    "email": "user@gmail.com",
    "name": "Jane Smith",
    "profile_picture": "https://lh3.googleusercontent.com/...",
    "google_id": "106712345678901234567"
  },
  "expiresIn": 86400
}
```

**Error Responses:**

**400 Bad Request - Missing Credential:**
```json
{
  "success": false,
  "error": "Missing credential or authorization code"
}
```

**400 Bad Request - Invalid Token:**
```json
{
  "success": false,
  "error": "Invalid Google credential"
}
```

**400 Bad Request - Email Not Verified:**
```json
{
  "success": false,
  "error": "Email not verified by Google"
}
```

**403 Forbidden - Inactive Account:**
```json
{
  "success": false,
  "error": "Account is inactive"
}
```

**Example Usage (React with @react-oauth/google):**

```javascript
import { GoogleLogin } from '@react-oauth/google';

<GoogleLogin
  onSuccess={async (credentialResponse) => {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: credentialResponse.credential,
        state: csrfToken
      })
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('auth_token', data.token);
      window.location.href = '/dashboard';
    }
  }}
  onError={() => {
    console.error('Google login failed');
  }}
/>
```

---

### 3. Logout

Invalidate the current session and clear authentication.

**Endpoint:** `POST /api/auth/logout`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Example Usage:**

```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});

const data = await response.json();
if (data.success) {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
```

---

### 4. Session Check

Validate the current session and retrieve user information.

**Endpoint:** `GET /api/auth/session`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK - Authenticated):**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "user_123456",
    "email": "user@example.com",
    "name": "John Doe",
    "profile_picture": "https://example.com/avatar.jpg"
  },
  "expiresIn": 3600,
  "needsRefresh": false
}
```

**Success Response (200 OK - Not Authenticated):**
```json
{
  "success": true,
  "authenticated": false
}
```

**Success Response (200 OK - Needs Refresh):**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "user_123456",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "expiresIn": 1200,
  "needsRefresh": true
}
```

**Example Usage:**

```javascript
const response = await fetch('/api/auth/session', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});

const data = await response.json();
if (data.authenticated) {
  // User is logged in
  console.log('User:', data.user);
  
  if (data.needsRefresh) {
    // Refresh token
    await refreshAuthToken();
  }
} else {
  // Redirect to login
  window.location.href = '/login';
}
```

---

## Security Headers

All API responses include the following security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Rate Limiting

Rate limits are applied to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/login | 5 attempts | 15 minutes per email |
| POST /api/auth/login | 10 attempts | 15 minutes per IP |
| POST /api/auth/google | 20 attempts | 15 minutes per IP |
| GET /api/auth/session | 60 requests | 1 minute per token |

When rate limited, the response will include:

```json
{
  "success": false,
  "error": "Too many requests",
  "retryAfter": 900
}
```

**Headers:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640000000
Retry-After: 900
```

## Token Management

### JWT Token Structure

Tokens are JWT (JSON Web Tokens) with the following structure:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "user_123456",
  "email": "user@example.com",
  "iat": 1640000000,
  "exp": 1640086400
}
```

### Token Expiration

- **Standard session:** 24 hours
- **Remember me:** 30 days
- **Refresh threshold:** 30 minutes before expiration

### Token Storage

**Client-side best practices:**

1. **HttpOnly Cookies (Recommended):**
   - Automatically set by server
   - Not accessible via JavaScript
   - Sent with every request

2. **localStorage (Alternative):**
   - Manually included in Authorization header
   - Accessible via JavaScript (XSS risk)

```javascript
// Using cookies (automatic)
fetch('/api/auth/session', {
  credentials: 'include'
});

// Using localStorage
fetch('/api/auth/session', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input or parameters |
| 401 | Unauthorized - Invalid credentials or token |
| 403 | Forbidden - Account locked or inactive |
| 404 | Not Found - Endpoint doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## CORS Configuration

For cross-origin requests, ensure your client is configured:

```javascript
// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://omnimind24.com',
  'https://omnimind24-com.base44.com'
];

// Server-side CORS headers
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## Testing

### Test the API with cURL

**Login:**
```bash
curl -X POST https://api.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Check Session:**
```bash
curl -X GET https://api.example.com/auth/session \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Logout:**
```bash
curl -X POST https://api.example.com/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Client-Side Integration

### React Example

```javascript
// authService.js
export const authService = {
  async login(email, password, rememberMe = false) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe })
    });
    return await response.json();
  },

  async loginWithGoogle(credential) {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    return await response.json();
  },

  async logout() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    localStorage.removeItem('auth_token');
    return await response.json();
  },

  async checkSession() {
    const token = localStorage.getItem('auth_token');
    if (!token) return { authenticated: false };
    
    const response = await fetch('/api/auth/session', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  }
};
```

## Support

For issues or questions:
- Check the error response for specific details
- Review the logs in the server console
- Consult the main README.md for setup instructions
- Create an issue in the repository
