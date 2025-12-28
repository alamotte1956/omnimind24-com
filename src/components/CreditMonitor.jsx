import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CreditMonitor() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const isStaffOrAdmin = user?.access_level === 'staff' || user?.access_level === 'admin';

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const userCredits = await base44.entities.Credit.filter({ created_by: user.email });
      return userCredits[0] || null;
    },
    enabled: !!user && !isStaffOrAdmin,
    refetchInterval: 30000 // Check every 30 seconds
  });

  const { data: autoPurchase } = useQuery({
    queryKey: ['auto-purchase', user?.id],
    queryFn: async () => {
      const purchases = await base44.entities.AutoPurchase.filter({ 
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
      base44.functions.invoke('triggerAutoPurchase', {})
        .catch(error => {
          // Error handled by toast notification
        });
    }
  }, [credits?.balance, autoPurchase, isStaffOrAdmin]);

  return null; // This is a monitoring component, no UI
}