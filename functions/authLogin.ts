/**
 * Email/Password Login Endpoint
 * 
 * This function handles traditional email/password authentication
 * with comprehensive security features.
 * 
 * Features:
 * - Email/password validation
 * - Password hashing verification (bcrypt)
 * - Rate limiting integration
 * - Session/JWT token generation
 * - Security event logging
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import bcrypt from 'npm:bcryptjs@2.4.3';
import jwt from 'npm:jsonwebtoken@9.0.2';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    profile_picture?: string;
  };
  expiresIn?: number;
  error?: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email input
 */
function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().substring(0, 254);
}

/**
 * Generate JWT token with proper signing
 */
function generateToken(
  userId: string, 
  email: string, 
  secret: string, 
  expiresIn: number
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
    const { email, password, rememberMe }: LoginRequest = await req.json();

    // Validate input
    if (!email || !password) {
      return Response.json({
        success: false,
        error: 'Email and password are required'
      } as LoginResponse, { status: 400 });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!isValidEmail(sanitizedEmail)) {
      return Response.json({
        success: false,
        error: 'Invalid email format'
      } as LoginResponse, { status: 400 });
    }

    // Validate password (basic checks)
    if (password.length < 8) {
      return Response.json({
        success: false,
        error: 'Invalid credentials'
      } as LoginResponse, { status: 400 });
    }

    // Query user from database
    const users = await base44.entities.User.filter({ email: sanitizedEmail });
    
    if (!users || users.length === 0) {
      // Use generic error message to prevent user enumeration
      return Response.json({
        success: false,
        error: 'Invalid credentials'
      } as LoginResponse, { status: 401 });
    }

    const user = users[0];

    // Check if user has a password hash (might be OAuth-only user)
    if (!user.password_hash) {
      return Response.json({
        success: false,
        error: 'Please sign in with Google'
      } as LoginResponse, { status: 401 });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return Response.json({
        success: false,
        error: 'Account is temporarily locked. Please try again later.'
      } as LoginResponse, { status: 403 });
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const updateData: any = {
        failed_login_attempts: failedAttempts,
      };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
      }

      await base44.entities.User.update(user.id, updateData);

      return Response.json({
        success: false,
        error: 'Invalid credentials'
      } as LoginResponse, { status: 401 });
    }

    // Check if user is active
    if (!user.is_active) {
      return Response.json({
        success: false,
        error: 'Account is inactive'
      } as LoginResponse, { status: 403 });
    }

    // Reset failed login attempts and update last login
    await base44.entities.User.update(user.id, {
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    });

    // Get JWT secret
    const jwtSecret = Deno.env.get('JWT_SECRET');
    
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return Response.json({
        success: false,
        error: 'Server configuration error'
      } as LoginResponse, { status: 500 });
    }

    // Generate session token
    const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours
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

    // Return success response
    return Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture || undefined
      },
      expiresIn
    } as LoginResponse);

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({
      success: false,
      error: 'Internal server error'
    } as LoginResponse, { status: 500 });
  }
});
