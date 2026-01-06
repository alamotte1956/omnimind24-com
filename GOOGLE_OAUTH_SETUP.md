# Google OAuth Setup Guide

This guide will help you set up Google OAuth 2.0 authentication for the OmniMind24 application.

## Prerequisites

- Google Cloud Platform account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "OmniMind24" (or your preferred name)
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (or "Internal" if using Google Workspace)
3. Click "Create"

### Fill in the required information:

**App Information:**
- App name: `OmniMind24`
- User support email: `your-email@example.com`
- App logo: (optional) Upload your logo

**App Domain:**
- Application home page: `https://omnimind24.com`
- Application privacy policy link: `https://omnimind24.com/privacy`
- Application terms of service link: `https://omnimind24.com/terms`

**Authorized domains:**
- Add: `omnimind24.com`
- Add: `base44.com` (if using Base44 hosting)

**Developer contact information:**
- Email addresses: `your-email@example.com`

4. Click "Save and Continue"

### Scopes:

1. Click "Add or Remove Scopes"
2. Select the following scopes:
   - `userinfo.email` - See your primary Google Account email address
   - `userinfo.profile` - See your personal info, including any personal info you've made publicly available
   - `openid` - Authenticate using OpenID Connect
3. Click "Update" and then "Save and Continue"

### Test users (for development):

1. Add test user emails (if your app is in testing mode)
2. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type

### Configure the OAuth Client:

**Name:** `OmniMind24 Web Client`

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:3000
https://omnimind24.com
https://www.omnimind24.com
https://omnimind24-com.base44.com
```

**Authorized redirect URIs:**
```
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
https://omnimind24.com/auth/callback
https://www.omnimind24.com/auth/callback
https://omnimind24-com.base44.com/auth/callback
```

4. Click "Create"

## Step 5: Save Your Credentials

After creating the OAuth client, you'll see a dialog with:
- **Client ID**: Looks like `123456789-xxxxxxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: A random string

**Important:** Save these credentials securely!

## Step 6: Configure Environment Variables

### For Local Development

Create a `.env.local` file in your project root:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### For Production (Base44 or other hosting)

Add the following environment variables to your production environment:

```env
VITE_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-production-client-secret
```

**Security Note:** Never commit `.env.local` or any file containing real credentials to version control!

## Step 7: Update Your Application

The application is already configured to use Google OAuth. Just ensure:

1. Environment variables are set correctly
2. The Google OAuth provider is wrapping your app (already done in `main.jsx`)
3. The LoginEnhanced component is being used (already configured)

## Step 8: Test the Integration

### Local Testing:

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:5173/Login`
3. Click the "Sign in with Google" button
4. You should see the Google OAuth consent screen
5. Select your Google account
6. Grant permissions
7. You should be redirected back to your application

### Production Testing:

1. Deploy your application
2. Navigate to your login page
3. Test the Google OAuth flow
4. Verify that user data is correctly stored

## Common Issues and Solutions

### Issue 1: "redirect_uri_mismatch" Error

**Solution:** Ensure the redirect URI in your Google Cloud Console exactly matches the one your application is using. Include the protocol (http/https), domain, and path.

### Issue 2: "origin_mismatch" Error

**Solution:** Add your application's origin to the "Authorized JavaScript origins" in Google Cloud Console.

### Issue 3: "invalid_client" Error

**Solution:** 
- Verify your Client ID is correct
- Check that you're using the right credentials for the environment (dev vs. prod)
- Ensure the OAuth client is enabled

### Issue 4: Consent Screen Shows "Unverified App" Warning

**Solution:** 
- This is normal for apps in testing mode
- To remove it, submit your app for verification (required for production)
- Or add users to the test users list

### Issue 5: Token Validation Fails

**Solution:**
- Implement proper token verification on the backend
- Use Google's official libraries: `google-auth-library` for Node.js
- Never trust client-side token decoding for authentication

## Moving to Production

### 1. Publish Your OAuth Consent Screen

1. Go to "OAuth consent screen" in Google Cloud Console
2. Click "Publish App"
3. Submit for verification if your app will have more than 100 users

### 2. App Verification

For apps requesting sensitive scopes, Google requires verification:
1. Prepare your app for review
2. Submit verification request
3. Respond to any feedback from Google
4. Wait for approval (can take several weeks)

### 3. Use Production Credentials

- Create separate OAuth clients for production
- Use different Client IDs for each environment
- Rotate Client Secrets periodically

### 4. Security Checklist

- ✅ Use HTTPS in production
- ✅ Implement CSRF protection (already done)
- ✅ Validate tokens on the server side
- ✅ Store tokens securely (HttpOnly cookies)
- ✅ Implement token refresh mechanism
- ✅ Set up rate limiting
- ✅ Monitor for suspicious activity
- ✅ Implement proper error handling
- ✅ Log security events

## Advanced Configuration

### Custom Scopes

If you need additional user data, request additional scopes:

```javascript
// In your GoogleLogin component
<GoogleLogin
  onSuccess={handleSuccess}
  scope="openid email profile https://www.googleapis.com/auth/calendar.readonly"
/>
```

### Token Refresh

Implement token refresh for long-lived sessions:

```javascript
// Backend endpoint to refresh token
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  return await response.json();
}
```

### Revoke Access

Allow users to disconnect their Google account:

```javascript
async function revokeGoogleAccess(token) {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}
```

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues:
1. Check the Google Cloud Console logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Check that all redirect URIs are correctly configured
5. Ensure your OAuth consent screen is properly configured

For additional help, consult the official Google documentation or create an issue in the repository.
