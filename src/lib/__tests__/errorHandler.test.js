/**
 * Tests for error handler utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ErrorTypes,
  handleError,
  handleValidationError,
  withRetry,
} from '../errorHandler'

describe('errorHandler', () => {
  beforeEach(() => {
    // Clear console mocks
    vi.clearAllMocks()
  })

  describe('handleError', () => {
    it('should identify network errors', () => {
      const error = new Error('Network error')
      const result = handleError(error, 'test')
      expect(result.type).toBe(ErrorTypes.NETWORK)
    })

    it('should identify authentication errors', () => {
      const error = {
        response: { status: 401, data: {} },
        message: 'Unauthorized'
      }
      const result = handleError(error, 'test')
      expect(result.type).toBe(ErrorTypes.AUTHENTICATION)
    })

    it('should identify authorization errors', () => {
      const error = {
        response: { status: 403, data: {} },
        message: 'Forbidden'
      }
      const result = handleError(error, 'test')
      expect(result.type).toBe(ErrorTypes.AUTHORIZATION)
    })

    it('should identify validation errors', () => {
      const error = {
        response: { status: 400, data: {} },
        message: 'Bad request'
      }
      const result = handleError(error, 'test')
      expect(result.type).toBe(ErrorTypes.VALIDATION)
    })

    it('should identify server errors', () => {
      const error = {
        response: { status: 500, data: {} },
        message: 'Internal server error'
      }
      const result = handleError(error, 'test')
      expect(result.type).toBe(ErrorTypes.SERVER)
    })

    it('should sanitize server error messages', () => {
      const error = {
        response: { status: 500, data: { message: 'Database connection failed at host 192.168.1.1' } },
        message: 'Server error'
      }
      const result = handleError(error, 'test')
      expect(result.message).toBe('A server error occurred. Please try again later.')
    })

    it('should include original error for debugging', () => {
      const error = new Error('Test error')
      const result = handleError(error, 'test')
      expect(result.originalError).toBe(error)
    })
  })

  describe('handleValidationError', () => {
    it('should handle array of errors', () => {
      const errors = [
        { message: 'Field is required' },
        { message: 'Invalid format' }
      ]
      const result = handleValidationError(errors)
      expect(result).toContain('Field is required')
      expect(result).toContain('Invalid format')
    })

    it('should handle object of errors', () => {
      const errors = {
        email: ['Invalid email'],
        password: ['Too short']
      }
      const result = handleValidationError(errors)
      expect(result).toContain('Invalid email')
      expect(result).toContain('Too short')
    })

    it('should return generic message for unknown format', () => {
      const result = handleValidationError('unknown')
      expect(result).toBe('Validation failed. Please check your input.')
    })
  })

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await withRetry(fn, 3, 10)
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success')
      
      const result = await withRetry(fn, 3, 10)
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should not retry on authentication errors', async () => {
      const error = {
        response: { status: 401 },
        message: 'Unauthorized'
      }
      const fn = vi.fn().mockRejectedValue(error)
      
      await expect(withRetry(fn, 3, 10)).rejects.toEqual(error)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should throw last error after max retries', async () => {
      const error = new Error('Persistent error')
      const fn = vi.fn().mockRejectedValue(error)
      
      await expect(withRetry(fn, 3, 10)).rejects.toThrow('Persistent error')
      expect(fn).toHaveBeenCalledTimes(3)
    })
  })
})
