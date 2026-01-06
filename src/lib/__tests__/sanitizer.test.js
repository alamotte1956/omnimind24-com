/**
 * Tests for input sanitization utilities
 */

import { describe, it, expect } from 'vitest'
import {
  encodeHTMLEntities,
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeEmail,
  sanitizeFilename,
  sanitizeApiKey,
  sanitizeObjectKeys,
} from '../sanitizer'

describe('sanitizer', () => {
  describe('encodeHTMLEntities', () => {
    it('should encode HTML entities', () => {
      const input = '<script>alert("xss")</script>'
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      expect(encodeHTMLEntities(input)).toBe(expected)
    })

    it('should handle empty string', () => {
      expect(encodeHTMLEntities('')).toBe('')
    })

    it('should return empty string for non-string input', () => {
      expect(encodeHTMLEntities(null)).toBe('')
      expect(encodeHTMLEntities(undefined)).toBe('')
      expect(encodeHTMLEntities(123)).toBe('')
    })
  })

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>')
    })

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click</div>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('onclick')
    })

    it('should remove dangerous protocols', () => {
      const input = '<a href="javascript:alert(1)">Link</a>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('javascript:')
    })

    it('should allow safe tags', () => {
      const input = '<p>Hello <strong>world</strong></p>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })
  })

  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      const input = '<p>Hello</p>'
      const result = sanitizeText(input)
      expect(result).not.toContain('<p>')
      expect(result).toContain('Hello')
    })

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert(1)'
      const result = sanitizeText(input)
      expect(result).not.toContain('javascript:')
    })

    it('should limit length', () => {
      const input = 'a'.repeat(2000)
      const result = sanitizeText(input, 100)
      expect(result.length).toBe(100)
    })
  })

  describe('sanitizeURL', () => {
    it('should allow http URLs', () => {
      const url = 'http://example.com'
      expect(sanitizeURL(url)).toBe(url)
    })

    it('should allow https URLs', () => {
      const url = 'https://example.com'
      expect(sanitizeURL(url)).toBe(url)
    })

    it('should block javascript protocol', () => {
      const url = 'javascript:alert(1)'
      expect(sanitizeURL(url)).toBe('')
    })

    it('should block data protocol', () => {
      const url = 'data:text/html,<script>alert(1)</script>'
      expect(sanitizeURL(url)).toBe('')
    })

    it('should allow relative URLs', () => {
      const url = '/path/to/page'
      expect(sanitizeURL(url)).toBe(url)
    })
  })

  describe('sanitizeEmail', () => {
    it('should validate and sanitize email', () => {
      const email = '  TEST@EXAMPLE.COM  '
      expect(sanitizeEmail(email)).toBe('test@example.com')
    })

    it('should return empty string for invalid email', () => {
      expect(sanitizeEmail('not-an-email')).toBe('')
      expect(sanitizeEmail('test@')).toBe('')
      expect(sanitizeEmail('@example.com')).toBe('')
    })

    it('should limit length', () => {
      const longEmail = 'a'.repeat(300) + '@example.com'
      const result = sanitizeEmail(longEmail)
      expect(result.length).toBeLessThanOrEqual(254)
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove path traversal attempts', () => {
      const filename = '../../../etc/passwd'
      const result = sanitizeFilename(filename)
      expect(result).not.toContain('..')
    })

    it('should keep only safe characters', () => {
      const filename = 'file<name>.txt'
      const result = sanitizeFilename(filename)
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should allow valid filenames', () => {
      const filename = 'my-file_123.txt'
      expect(sanitizeFilename(filename)).toBe(filename)
    })
  })

  describe('sanitizeApiKey', () => {
    it('should remove invalid characters', () => {
      const key = 'sk-test<script>alert(1)</script>123'
      const result = sanitizeApiKey(key)
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).toContain('sk-test')
    })

    it('should limit length', () => {
      const key = 'a'.repeat(1000)
      const result = sanitizeApiKey(key)
      expect(result.length).toBe(500)
    })
  })

  describe('sanitizeObjectKeys', () => {
    it('should remove dangerous keys', () => {
      const obj = {
        __proto__: { admin: true },
        constructor: { admin: true },
        prototype: { admin: true },
        normalKey: 'value'
      }
      const result = sanitizeObjectKeys(obj)
      expect(result).not.toHaveProperty('__proto__')
      expect(result).not.toHaveProperty('constructor')
      expect(result).not.toHaveProperty('prototype')
      expect(result).toHaveProperty('normalKey')
    })

    it('should handle nested objects', () => {
      const obj = {
        level1: {
          __proto__: { admin: true },
          safeKey: 'value'
        }
      }
      const result = sanitizeObjectKeys(obj)
      expect(result.level1).not.toHaveProperty('__proto__')
      expect(result.level1).toHaveProperty('safeKey')
    })
  })
})
