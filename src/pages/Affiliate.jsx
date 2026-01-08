import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Users, TrendingUp, CheckCircle, Clock, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/OnboardingGuard';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Affiliate() {
  const queryClient = useQueryClient();
  const [referralCode, setReferralCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myReferrals = [] } = useQuery({
    queryKey: ['my-referrals'],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }, '-created_date'),
    enabled: !!user
  });

  const { data: myReferralCode } = useQuery({
    queryKey: ['my-referral-code'],
    queryFn: async () => {
      const existingCodes = await base44.entities.Referral.filter({ 
        referrer_email: user?.email,
        referee_email: null 
      });
      if (existingCodes.length > 0) {
        return existingCodes[0].referral_code;
      }
      return null;
    },
    enabled: !!user
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const code = `${user.full_name.replace(/\s+/g, '').toUpperCase().substring(0, 4)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await base44.entities.Referral.create({
        referral_code: code,
        referrer_email: user.email,
        status: 'pending'
      });
      return code;
    },
    onSuccess: (code) => {
      queryClient.invalidateQueries(['my-referral-code']);
      setReferralCode(code);
      toast.success('Referral code generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate code: ' + error.message);
    }
  });

  const redeemMutation = useMutation({
    mutationFn: async (code) => {
      const result = await base44.functions.invoke('redeemReferral', { 
        referral_code: code 
      });
      return result.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(['credits']);
        queryClient.invalidateQueries(['my-referrals']);
        setRedeemCode('');
        toast.success(`Success! You both earned ${data.credits_awarded} credits!`);
      } else {
        toast.error(data.message || 'Failed to redeem code');
      }
    },
    onError: (error) => {
      toast.error('Failed to redeem: ' + error.message);
    }
  });

  useEffect(() => {
    if (myReferralCode) {
      setReferralCode(myReferralCode);
    }
  }, [myReferralCode]);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied!');
  };

  const redeemedReferrals = myReferrals.filter(r => r.status === 'redeemed');
  const totalCreditsEarned = redeemedReferrals.length * 15;

  return (
    <AuthGuard>
      <OnboardingGuard>
        <TooltipProvider>
        <div className="p-8">
          <div className="mb-8 flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Affiliate Program</h1>
              <p className="text-gray-400">Earn credits by referring friends. Both of you get 15 credits!</p>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-5 h-5 text-gray-500 hover:text-purple-400 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Share your referral code with others. When they sign up and use it, you both get 15 free credits!</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Referrals</p>
                    <p className="text-2xl font-bold text-white">{redeemedReferrals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Credits Earned</p>
                    <p className="text-2xl font-bold text-white">{totalCreditsEarned}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Gift className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Reward Per Referral</p>
                    <p className="text-2xl font-bold text-white">15cr</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Your Referral Code</CardTitle>
                <CardDescription className="text-gray-400">
                  Share this code with friends to earn credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!referralCode ? (
                  <Button
                    onClick={() => generateCodeMutation.mutate()}
                    disabled={generateCodeMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Generate My Referral Code
                  </Button>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        value={referralCode}
                        readOnly
                        className="bg-[#0D0D0D] border-gray-700 text-white font-mono text-lg"
                      />
                      <Button
                        onClick={copyCode}
                        variant="outline"
                        className="border-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="bg-purple-600/10 border border-purple-500 rounded-lg p-4">
                      <p className="text-sm text-purple-300">
                        💡 Share this code with friends. When they sign up and redeem it, you both get 15 credits!
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Redeem a Code</CardTitle>
                <CardDescription className="text-gray-400">
                  Have a referral code? Redeem it here for 15 credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral code"
                    className="bg-[#0D0D0D] border-gray-700 text-white font-mono"
                  />
                  <Button
                    onClick={() => redeemMutation.mutate(redeemCode)}
                    disabled={!redeemCode.trim() || redeemMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Redeem
                  </Button>
                </div>
                <div className="bg-green-600/10 border border-green-500 rounded-lg p-4">
                  <p className="text-sm text-green-300">
                    ✨ Redeem a friend's code and you both get 15 credits instantly!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Referral History</CardTitle>
              <CardDescription className="text-gray-400">
                Track your successful referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myReferrals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No referrals yet. Start sharing your code!</p>
              ) : (
                <div className="space-y-3">
                  {myReferrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        {referral.status === 'redeemed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {referral.referee_email || 'Pending'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {referral.redeemed_date 
                              ? format(new Date(referral.redeemed_date), 'MMM dd, yyyy')
                              : format(new Date(referral.created_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge className={referral.status === 'redeemed' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {referral.status === 'redeemed' ? '+15 credits' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </TooltipProvider>
      </OnboardingGuard>
    </AuthGuard>
  );
}