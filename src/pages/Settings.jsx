
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Coins } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import SubscriptionManager from '../components/SubscriptionManager';
import OrderHistory from '../components/OrderHistory';
import APIKeyManager from '../components/APIKeyManager';
import ModelComparison from '../components/ModelComparison';
import StripeKeyManager from '../components/StripeKeyManager';

export default function Settings() {

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.auth.me()
  });

  const isStaffOrAdmin = user?.access_level === 'staff' || user?.access_level === 'admin';

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const userCredits = await apiClient.entities.Credit.filter({ created_by: user.email });
      if (userCredits.length === 0) {
        const newCredit = await apiClient.entities.Credit.create({ balance: 0, total_purchased: 0, total_used: 0 });
        return newCredit;
      }
      return userCredits[0];
    },
    enabled: !!user && !isStaffOrAdmin
  });

  return (
    <AuthGuard>
      <div className="p-8">
        <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your OmniMind experience</p>
        </div>

        <div className="space-y-6 max-w-3xl">
        <StripeKeyManager />

        {isStaffOrAdmin ? (
          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-500" />
                Unlimited Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-[#0D0D0D] rounded-lg text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">∞</div>
                <div className="text-xl text-white mb-2">Unlimited Credits</div>
                <div className="text-sm text-gray-400">
                  {user?.access_level === 'admin' ? 'Administrator' : 'Staff'} accounts have unlimited free access to all features
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-purple-500" />
                  Credits Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-lg">
                  <div>
                    <div className="text-sm text-gray-400">Current Balance</div>
                    <div className="text-3xl font-bold text-white">{credits?.balance || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Purchased</div>
                    <div className="text-xl font-semibold text-purple-400">{credits?.total_purchased || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Used</div>
                    <div className="text-xl font-semibold text-gray-400">{credits?.total_used || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SubscriptionManager credits={credits} />

            <OrderHistory />
          </>
        )}

        <ModelComparison />

        {isStaffOrAdmin && <APIKeyManager />}

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Manage your account settings and preferences
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Configure notification preferences
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </AuthGuard>
  );
}