import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

export default function CreditMonitor() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.auth.me()
  });

  const isStaffOrAdmin = user?.access_level === 'staff' || user?.access_level === 'admin';

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const userCredits = await apiClient.entities.Credit.filter({ created_by: user.email });
      return userCredits[0] || null;
    },
    enabled: !!user && !isStaffOrAdmin,
    refetchInterval: 30000 // Check every 30 seconds
  });

  const { data: autoPurchase } = useQuery({
    queryKey: ['auto-purchase', user?.id],
    queryFn: async () => {
      const purchases = await apiClient.entities.AutoPurchase.filter({ 
        created_by: user.email,
        is_active: true 
      });
      return purchases[0] || null;
    },
    enabled: !!user && !isStaffOrAdmin,
    refetchInterval: 60000
  });

  useEffect(() => {
    if (!credits || !autoPurchase || isStaffOrAdmin) return;

    // Check if balance is below threshold
    if (credits.balance < autoPurchase.trigger_threshold) {
      // Trigger auto-purchase
      apiClient.functions.invoke('triggerAutoPurchase', {})
        .catch(error => {
          // Error handled by toast notification
        });
    }
  }, [credits?.balance, autoPurchase, isStaffOrAdmin]);

  return null; // This is a monitoring component, no UI
}