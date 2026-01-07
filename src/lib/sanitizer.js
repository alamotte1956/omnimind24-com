/**
 * Input sanitization utilities to prevent XSS and injection attacks
 * 
 * SECURITY NOTE: This module provides defense-in-depth sanitization.
 * Always sanitize user input and AI-generated content before rendering.
 */

import { useState, useCallback } from 'react';

// HTML entity encoding map for XSS prevention
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Encode HTML entities to prevent XSS attacks
 * This is the safest approach for rendering untrusted content
 */
export const encodeHTMLEntities = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char]);
};

// HTML sanitization using a simple whitelist approach
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return '';
  
  // Basic HTML tag whitelist
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
  ];
  
  let sanitized = html;
  
  // Remove script tags and their content entirely
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove all event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  sanitized = sanitized.replace(/data\s*:/gi, '');
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');
  
  // Remove all HTML tags except allowed ones
  sanitized = sanitized.replace(/<\/?([^>]+)>/gi, (match, tag) => {
    const tagName = tag.split(/\s/)[0].toLowerCase();
    // Only allow simple tags without attributes for safety
    if (allowedTags.includes(tagName)) {
      const isClosing = match.startsWith('</');
      return isClosing ? `</${tagName}>` : `<${tagName}>`;
    }
    return '';
  });
  
  return sanitized;
};

/**
 * Sanitize text input to prevent XSS
 * This function removes potentially dangerous characters and patterns
 * Use this for plain text content that should not contain HTML
 */
export const sanitizeText = (text, maxLength = 1000) => {
  if (typeof text !== 'string') return '';
  
  return text
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove HTML tags entirely (encode < and >)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Remove javascript protocol (various encodings)
    .replace(/javascript\s*:/gi, '')
    .replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '')
    // Remove data protocol
    .replace(/data\s*:/gi, '')
    // Remove vbscript protocol
    .replace(/vbscript\s*:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove expression() CSS hack
    .replace(/expression\s*\(/gi, '')
    // Limit length
    .substring(0, maxLength);
};

/**
 * Strictly sanitize for display - encodes all HTML entities
 * Use this when you want to display text exactly as entered
 */
export const sanitizeForDisplay = (text, maxLength = 10000) => {
  if (typeof text !== 'string') return '';
  return encodeHTMLEntities(text).substring(0, maxLength);
};

// Sanitize URLs to prevent malicious URLs
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') return '';
  
  // Trim whitespace
  const trimmed = url.trim();
  
  // Check for dangerous protocols first (before URL parsing)
  const lowerUrl = trimmed.toLowerCase();
  if (lowerUrl.startsWith('javascript:') || 
      lowerUrl.startsWith('data:') || 
      lowerUrl.startsWith('vbscript:')) {
    return '';
  }
  
  try {
    const parsed = new URL(trimmed);
    // Only allow http, https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      // Allow relative URLs
      if (!trimmed.startsWith('/')) {
        return '';
      }
    }
    
    return trimmed;
  } catch {
    // If URL parsing fails, check if it's a valid relative URL
    if (trimmed.startsWith('/') && !trimmed.includes('//')) {
      return trimmed;
    }
    return '';
  }
};

// Sanitize filenames
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return '';
  
  return filename
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    // Keep only safe characters
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Collapse multiple underscores
    .replace(/_{2,}/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '')
    // Limit length
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

/**
 * Sanitize object keys to prevent prototype pollution
 */
export const sanitizeObjectKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  const sanitized = {};
  
  for (const key of Object.keys(obj)) {
    if (!dangerousKeys.includes(key)) {
      sanitized[key] = typeof obj[key] === 'object' 
        ? sanitizeObjectKeys(obj[key]) 
        : obj[key];
    }
  }
  
  return sanitized;
};

/**
 * Sanitize SQL-like input to prevent injection
 * Note: This is a client-side helper; always use parameterized queries on the server
 */
export const sanitizeSQLInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .substring(0, 1000);
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
    case 'display':
      return sanitizeForDisplay(input, maxLength);
    case 'sql':
      return sanitizeSQLInput(input);
    default:
      return sanitizeText(input, maxLength);
  }
};

// React Hook for sanitizing input
export const useSanitizedInput = (initialValue, options = {}) => {
  const [value, setValue] = useState(() => sanitize(initialValue, options));
  
  const setSanitizedValue = useCallback((newValue) => {
    setValue(sanitize(newValue, options));
  }, [options]);
  
  return [value, setSanitizedValue];
};

/**
 * Validate and sanitize credit card number format (for display only)
 * Never store or transmit raw card numbers - use Stripe/payment processor
 */
export const sanitizeCardNumber = (cardNumber) => {
  if (typeof cardNumber !== 'string') return '';
  
  // Remove all non-digits
  const digits = cardNumber.replace(/\D/g, '');
  
  // Return only last 4 digits for display
  if (digits.length >= 4) {
    return `****${digits.slice(-4)}`;
  }
  
  return '';
};
