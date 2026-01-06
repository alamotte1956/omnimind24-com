import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Coins, Shield, Settings as SettingsIcon, Key } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import SubscriptionManager from '../components/SubscriptionManager';
import OrderHistory from '../components/OrderHistory';
import APIKeyManager from '../components/APIKeyManager';
import ModelComparison from '../components/ModelComparison';
import StripeKeyManager from '../components/StripeKeyManager';
import SecurityDashboard from '../components/SecurityDashboard';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const isStaffOrAdmin = user?.access_level === 'staff' || user?.access_level === 'admin';

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const userCredits = await base44.entities.Credit.filter({ created_by: user.email });
      if (userCredits.length === 0) {
        const newCredit = await base44.entities.Credit.create({ balance: 0, total_purchased: 0, total_used: 0 });
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1A1A1A] border border-gray-800">
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Coins className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            {isStaffOrAdmin && (
              <TabsTrigger 
                value="api" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
            )}
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6 max-w-3xl">
            <StripeKeyManager />

            <ModelComparison />

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-lg">
                    <div>
                      <p className="text-white font-medium">{user?.full_name || 'User'}</p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Access Level</p>
                      <p className="text-purple-400 font-medium capitalize">
                        {user?.access_level || 'User'}
                      </p>
                    </div>
                  </div>
                </div>
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
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6 max-w-3xl">
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
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="max-w-3xl">
            <SecurityDashboard />
          </TabsContent>

          {/* API Keys Tab (Staff/Admin only) */}
          {isStaffOrAdmin && (
            <TabsContent value="api" className="space-y-6 max-w-3xl">
              <APIKeyManager />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AuthGuard>
  );
}
