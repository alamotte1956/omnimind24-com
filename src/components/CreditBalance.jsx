import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";

export default function CreditBalance() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const isStaffOrAdmin = user?.access_level === 'staff' || user?.access_level === 'admin';

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const userCredits = await base44.entities.Credit.filter({ created_by: user.email });
      return userCredits[0] || { balance: 0 };
    },
    enabled: !!user && !isStaffOrAdmin
  });

  if (isStaffOrAdmin) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-[#0D0D0D] rounded-lg border border-gray-800">
        <Coins className="w-5 h-5 text-green-500" />
        <div className="flex-1">
          <div className="text-xs text-gray-500">Credits</div>
          <div className="text-lg font-bold text-green-400">Unlimited</div>
        </div>
      </div>
    );
  }

  if (!credits) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#0D0D0D] rounded-lg border border-gray-800">
      <Coins className="w-5 h-5 text-purple-500" />
      <div className="flex-1">
        <div className="text-xs text-gray-500">Credits</div>
        <div className="text-lg font-bold text-white">{credits.balance || 0}</div>
      </div>
      <Link to={createPageUrl('Settings')}>
        <Button size="sm" variant="outline" className="text-xs border-gray-700 hover:bg-gray-800">
          Buy More
        </Button>
      </Link>
    </div>
  );
}