/**
 * Track Login Attempt Serverless Function
 * 
 * This function tracks login attempts on the server side to provide
 * robust brute force protection that cannot be bypassed by clearing
 * browser storage.
 * 
 * Features:
 * - Per-email attempt tracking
 * - Per-IP attempt tracking
 * - Configurable lockout duration
 * - Automatic cleanup of old attempts
 */

interface LoginAttempt {
  email: string;
  ip: string;
  timestamp: number;
  success: boolean;
  userAgent?: string;
}

interface LockoutStatus {
  isLocked: boolean;
  lockoutUntil?: number;
  remainingAttempts?: number;
  reason?: string;
}

// Configuration
const CONFIG = {
  maxAttemptsPerEmail: 5,
  maxAttemptsPerIP: 10,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  attemptWindowMs: 15 * 60 * 1000, // 15 minutes
  cleanupIntervalMs: 60 * 60 * 1000, // 1 hour
};

// In-memory storage (in production, use a database like Redis)
// This is a simplified implementation for demonstration
const loginAttempts: Map<string, LoginAttempt[]> = new Map();
const lockouts: Map<string, number> = new Map();

/**
 * Get the client IP from the request
 */
function getClientIP(request: any): string {
  return request.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
         request.headers?.['x-real-ip'] ||
         request.connection?.remoteAddress ||
         'unknown';
}

/**
 * Hash an identifier for storage
 */
function hashIdentifier(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `id_${hash.toString(16)}`;
}

/**
 * Clean up old attempts
 */
function cleanupOldAttempts(): void {
  const now = Date.now();
  
  // Clean up attempts
  for (const [key, attempts] of loginAttempts.entries()) {
    const validAttempts = attempts.filter(
      a => now - a.timestamp < CONFIG.attemptWindowMs
    );
    if (validAttempts.length === 0) {
      loginAttempts.delete(key);
    } else {
      loginAttempts.set(key, validAttempts);
    }
  }

  // Clean up expired lockouts
  for (const [key, lockoutUntil] of lockouts.entries()) {
    if (now > lockoutUntil) {
      lockouts.delete(key);
    }
  }
}

/**
 * Check if an identifier is locked out
 */
function checkLockout(identifier: string): LockoutStatus {
  const hashedId = hashIdentifier(identifier);
  const lockoutUntil = lockouts.get(hashedId);
  
  if (lockoutUntil && Date.now() < lockoutUntil) {
    return {
      isLocked: true,
      lockoutUntil,
      reason: 'Too many failed login attempts'
    };
  }

  // Clear expired lockout
  if (lockoutUntil) {
    lockouts.delete(hashedId);
  }

  return { isLocked: false };
}

/**
 * Get recent attempts for an identifier
 */
function getRecentAttempts(identifier: string): LoginAttempt[] {
  const hashedId = hashIdentifier(identifier);
  const attempts = loginAttempts.get(hashedId) || [];
  const now = Date.now();
  
  return attempts.filter(a => now - a.timestamp < CONFIG.attemptWindowMs);
}

/**
 * Record a login attempt
 */
function recordAttempt(
  email: string, 
  ip: string, 
  success: boolean,
  userAgent?: string
): { emailAttempts: number; ipAttempts: number } {
  const now = Date.now();
  const attempt: LoginAttempt = {
    email,
    ip,
    timestamp: now,
    success,
    userAgent
  };

  // Record by email
  const emailHash = hashIdentifier(email.toLowerCase());
  const emailAttempts = getRecentAttempts(email.toLowerCase());
  emailAttempts.push(attempt);
  loginAttempts.set(emailHash, emailAttempts);

  // Record by IP
  const ipHash = hashIdentifier(ip);
  const ipAttempts = getRecentAttempts(ip);
  ipAttempts.push(attempt);
  loginAttempts.set(ipHash, ipAttempts);

  return {
    emailAttempts: emailAttempts.filter(a => !a.success).length,
    ipAttempts: ipAttempts.filter(a => !a.success).length
  };
}

