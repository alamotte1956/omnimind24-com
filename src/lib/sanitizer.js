/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

// HTML sanitization using a simple whitelist approach
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return '';
  
  // Basic HTML tag whitelist
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
  ];
  
  // Remove all HTML tags except allowed ones
  return html.replace(/<\/?([^>]+)>/gi, (match, tag) => {
    const tagName = tag.split(' ')[0].toLowerCase();
    return allowedTags.includes(tagName) ? match : '';
  });
};

// Sanitize text input to prevent XSS
export const sanitizeText = (text, maxLength = 1000) => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, maxLength);
};

// Sanitize URLs to prevent malicious URLs
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http, https, and relative protocols
    if (!['http:', 'https:'].includes(parsed.protocol) && !url.startsWith('/')) {
      return '';
    }
    
    // Remove javascript: and data: URLs
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      return '';
    }
    
    return url;
  } catch {
    return '';
  }
};

// Sanitize filenames
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

// Sanitize JSON input to prevent injection
export const sanitizeJSON = (jsonString) => {
  if (typeof jsonString !== 'string') return '{}';
  
  try {
    // Try to parse and re-stringify to ensure valid JSON
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
};

// Sanitize API keys and secrets (keep only valid characters)
export const sanitizeApiKey = (key) => {
  if (typeof key !== 'string') return '';
  
  return key.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 500);
};

// Email sanitization
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = email.toLowerCase().trim().substring(0, 254);
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

// Phone number sanitization
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return '';
  
  return phone.replace(/[^\d+\-\s()]/g, '').substring(0, 20);
};

// General purpose sanitizer
export const sanitize = (input, options = {}) => {
  const {
    type = 'text',
    maxLength = 1000,
    allowHTML = false,
    ...rest
  } = options;
  
  switch (type) {
    case 'html':
      return allowHTML ? sanitizeHTML(input) : sanitizeText(input, maxLength);
    case 'url':
      return sanitizeURL(input);
    case 'filename':
      return sanitizeFilename(input);
    case 'email':
      return sanitizeEmail(input);
    case 'phone':
      return sanitizePhone(input);
    case 'apikey':
      return sanitizeApiKey(input);
    case 'json':
      return sanitizeJSON(input);
    default:
      return sanitizeText(input, maxLength);
  }
};

// React Hook for sanitizing input
export const useSanitizedInput = (initialValue, options = {}) => {
  const [value, setValue] = React.useState(() => sanitize(initialValue, options));
  
  const setSanitizedValue = React.useCallback((newValue) => {
    setValue(sanitize(newValue, options));
  }, [options]);
  
  return [value, setSanitizedValue];
};