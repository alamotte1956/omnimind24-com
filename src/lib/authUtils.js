/**
 * Authentication Utilities for OmniMind24
 * 
 * This module provides enhanced security features for authentication,
 * including session management, login attempt tracking, and security helpers.
 */

import { generateSecureToken } from './security';

// Session configuration
const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 30 * 60 * 1000, // Refresh if less than 30 minutes remaining
  inactivityTimeout: 30 * 60 * 1000, // 30 minutes of inactivity
};

// Login attempt tracking configuration
const LOGIN_CONFIG = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  attemptWindow: 15 * 60 * 1000, // 15 minutes window for counting attempts
};

/**
 * Session Manager Class
 * Handles session creation, validation, and refresh
 */
class SessionManager {
  constructor() {
    this.sessionKey = 'omnimind_session';
    this.lastActivityKey = 'omnimind_last_activity';
    this.deviceIdKey = 'omnimind_device_id';
    this.initDeviceId();
  }

  /**
   * Initialize or retrieve device ID for device fingerprinting
   */
  initDeviceId() {
    let deviceId = localStorage.getItem(this.deviceIdKey);
    if (!deviceId) {
      deviceId = generateSecureToken(16);
      localStorage.setItem(this.deviceIdKey, deviceId);
    }
    return deviceId;
  }

  /**
   * Get the current device ID
   */
  getDeviceId() {
    return localStorage.getItem(this.deviceIdKey) || this.initDeviceId();
  }

  /**
   * Create a new session
   */
  createSession(userId, userEmail) {
    const session = {
      id: generateSecureToken(32),
      userId,
      userEmail,
      deviceId: this.getDeviceId(),
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_CONFIG.maxAge,
      lastActivity: Date.now(),
    };

    sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    this.updateLastActivity();
    
    return session;
  }

