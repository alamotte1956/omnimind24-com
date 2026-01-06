import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function OnboardingGuard({ children }) {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    // In demo mode, skip onboarding redirect
    // Demo users have costar_completed set or we skip the check
    if (!isLoading && user && !user.costar_completed) {
      // Only redirect if not in demo mode (demo user has id starting with 'demo')
      if (!user.id?.startsWith('demo')) {
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
