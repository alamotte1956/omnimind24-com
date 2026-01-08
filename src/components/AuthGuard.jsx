import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { handleError, withErrorHandling } from '@/lib/errorHandler';

export default function AuthGuard({ children }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: withErrorHandling(async () => {
      try {
        const userData = await base44.auth.me();
        if (!userData) {
          throw new Error('No user data received');
        }
        return userData;
      } catch (err) {
        // Handle authentication errors gracefully
        if (err.response?.status === 401) {
          // Clear any stored auth data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('base44_token');
          }
        }
        throw err;
      }
    }, 'user-authentication'),
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401 || error?.status === 401) return false;
      if (error?.type === 'AUTHENTICATION') return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (error || (!isLoading && !user)) {
      // Log error for debugging
      if (error) {
        const errorInfo = handleError(error, 'Authentication check');
        console.error('Auth error:', errorInfo);
      }
      
      // Redirect to login with current path as redirect
      const currentPath = window.location.pathname + window.location.search;
      base44.auth.redirectToLogin(currentPath);
    }
  }, [error, isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Authenticating...</p>
          <p className="text-xs text-gray-500 mt-2">Please wait while we verify your session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}