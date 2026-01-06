import React from 'react';

/**
 * Centralized error handling utilities with Sentry integration
 */

// Initialize Sentry if in production and DSN is configured
let Sentry = null;
if (typeof window !== 'undefined' && import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  import('@sentry/react').then((SentryModule) => {
    Sentry = SentryModule;
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    });
  }).catch((err) => {
    console.error('Failed to initialize Sentry:', err);
  });
}

// Error types for better categorization
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN'
};

// Map HTTP status codes to error types
const getErrorType = (error) => {
  if (!error.response) {
    return ErrorTypes.NETWORK;
  }
  
  const status = error.response.status;
  
  if (status === 401) return ErrorTypes.AUTHENTICATION;
  if (status === 403) return ErrorTypes.AUTHORIZATION;
  if (status >= 400 && status < 500) return ErrorTypes.VALIDATION;
  if (status >= 500) return ErrorTypes.SERVER;
  
  return ErrorTypes.UNKNOWN;
};

// Sanitize error messages to prevent information leakage
const sanitizeErrorMessage = (error, errorType) => {
  // Don't expose sensitive server error details to users
  if (errorType === ErrorTypes.SERVER) {
    return 'A server error occurred. Please try again later.';
  }
  
  // Sanitize network errors
  if (errorType === ErrorTypes.NETWORK) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  // For validation errors, be more specific but still safe
  if (errorType === ErrorTypes.VALIDATION) {
    if (error.response?.data?.message) {
      // Limit length and remove potential sensitive info
      return error.response.data.message.substring(0, 100);
    }
    return 'Invalid data provided. Please check your input.';
  }
  
  // Generic fallback
  return 'An error occurred. Please try again.';
};

// Main error handler function
export const handleError = (error, context = '') => {
  const errorType = getErrorType(error);
  const sanitizedMessage = sanitizeErrorMessage(error, errorType);
  
  // Log to console in development, Sentry in production
  if (import.meta.env.DEV) {
    console.error(`[${errorType}] ${context}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
  }
  
  // Send to Sentry in production if available
  if (Sentry && import.meta.env.PROD) {
    Sentry.captureException(error, {
      tags: {
        errorType,
        context,
      },
      extra: {
        status: error.response?.status,
        data: error.response?.data,
      },
    });
  } else {
    // Fallback to console.error if Sentry not available
    console.error(`[${errorType}] ${context}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
  }
  
  // Return user-friendly error info
  return {
    type: errorType,
    message: sanitizedMessage,
    originalError: error // Keep original for debugging if needed
  };
};

// Toast error helper
export const showErrorToast = (error, context = '', toastFunction) => {
  const errorInfo = handleError(error, context);
  
  if (toastFunction) {
    toastFunction.error(errorInfo.message, {
      description: errorInfo.type === ErrorTypes.NETWORK ? 'Check your connection' : undefined
    });
  }
  
  return errorInfo;
};

// Async error boundary wrapper
export const withErrorHandling = (asyncFn, context) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const errorInfo = handleError(error, context);
      throw errorInfo; // Re-throw sanitized error
    }
  };
};

// React error fallback component
export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const errorInfo = error.originalError ? handleError(error.originalError) : error;
  
  return React.createElement('div', { className: "min-h-[400px] flex items-center justify-center bg-[#0D0D0D]" }, 
    React.createElement('div', { className: "text-center max-w-md p-6" }, [
      React.createElement('div', { 
        key: 'icon',
        className: "w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4" 
      }, 
        React.createElement('svg', { 
          className: "w-8 h-8 text-red-500", 
          fill: "none", 
          stroke: "currentColor", 
          viewBox: "0 0 24 24" 
        },
          React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
          })
        )
      ),
      
      React.createElement('h2', { 
        key: 'title',
        className: "text-xl font-semibold text-white mb-2" 
      }, 'Something went wrong'),
      
      React.createElement('p', { 
        key: 'message',
        className: "text-gray-400 mb-6" 
      }, errorInfo.message),
      
      React.createElement('button', {
        key: 'button',
        onClick: resetErrorBoundary,
        className: "bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
      }, 'Try again'),
      
      React.createElement('div', { 
        key: 'errorId',
        className: "mt-4 text-xs text-gray-500" 
      }, `Error ID: ${Date.now().toString(36)}`)
    ])
  );
};

// API error handler for Base44 operations
export const handleBase44Error = (error, operation) => {
  // Specific handling for Base44 authentication errors
  if (error.message?.includes('auth') || error.response?.status === 401) {
    // Redirect to login if needed
    if (typeof window !== 'undefined' && window.base44) {
      window.base44.auth.redirectToLogin();
    }
  }
  
  return handleError(error, `Base44 ${operation}`);
};

// Form validation error handler
export const handleValidationError = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(err => err.message || err).join(', ');
  }
  
  if (typeof errors === 'object') {
    return Object.values(errors).flat().join(', ');
  }
  
  return 'Validation failed. Please check your input.';
};

// Retry mechanism for failed requests
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};