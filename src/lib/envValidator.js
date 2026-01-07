/**
 * Environment Variables Validation
 * 
 * This module validates required environment variables at runtime
 * using Zod schema validation for type safety.
 * 
 * In demo/preview mode, validation is relaxed to allow the app to run
 * without all production environment variables.
 */

import { z } from 'zod';

// Check if we're in demo/preview mode
const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === 'true' || 
         import.meta.env.VITE_ENV === 'demo' ||
         !import.meta.env.VITE_BASE44_PROJECT_ID ||
         import.meta.env.VITE_BASE44_PROJECT_ID === 'your_project_id_here';
};

/**
 * Environment variable schema using Zod
 */
const envSchema = z.object({
  // Required Base44 Configuration
  VITE_BASE44_APP_ID: z.string().min(1, 'Base44 App ID is required'),
  VITE_BASE44_PROJECT_ID: z.string().min(1, 'Base44 Project ID is required'),
  VITE_BASE44_API_URL: z.string().url('Base44 API URL must be a valid URL'),
  
  // Required Stripe Configuration
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe publishable key is required').startsWith('pk_', 'Invalid Stripe key format'),
  
  // Required API Configuration
  VITE_API_BASE_URL: z.string().url('API Base URL must be a valid URL'),
  
  // Required Google OAuth
  VITE_GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  
  // Optional but recommended for production
  VITE_SENTRY_DSN: z.string().url('Sentry DSN must be a valid URL').optional().or(z.literal('')),
  
  // Optional AI API Keys
  VITE_OPENAI_API_KEY: z.string().optional().or(z.literal('')),
  VITE_ANTHROPIC_API_KEY: z.string().optional().or(z.literal('')),
  VITE_GOOGLE_AI_API_KEY: z.string().optional().or(z.literal('')),
  
  // Environment
  VITE_ENV: z.enum(['development', 'production', 'staging', 'demo']).optional(),
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: z.string().optional(),
  VITE_ENABLE_DEBUG: z.string().optional(),
  VITE_DEMO_MODE: z.string().optional(),
});

/**
 * Demo mode schema - relaxed validation
 */
const demoEnvSchema = z.object({
  VITE_BASE44_APP_ID: z.string().optional(),
  VITE_BASE44_PROJECT_ID: z.string().optional(),
  VITE_BASE44_API_URL: z.string().optional(),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  VITE_API_BASE_URL: z.string().optional(),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),
});

/**
 * Production-specific warnings
 */
const productionWarnings = (env) => {
  const warnings = [];
  
  if (env.VITE_ENV === 'production') {
    if (!env.VITE_SENTRY_DSN) {
      warnings.push('⚠️  VITE_SENTRY_DSN is not set. Error tracking will be disabled in production.');
    }
    
    if (!env.VITE_OPENAI_API_KEY && !env.VITE_ANTHROPIC_API_KEY && !env.VITE_GOOGLE_AI_API_KEY) {
      warnings.push('⚠️  No AI API keys configured. AI features will be disabled.');
    }
    
    if (env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
      warnings.push('⚠️  Using Stripe TEST key in production environment!');
    }
  }
  
  return warnings;
};

/**
 * Validate environment variables
 * 
 * @throws {Error} If required variables are missing or invalid (in production mode)
 * @returns {object} Validated environment variables
 */
export const validateEnv = () => {
  // In demo mode, use relaxed validation
  if (isDemoMode()) {
    if (import.meta.env.DEV) {
    console.log('🎭 Running in DEMO/PREVIEW mode - using mock data');
    }
    if (import.meta.env.DEV) {
    console.log('✅ Environment validation skipped for demo mode');
    }
    return demoEnvSchema.parse(import.meta.env);
  }

  try {
    // Parse and validate environment variables
    const env = envSchema.parse(import.meta.env);
    
    // Check for production-specific warnings
    const warnings = productionWarnings(env);
    if (warnings.length > 0) {
      console.warn('Environment Configuration Warnings:');
      warnings.forEach(warning => console.warn(warning));
    }
    
    if (import.meta.env.DEV) {
    console.log('✅ Environment variables validated successfully');
    }
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error('\nMissing or invalid environment variables:');
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  • ${path}: ${err.message}`);
      });
      
      console.error('\nPlease check your .env file and ensure all required variables are set.');
      console.error('See .env.example for reference.\n');
      
      throw new Error('Environment validation failed. Check console for details.');
    }
    throw error;
  }
};

/**
 * Get a validated environment variable
 * Use this instead of accessing import.meta.env directly for type safety
 */
export const getEnv = (key) => {
  const value = import.meta.env[key];
  if (value === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return value;
};

/**
 * Check if we're in production
 */
export const isProduction = () => {
  return import.meta.env.PROD || import.meta.env.VITE_ENV === 'production';
};

/**
 * Check if we're in development
 */
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.VITE_ENV === 'development';
};

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = (featureName) => {
  const value = import.meta.env[`VITE_ENABLE_${featureName.toUpperCase()}`];
  return value === 'true' || value === '1';
};

/**
 * Export demo mode check
 */
export { isDemoMode };
