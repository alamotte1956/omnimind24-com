# Environment Variables Documentation

This document describes all environment variables used in the OmniMind24 application and their purpose.

## Overview

All environment variables in this Vite-based application **must** be prefixed with `VITE_` to be accessible in the client-side code. Access them using `import.meta.env.VARIABLE_NAME`.

## Required Variables

### Base44 Configuration
- **VITE_BASE44_APP_ID**: Application identifier for Base44 services
  - Required: Yes
  - Example: `6948a16137ff8a8e50ada4e6`

- **VITE_BASE44_PROJECT_ID**: Project identifier for Base44
  - Required: Yes
  - Example: `your_project_id_here`

- **VITE_BASE44_API_URL**: Base44 API endpoint
  - Required: Yes
  - Default: `https://api.base44.com`

### API Configuration
- **VITE_API_BASE_URL**: Main API endpoint for the application
  - Required: Yes
  - Example: `https://omnimind24-com.base44.com`

## Optional Variables

### Payment Processing
- **VITE_STRIPE_PUBLISHABLE_KEY**: Stripe public key for payment processing
  - Required: No (payments will be disabled if not set)
  - Format: `pk_test_...` (test) or `pk_live_...` (production)
  - Security: Public key only - never include secret keys

### Authentication
- **VITE_GOOGLE_CLIENT_ID**: Google OAuth client ID
  - Required: No (Google Sign-In will be disabled if not set)
  - Format: `...apps.googleusercontent.com`
  - Setup Guide: See GOOGLE_OAUTH_SETUP.md

- **VITE_GOOGLE_CLIENT_SECRET**: Google OAuth client secret
  - Required: Only for backend OAuth flows
  - Security: Handle with care, should not be exposed to client

### Error Tracking & Monitoring
- **VITE_SENTRY_DSN**: Sentry Data Source Name for error tracking
  - Required: No
  - Purpose: Production error monitoring and logging
  - Get from: https://sentry.io/
  - Note: Source maps are only generated when this is set

### Analytics
- **VITE_GOOGLE_ANALYTICS_ID**: Google Analytics tracking ID
  - Required: No
  - Format: `G-XXXXXXXXXX` or `UA-XXXXXXXXX-X`

### AI Services (Optional)
- **VITE_OPENAI_API_KEY**: OpenAI API key for GPT models
  - Required: No
  - Security: Store securely, rotate regularly

- **VITE_ANTHROPIC_API_KEY**: Anthropic API key for Claude models
  - Required: No
  - Security: Store securely, rotate regularly

- **VITE_GOOGLE_AI_API_KEY**: Google AI API key
  - Required: No
  - Security: Store securely, rotate regularly

### Environment Settings
- **VITE_ENV**: Current environment
  - Values: `development`, `staging`, `production`
  - Default: `development`

### Feature Flags
- **VITE_ENABLE_ANALYTICS**: Enable/disable analytics
  - Values: `true`, `false`
  - Default: `false`

- **VITE_ENABLE_DEBUG**: Enable debug mode
  - Values: `true`, `false`
  - Default: `true` (development), `false` (production)

## Vite-Specific Environment Variables

### Built-in Vite Variables
- **import.meta.env.MODE**: Current mode (`development`, `production`)
  - Set automatically by Vite
  - Use this instead of `process.env.NODE_ENV`

- **import.meta.env.DEV**: Boolean indicating development mode
- **import.meta.env.PROD**: Boolean indicating production mode
- **import.meta.env.SSR**: Boolean indicating server-side rendering

## Usage Examples

### Accessing Environment Variables
```javascript
// ✅ Correct - Use import.meta.env
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const isDev = import.meta.env.MODE === 'development';

// ❌ Wrong - process.env is not available in Vite
const apiUrl = process.env.VITE_API_BASE_URL; // This will fail!
```

### Conditional Logic Based on Environment
```javascript
// Check if in development mode
if (import.meta.env.MODE === 'development') {
  console.log('Debug info:', data);
}

// Use Vite's built-in boolean flags
if (import.meta.env.DEV) {
  // Development-only code
}

if (import.meta.env.PROD) {
  // Production-only code
}
```

### Optional Feature Activation
```javascript
// Check if a feature is enabled
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (stripeKey) {
  // Initialize Stripe
  const stripe = loadStripe(stripeKey);
}
```

## Security Best Practices

1. **Never commit actual `.env` files** - Use `.env.example` as a template
2. **Never include secret keys** - Only public keys/IDs should be in VITE_ variables
3. **Rotate API keys regularly** - Especially for AI services
4. **Use different keys for development and production**
5. **Validate environment variables** - Check for required variables on startup
6. **Don't log sensitive values** - Be careful with console.log in production

## Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values in `.env`

3. Restart the development server to load new variables:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Variable not available in code
- Ensure it's prefixed with `VITE_`
- Restart the dev server after adding new variables
- Check that you're using `import.meta.env` not `process.env`

### Different values in development vs production
- Make sure you have separate `.env` files or use environment-specific overrides
- Check your build/deployment configuration

### Secrets exposed in client bundle
- Remember: All `VITE_` variables are embedded in the client bundle
- Never put secret keys in `VITE_` variables
- Use backend/server-side environment variables for secrets
