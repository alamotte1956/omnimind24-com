import React, { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Shield } from 'lucide-react';
import { handleError, withErrorHandling } from '@/lib/errorHandler';
import { sessionManager, securityEventLogger } from '@/lib/authUtils';
import SessionManager from './SessionManager';

/**
 * Enhanced AuthGuard Component
 * 
 * Provides authentication protection with:
 * - Session management and timeout handling
 * - Security event logging
 * - Automatic session refresh
 * - Graceful error handling
 */
export default function AuthGuard({ children }) {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: withErrorHandling(async () => {
      try {
        const userData = await base44.auth.me();
        if (!userData) {
          throw new Error('No user data received');
        }
        
        // Create or refresh session on successful auth
        const existingSession = sessionManager.getSession();
        if (!existingSession) {
          sessionManager.createSession(userData.id, userData.email);
          securityEventLogger.logEvent('session_created', { 
            userId: userData.id 
          });
        } else {
          // Update activity timestamp
          sessionManager.updateLastActivity();
        }
        
        return userData;
      } catch (err) {
        // Handle authentication errors gracefully
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Clear any stored auth data and session
          if (typeof window !== 'undefined') {
            localStorage.removeItem('base44_token');
            sessionManager.clearSession();
          }
          securityEventLogger.logEvent('auth_failed', { 
            status: err.response?.status,
            reason: 'Invalid or expired token'
          });
        }
        throw err;
      }
    }, 'user-authentication'),
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Max 2 retries for other errors
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Handle session validation
  const validateSession = useCallback(() => {
    const session = sessionManager.getSession();
    if (!session && user) {
      // Session expired but user data still cached - refetch
      securityEventLogger.logEvent('session_validation_failed');
      refetch();
    }
  }, [user, refetch]);

  // Check session on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [validateSession]);

  // Handle authentication errors
  useEffect(() => {
    if (error || (!isLoading && !user)) {
      // Log error for debugging
      if (error) {
        const errorInfo = handleError(error, 'Authentication check');
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth error:', errorInfo);
        }
        securityEventLogger.logEvent('auth_error', { 
          message: errorInfo.message,
          type: errorInfo.type
        });
      }
      
      // Clear session before redirect
      sessionManager.clearSession();
      
      // Redirect to login with current path as redirect
      const currentPath = window.location.pathname + window.location.search;
      base44.auth.redirectToLogin(currentPath);
    }
  }, [error, isLoading, user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <Shield className="w-5 h-5 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-400 font-medium">Authenticating...</p>
          <p className="text-xs text-gray-500 mt-2">
            Please wait while we verify your session
          </p>
        </div>
      </div>
    );
  }

  // No user - will redirect via useEffect
  if (!user) {
    return null;
  }

  // Wrap children with SessionManager for session timeout handling
  return (
    <SessionManager>
      {children}
    </SessionManager>
  );
}