  /**
   * Get the current session
   */
  getSession() {
    try {
      const sessionData = sessionStorage.getItem(this.sessionKey);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Validate session
      if (!this.isSessionValid(session)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  /**
   * Check if session is valid
   */
  isSessionValid(session) {
    if (!session) return false;

    const now = Date.now();

    // Check if session has expired
    if (now > session.expiresAt) {
      return false;
    }

    // Check for inactivity timeout
    const lastActivity = parseInt(localStorage.getItem(this.lastActivityKey) || '0', 10);
    if (now - lastActivity > SESSION_CONFIG.inactivityTimeout) {
      return false;
    }

    // Check device ID matches
    if (session.deviceId !== this.getDeviceId()) {
      return false;
    }

    return true;
  }

  /**
   * Check if session needs refresh
   */
  needsRefresh() {
    const session = this.getSession();
    if (!session) return false;

    const timeRemaining = session.expiresAt - Date.now();
    return timeRemaining < SESSION_CONFIG.refreshThreshold;
  }

  /**
   * Refresh the session
   */
  refreshSession() {
    const session = this.getSession();
    if (!session) return null;

    session.expiresAt = Date.now() + SESSION_CONFIG.maxAge;
    session.lastActivity = Date.now();

    sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    this.updateLastActivity();

    return session;
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity() {
    localStorage.setItem(this.lastActivityKey, Date.now().toString());
  }

  /**
   * Clear the session
   */
  clearSession() {
    sessionStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.lastActivityKey);
  }

  /**
   * Get session info for display
   */
  getSessionInfo() {
    const session = this.getSession();
    if (!session) return null;

    return {
      isValid: true,
      expiresIn: Math.max(0, session.expiresAt - Date.now()),
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivity: new Date(parseInt(localStorage.getItem(this.lastActivityKey) || '0', 10)).toISOString(),
    };
  }
}

/**
 * Login Attempt Tracker Class
 * Tracks failed login attempts and implements lockout
 */
class LoginAttemptTracker {
  constructor() {
    this.attemptsKey = 'omnimind_login_attempts';
    this.lockoutKey = 'omnimind_lockout_until';
  }

  /**
   * Get login attempts for an identifier (email or IP)
   */
  getAttempts(identifier) {
    try {
      const attemptsData = localStorage.getItem(this.attemptsKey);
      if (!attemptsData) return [];

      const attempts = JSON.parse(attemptsData);
      const identifierHash = this.hashIdentifier(identifier);
      
      // Filter to only recent attempts within the window
      const now = Date.now();
      return (attempts[identifierHash] || []).filter(
        timestamp => now - timestamp < LOGIN_CONFIG.attemptWindow
      );
    } catch {
      return [];
    }
  }

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(identifier) {
    try {
      const attemptsData = localStorage.getItem(this.attemptsKey);
      const attempts = attemptsData ? JSON.parse(attemptsData) : {};
      const identifierHash = this.hashIdentifier(identifier);

      if (!attempts[identifierHash]) {
        attempts[identifierHash] = [];
      }

      // Add new attempt
      attempts[identifierHash].push(Date.now());

      // Clean up old attempts
      const now = Date.now();
      attempts[identifierHash] = attempts[identifierHash].filter(
        timestamp => now - timestamp < LOGIN_CONFIG.attemptWindow
      );

      localStorage.setItem(this.attemptsKey, JSON.stringify(attempts));

      // Check if lockout should be triggered
      if (attempts[identifierHash].length >= LOGIN_CONFIG.maxAttempts) {
        this.setLockout(identifier);
        return {
          locked: true,
          lockoutUntil: Date.now() + LOGIN_CONFIG.lockoutDuration,
          attempts: attempts[identifierHash].length,
        };
      }

      return {
        locked: false,
        attemptsRemaining: LOGIN_CONFIG.maxAttempts - attempts[identifierHash].length,
        attempts: attempts[identifierHash].length,
      };
    } catch {
      return { locked: false, attemptsRemaining: LOGIN_CONFIG.maxAttempts };
    }
  }

  /**
   * Clear attempts after successful login
   */
  clearAttempts(identifier) {
    try {
      const attemptsData = localStorage.getItem(this.attemptsKey);
      if (!attemptsData) return;

      const attempts = JSON.parse(attemptsData);
      const identifierHash = this.hashIdentifier(identifier);
      
      delete attempts[identifierHash];
      localStorage.setItem(this.attemptsKey, JSON.stringify(attempts));

      // Also clear any lockout
      this.clearLockout(identifier);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Set lockout for an identifier
   */
  setLockout(identifier) {
    try {
      const lockoutData = localStorage.getItem(this.lockoutKey);
      const lockouts = lockoutData ? JSON.parse(lockoutData) : {};
      const identifierHash = this.hashIdentifier(identifier);

      lockouts[identifierHash] = Date.now() + LOGIN_CONFIG.lockoutDuration;
      localStorage.setItem(this.lockoutKey, JSON.stringify(lockouts));
    } catch {
      // Ignore errors
    }
  }

  /**
   * Clear lockout for an identifier
   */
  clearLockout(identifier) {
    try {
      const lockoutData = localStorage.getItem(this.lockoutKey);
      if (!lockoutData) return;

      const lockouts = JSON.parse(lockoutData);
      const identifierHash = this.hashIdentifier(identifier);
      
      delete lockouts[identifierHash];
      localStorage.setItem(this.lockoutKey, JSON.stringify(lockouts));
    } catch {
      // Ignore errors
    }
  }

  /**
   * Check if an identifier is locked out
   */
  isLockedOut(identifier) {
    try {
      const lockoutData = localStorage.getItem(this.lockoutKey);
      if (!lockoutData) return { locked: false };

      const lockouts = JSON.parse(lockoutData);
      const identifierHash = this.hashIdentifier(identifier);
      const lockoutUntil = lockouts[identifierHash];

      if (!lockoutUntil) return { locked: false };

      const now = Date.now();
      if (now < lockoutUntil) {
        return {
          locked: true,
          lockoutUntil,
          remainingTime: lockoutUntil - now,
        };
      }

      // Lockout has expired, clear it
      this.clearLockout(identifier);
      return { locked: false };
    } catch {
      return { locked: false };
    }
  }

  /**
   * Hash identifier for storage (privacy)
   */
  hashIdentifier(identifier) {
    // Simple hash for client-side storage
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

/**
 * Security Event Logger
 * Logs security-related events for monitoring
 */
class SecurityEventLogger {
  constructor() {
    this.eventsKey = 'omnimind_security_events';
    this.maxEvents = 100;
  }

  /**
   * Log a security event
   */
  logEvent(eventType, details = {}) {
    try {
      const eventsData = localStorage.getItem(this.eventsKey);
      const events = eventsData ? JSON.parse(eventsData) : [];

      const event = {
        type: eventType,
        timestamp: Date.now(),
        details: {
          ...details,
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      };

      events.unshift(event);

      // Keep only the most recent events
      const trimmedEvents = events.slice(0, this.maxEvents);
      localStorage.setItem(this.eventsKey, JSON.stringify(trimmedEvents));

      // Log to console in development
      if (import.meta.env.MODE === 'development') {
        if (import.meta.env.DEV) {
        console.log('[Security Event]', eventType, details);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Get recent security events
   */
  getRecentEvents(count = 10) {
    try {
      const eventsData = localStorage.getItem(this.eventsKey);
      if (!eventsData) return [];

      const events = JSON.parse(eventsData);
      return events.slice(0, count);
    } catch {
      return [];
    }
  }

  /**
   * Clear all security events
   */
  clearEvents() {
    localStorage.removeItem(this.eventsKey);
  }
}

// Export singleton instances
export const sessionManager = new SessionManager();
export const loginAttemptTracker = new LoginAttemptTracker();
export const securityEventLogger = new SecurityEventLogger();

// Export configuration for reference
export const AUTH_CONFIG = {
  session: SESSION_CONFIG,
  login: LOGIN_CONFIG,
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if the current session is about to expire
 */
export const isSessionExpiringSoon = () => {
  return sessionManager.needsRefresh();
};

/**
 * Format remaining lockout time for display
 */
export const formatLockoutTime = (milliseconds) => {
  const minutes = Math.ceil(milliseconds / 60000);
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
};

/**
 * Get security status summary
 */
export const getSecurityStatus = () => {
  const session = sessionManager.getSessionInfo();
  const recentEvents = securityEventLogger.getRecentEvents(5);

  return {
    hasActiveSession: !!session,
    sessionInfo: session,
    recentSecurityEvents: recentEvents,
    deviceId: sessionManager.getDeviceId(),
  };
};