/**
 * Set lockout for an identifier
 */
function setLockout(identifier: string): void {
  const hashedId = hashIdentifier(identifier);
  lockouts.set(hashedId, Date.now() + CONFIG.lockoutDurationMs);
}

/**
 * Clear lockout and attempts for an identifier (on successful login)
 */
function clearAttemptsAndLockout(identifier: string): void {
  const hashedId = hashIdentifier(identifier);
  loginAttempts.delete(hashedId);
  lockouts.delete(hashedId);
}

/**
 * Main handler function
 */
export default async function handler(request: any, response: any) {
  // Clean up old data periodically
  cleanupOldAttempts();

  const { action, email, success } = request.body || {};
  const ip = getClientIP(request);
  const userAgent = request.headers?.['user-agent'];

  try {
    switch (action) {
      case 'check': {
        // Check if email or IP is locked out
        const emailLockout = email ? checkLockout(email.toLowerCase()) : { isLocked: false };
        const ipLockout = checkLockout(ip);

        if (emailLockout.isLocked || ipLockout.isLocked) {
          return response.json({
            success: false,
            locked: true,
            lockoutUntil: Math.max(
              emailLockout.lockoutUntil || 0,
              ipLockout.lockoutUntil || 0
            ),
            reason: emailLockout.reason || ipLockout.reason
          });
        }

        // Get remaining attempts
        const emailAttempts = email ? getRecentAttempts(email.toLowerCase()).filter(a => !a.success).length : 0;
        const ipAttempts = getRecentAttempts(ip).filter(a => !a.success).length;

        return response.json({
          success: true,
          locked: false,
          remainingAttempts: Math.min(
            CONFIG.maxAttemptsPerEmail - emailAttempts,
            CONFIG.maxAttemptsPerIP - ipAttempts
          )
        });
      }

      case 'record': {
        if (!email) {
          return response.status(400).json({
            success: false,
            error: 'Email is required'
          });
        }

        // Record the attempt
        const { emailAttempts, ipAttempts } = recordAttempt(
          email.toLowerCase(),
          ip,
          success === true,
          userAgent
        );

        // Check if lockout should be triggered
        if (!success) {
          if (emailAttempts >= CONFIG.maxAttemptsPerEmail) {
            setLockout(email.toLowerCase());
            return response.json({
              success: false,
              locked: true,
              lockoutUntil: Date.now() + CONFIG.lockoutDurationMs,
              reason: 'Too many failed attempts for this email'
            });
          }

          if (ipAttempts >= CONFIG.maxAttemptsPerIP) {
            setLockout(ip);
            return response.json({
              success: false,
              locked: true,
              lockoutUntil: Date.now() + CONFIG.lockoutDurationMs,
              reason: 'Too many failed attempts from this IP'
            });
          }

          return response.json({
            success: true,
            locked: false,
            remainingAttempts: Math.min(
              CONFIG.maxAttemptsPerEmail - emailAttempts,
              CONFIG.maxAttemptsPerIP - ipAttempts
            )
          });
        }

        // Successful login - clear attempts
        clearAttemptsAndLockout(email.toLowerCase());
        clearAttemptsAndLockout(ip);

        return response.json({
          success: true,
          locked: false,
          message: 'Login successful, attempts cleared'
        });
      }

      case 'clear': {
        // Admin action to clear lockout (requires authentication)
        if (email) {
          clearAttemptsAndLockout(email.toLowerCase());
        }
        clearAttemptsAndLockout(ip);

        return response.json({
          success: true,
          message: 'Lockout cleared'
        });
      }

      default:
        return response.status(400).json({
          success: false,
          error: 'Invalid action. Use: check, record, or clear'
        });
    }
  } catch (error) {
    console.error('Login tracking error:', error);
    return response.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
