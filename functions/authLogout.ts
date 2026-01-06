/**
 * Logout Endpoint
 * 
 * This function handles user logout by:
 * 1. Invalidating the current session/token in Base44
 * 2. Clearing authentication cookies
 * 3. Logging the logout event
 * 
 * Security Features:
 * - Token invalidation in database
 * - Session cleanup
 * - Secure cookie clearing
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Main Deno handler function
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get token from header or cookie
    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie');
    let token = authHeader?.replace('Bearer ', '');
    
    // Parse cookie if no Authorization header
    if (!token && cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const authCookie = cookies.find(c => c.startsWith('auth_token='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }

    // Invalidate token in database
    if (token) {
      try {
        // Find and deactivate all sessions with this token
        const sessions = await base44.entities.Session.filter({ token: token });
        
        for (const session of sessions) {
          await base44.entities.Session.update(session.id, {
            is_active: false,
            revoked_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to invalidate session:', error);
        // Continue with logout even if session invalidation fails
      }
    }

    // Log logout event
    console.log('User logged out:', { 
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      hasToken: !!token
    });

    // Return response with cookie clearing headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Set-Cookie', [
      'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
      'user_id=; Secure; SameSite=Strict; Max-Age=0; Path=/',
      'refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    ].join(', '));

    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    } as LogoutResponse), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Logout error:', error);
    return Response.json({
      success: false,
      error: 'Internal server error'
    } as LogoutResponse, { status: 500 });
  }
});
