import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CreditMonitor() {
  // Track if auto-purchase has been triggered to prevent duplicate attempts
  const autoPurchaseTriggeredRef = useRef(false);
  const lastBalanceRef = useRef(null);

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

    // Reset trigger flag if balance has been replenished
    if (lastBalanceRef.current !== null && 
        credits.balance > lastBalanceRef.current &&
        credits.balance >= autoPurchase.trigger_threshold) {
      autoPurchaseTriggeredRef.current = false;
    }
    lastBalanceRef.current = credits.balance;

    // Check if balance is below threshold and auto-purchase hasn't been triggered yet
    if (credits.balance < autoPurchase.trigger_threshold && !autoPurchaseTriggeredRef.current) {
      // Mark as triggered to prevent duplicate attempts
      autoPurchaseTriggeredRef.current = true;

      // Notify user that auto-purchase is being triggered
      toast.info('Low credit balance detected. Initiating auto-purchase...');

      // Trigger auto-purchase with proper error handling
      base44.functions.invoke('triggerAutoPurchase', {})
        .then((result) => {
          if (result?.success) {
            toast.success(`Auto-purchase successful! ${result.credits_added || 'Credits'} added to your account.`);
            // Reset flag to allow future auto-purchases
            autoPurchaseTriggeredRef.current = false;
          } else {
            throw new Error(result?.error || 'Auto-purchase failed');
          }
        })
        .catch(error => {
          // Log error for debugging (only in development)
          if (import.meta.env.DEV) {
            console.error('Auto-purchase failed:', error);
          }
          
          // Notify user of the failure with actionable message
          toast.error(
            'Auto-purchase failed. Please check your payment method or purchase credits manually.',
            {
              duration: 10000, // Show for 10 seconds
              action: {
                label: 'Buy Credits',
                onClick: () => window.location.href = '/Credits'
              }
            }
          );

          // Reset flag after a delay to allow retry
          setTimeout(() => {
            autoPurchaseTriggeredRef.current = false;
          }, 300000); // 5 minutes cooldown before retry
        });
    }
  }, [credits?.balance, autoPurchase, isStaffOrAdmin]);

  return null; // This is a monitoring component, no UI
}
