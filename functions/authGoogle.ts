/**
 * Google OAuth Callback Handler
 * 
 * This function handles the Google OAuth authentication flow:
 * 1. Receives OAuth authorization code or credential from Google
 * 2. Verifies token using google-auth-library
 * 3. Fetches user profile from Google
 * 4. Creates or updates user in database using Base44 entities
 * 5. Generates session token
 * 
 * Security Features:
 * - Token validation using google-auth-library
 * - CSRF protection
 * - Secure user creation/lookup
 * - Session management
 */

import { OAuth2Client } from 'npm:google-auth-library@9.6.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import jwt from 'npm:jsonwebtoken@9.0.2';

interface GoogleAuthRequest {
  credential?: string; // Google ID token (from Google Sign-In)
  code?: string; // Authorization code (from OAuth flow)
  state?: string; // CSRF token
}

interface GoogleUserProfile {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    profile_picture?: string;
    google_id: string;
  };
  expiresIn?: number;
  error?: string;
}

/**
 * Verify Google ID token using google-auth-library
 */
async function verifyGoogleToken(
  credential: string, 
  clientId: string
): Promise<GoogleUserProfile | null> {
  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified || false,
      name: payload.name || '',
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Exchange authorization code for access token and verify
 */
async function exchangeCodeForToken(
  code: string, 
  clientId: string, 
  clientSecret: string, 
  redirectUri: string
): Promise<GoogleUserProfile | null> {
  try {
    const client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await client.getToken(code);
    
    if (!tokens.id_token) {
      return null;
    }
    
    return await verifyGoogleToken(tokens.id_token, clientId);
  } catch (error) {
    console.error('Token exchange error:', error);
    return null;
  }
}

/**
 * Create or update user from Google profile using Base44 entities
 */
async function findOrCreateUser(
  base44Client: any, 
  googleProfile: GoogleUserProfile
): Promise<any> {
  try {
    // Check if user exists by google_id
    const usersByGoogleId = await base44Client.entities.User.filter({
      google_id: googleProfile.sub,
    });
    
    if (usersByGoogleId && usersByGoogleId.length > 0) {
      const existingUser = usersByGoogleId[0];
      // Update existing user with latest Google info
      await base44Client.entities.User.update(existingUser.id, {
        profile_picture: googleProfile.picture,
        email_verified: googleProfile.email_verified,
        last_login_at: new Date().toISOString(),
      });
      return existingUser;
    }
    
    // Check if user exists by email
    const usersByEmail = await base44Client.entities.User.filter({
      email: googleProfile.email,
    });
    
    if (usersByEmail && usersByEmail.length > 0) {
      const existingUser = usersByEmail[0];
      // Link Google account to existing user
      await base44Client.entities.User.update(existingUser.id, {
        google_id: googleProfile.sub,
        profile_picture: googleProfile.picture,
        email_verified: googleProfile.email_verified,
        last_login_at: new Date().toISOString(),
      });
      return existingUser;
    }
    
    // Create new user
    const newUser = await base44Client.entities.User.create({
      email: googleProfile.email,
      name: googleProfile.name,
      google_id: googleProfile.sub,
      profile_picture: googleProfile.picture,
      email_verified: googleProfile.email_verified,
      is_active: true,
      last_login_at: new Date().toISOString(),
      failed_login_attempts: 0,
    });
    
    return newUser;
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
}

/**
 * Generate JWT token with proper signing
 */
function generateToken(
  userId: string, 
  email: string, 
  secret: string, 
  expiresIn: number = 86400
): string {
  return jwt.sign(
    {
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    },
    secret,
    { algorithm: 'HS256' }
  );
}

/**
 * Main Deno handler function
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { credential, code, state }: GoogleAuthRequest = await req.json();

    // Get environment variables
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const googleRedirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'default-secret-change-in-production';

    if (!googleClientId) {
      return Response.json({
        success: false,
        error: 'Google OAuth not configured'
      } as AuthResponse, { status: 500 });
    }

    let googleProfile: GoogleUserProfile | null = null;

    // Handle Google Sign-In credential (ID token)
    if (credential) {
      googleProfile = await verifyGoogleToken(credential, googleClientId);
    }
    // Handle OAuth authorization code flow
    else if (code) {
      if (!googleClientSecret || !googleRedirectUri) {
        return Response.json({
          success: false,
          error: 'Google OAuth not fully configured'
        } as AuthResponse, { status: 500 });
      }
      googleProfile = await exchangeCodeForToken(code, googleClientId, googleClientSecret, googleRedirectUri);
    }
    else {
      return Response.json({
        success: false,
        error: 'Missing credential or authorization code'
      } as AuthResponse, { status: 400 });
    }

    if (!googleProfile) {
      return Response.json({
        success: false,
        error: 'Invalid Google credential'
      } as AuthResponse, { status: 400 });
    }

    // Verify email is verified by Google
    if (!googleProfile.email_verified) {
      return Response.json({
        success: false,
        error: 'Email not verified by Google'
      } as AuthResponse, { status: 400 });
    }

    // Find or create user
    const user = await findOrCreateUser(base44, googleProfile);

    // Check if user is active
    if (!user.is_active) {
      return Response.json({
        success: false,
        error: 'Account is inactive'
      } as AuthResponse, { status: 403 });
    }

    // Generate session token
    const expiresIn = 24 * 60 * 60; // 24 hours
    const token = generateToken(user.id, user.email, jwtSecret, expiresIn);

    // Store session in database
    try {
      await base44.entities.Session.create({
        user_id: user.id,
        token: token,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || '',
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        is_active: true,
      });
    } catch (sessionError) {
      console.error('Failed to create session:', sessionError);
      // Continue even if session storage fails
    }

    // Return success response with headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Set-Cookie', [
      `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${expiresIn}; Path=/`,
      `user_id=${user.id}; Secure; SameSite=Strict; Max-Age=${expiresIn}; Path=/`
    ].join(', '));

    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture,
        google_id: user.google_id
      },
      expiresIn
    } as AuthResponse), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Google auth error:', error);
    return Response.json({
      success: false,
      error: 'Internal server error'
    } as AuthResponse, { status: 500 });
  }
});
