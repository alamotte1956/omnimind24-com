import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { Loader2 } from 'lucide-react';

/**
 * OnboardingGuard - Ensures users complete onboarding (COSTAR)
 * 
 * TODO: Backend API needed:
 * - GET /api/auth/me - Should return user with costar_completed flag
 */
export default function OnboardingGuard({ children }) {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.auth.me()
  });

  useEffect(() => {
    if (!isLoading && user) {
      // Everyone must complete COSTAR - no exceptions
      if (!user.costar_completed) {
        navigate('/Onboarding');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}