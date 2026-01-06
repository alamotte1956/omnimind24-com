/**
 * Test setup file for Vitest
 * This file runs before all tests
 */

import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables for tests
import.meta.env.VITE_BASE44_PROJECT_ID = 'test-project-id'
import.meta.env.VITE_BASE44_API_URL = 'https://api.base44.com'
import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'
import.meta.env.VITE_API_BASE_URL = 'https://test.base44.com'
import.meta.env.VITE_GOOGLE_CLIENT_ID = 'test-google-client-id'
import.meta.env.VITE_ENV = 'development'
