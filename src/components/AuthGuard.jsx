import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
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
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401) return false;
      return failureCount < 2; // Max 2 retries for other errors
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    // In demo mode, we always have a user, so no redirect needed
    if (error && !user && !isLoading) {
      // Log error for debugging
      console.error('Auth error:', error);
      
      // Only redirect if we're not in demo mode
      // The mock client will always return a user, so this shouldn't trigger
      const currentPath = window.location.pathname + window.location.search;
      base44.auth.redirectToLogin(currentPath);
    }
  }, [error, isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
          <p className="text-xs text-gray-500 mt-2">Please wait while we set up your session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // In demo mode, this shouldn't happen, but just in case
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
        <div className="text-center">
          <p className="text-gray-400">Setting up demo mode...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
