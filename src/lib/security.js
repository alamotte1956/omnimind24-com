/**
 * Security utilities for the OmniMind24 application
 * 
 * This module provides various security-related helper functions
 * for authentication, CSRF protection, and secure data handling.
 */

/**
 * Generate a cryptographically secure random token
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {string} Hex-encoded random token
 */
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate and store a CSRF token for form submissions
 * @returns {string} The generated CSRF token
 */
export const generateCSRFToken = () => {
  const token = generateSecureToken(32);
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Validate a CSRF token against the stored token
 * @param {string} token - The token to validate
 * @returns {boolean} Whether the token is valid
 */
export const validateCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  if (!storedToken || !token) return false;
  
  // Use constant-time comparison to prevent timing attacks
  if (storedToken.length !== token.length) return false;
  
  let result = 0;
  for (let i = 0; i < storedToken.length; i++) {
    result |= storedToken.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return result === 0;
};

/**
 * Get the current CSRF token or generate a new one
 * @returns {string} The CSRF token
 */
export const getCSRFToken = () => {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = generateCSRFToken();
  }
  return token;
};

/**
 * Securely compare two strings in constant time
 * Prevents timing attacks when comparing sensitive values
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} Whether the strings are equal
 */
export const secureCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

/**
 * Hash a string using SHA-256 (for non-sensitive data fingerprinting)
 * @param {string} str - String to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Check if the current connection is secure (HTTPS)
 * @returns {boolean} Whether the connection is secure
 */
export const isSecureConnection = () => {
  return window.location.protocol === 'https:' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (!password || typeof password !== 'string') {
    result.feedback.push('Password is required');
    return result;
  }

  // Length check
  if (password.length >= 8) {
    result.score += 1;
  } else {
    result.feedback.push('Password must be at least 8 characters');
  }

  if (password.length >= 12) {
    result.score += 1;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Add uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Add lowercase letters');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Add numbers');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Add special characters');
  }

  // Common password patterns check
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /^letmein/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    result.score = Math.max(0, result.score - 2);
    result.feedback.push('Avoid common password patterns');
  }

  result.isValid = result.score >= 4;
  return result;
};

/**
 * Mask sensitive data for display
 * @param {string} data - Data to mask
 * @param {number} visibleStart - Number of characters to show at start
 * @param {number} visibleEnd - Number of characters to show at end
 * @returns {string} Masked data
 */
export const maskSensitiveData = (data, visibleStart = 4, visibleEnd = 4) => {
  if (!data || typeof data !== 'string') return '';
  if (data.length <= visibleStart + visibleEnd) return '****';
  
  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const maskLength = Math.min(8, data.length - visibleStart - visibleEnd);
  
  return `${start}${'*'.repeat(maskLength)}${end}`;
};

/**
 * Check if a URL is from a trusted domain
 * @param {string} url - URL to check
 * @param {string[]} trustedDomains - List of trusted domains
 * @returns {boolean} Whether the URL is from a trusted domain
 */
export const isTrustedURL = (url, trustedDomains = []) => {
  const defaultTrusted = [
    'omnimind24.com',
    'base44.io',
    'stripe.com',
    'js.stripe.com'
  ];
  
  const allTrusted = [...defaultTrusted, ...trustedDomains];
  
  try {
    const parsed = new URL(url);
    return allTrusted.some(domain => 
      parsed.hostname === domain || 
      parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

/**
 * Detect potential XSS patterns in a string
 * @param {string} input - String to check
 * @returns {boolean} Whether potential XSS was detected
 */
export const detectXSS = (input) => {
  if (!input || typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /vbscript:/i,
    /expression\s*\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<svg.*onload/i
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Rate limiter for client-side operations
 */
export class ClientRateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if a request is allowed
   * @returns {boolean} Whether the request is allowed
   */
  isAllowed() {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  /**
   * Get remaining requests in the current window
   * @returns {number} Number of remaining requests
   */
  getRemaining() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  /**
   * Get time until the window resets
   * @returns {number} Milliseconds until reset
   */
  getResetTime() {
    if (this.requests.length === 0) return 0;
    const oldest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }
}

// Export a default rate limiter for general use
export const defaultRateLimiter = new ClientRateLimiter(30, 60000); // 30 requests per minute
