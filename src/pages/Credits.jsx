import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, TrendingUp, ShoppingCart, History, 
  AlertTriangle, Zap, Calendar, ArrowUpCircle, ArrowDownCircle, HelpCircle 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AuthGuard from '../components/AuthGuard';
import StripePayment from '../components/StripePayment';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CREDIT_PACKAGES = [
  { amount: 100, price: 10, popular: false },
  { amount: 500, price: 45, popular: true },
  { amount: 1000, price: 80, popular: false },
  { amount: 2500, price: 180, popular: false }
];

export default function Credits() {
  const queryClient = useQueryClient();
  const [autoThreshold, setAutoThreshold] = useState(50);
  const [autoAmount, setAutoAmount] = useState(500);
  const [checkoutData, setCheckoutData] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  // Handle return from Stripe Checkout
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const sessionId = urlParams.get('session_id');

    const verifyPayment = async () => {
      try {
        const response = await base44.functions.invoke('verifyCheckoutSession', { sessionId });
        const data = response.data;
        
        if (data.alreadyProcessed) {
          toast.success('Credits already added! Redirecting to generate content...');
        } else {
          toast.success(`Payment successful! ${data.creditsAdded} credits added. Redirecting...`);
        }
        
        queryClient.invalidateQueries(['credits']);
        queryClient.invalidateQueries(['credit-transactions']);
        queryClient.invalidateQueries(['orders']);
        
        setTimeout(() => {
          window.location.href = '/ContentOrders';
        }, 1500);
      } catch (error) {
        toast.error('Failed to verify payment: ' + error.message);
        window.history.replaceState({}, document.title, '/Credits');
      }
    };

    if (success && sessionId) {
      verifyPayment();
    } else if (canceled) {
      toast.error('Payment was canceled');
      window.history.replaceState({}, document.title, '/Credits');
    }
  }, [queryClient]);

  const isStaffOrAdmin = user?.access_level === 'staff' || user?.access_level === 'admin';

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const userCredits = await base44.entities.Credit.filter({ created_by: user.email });
      if (userCredits.length === 0) {
        return await base44.entities.Credit.create({ 
          balance: 0, 
          total_purchased: 0, 
          total_used: 0,
          expiring_credits: 0
        });
      }
      return userCredits[0];
    },
    enabled: !!user && !isStaffOrAdmin
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['credit-transactions', user?.id],
    queryFn: () => base44.entities.CreditTransaction.list('-created_date', 50),
    enabled: !!user && !isStaffOrAdmin
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => base44.entities.Order.filter({ created_by: user.email }),
    enabled: !!user && !isStaffOrAdmin
  });

  const { data: autoPurchase } = useQuery({
    queryKey: ['auto-purchase', user?.id],
    queryFn: async () => {
      const purchases = await base44.entities.AutoPurchase.filter({ created_by: user.email });
      if (purchases.length > 0) {
        setAutoThreshold(purchases[0].trigger_threshold);
        setAutoAmount(purchases[0].credits_amount);
        return purchases[0];
      }
      return null;
    },
    enabled: !!user && !isStaffOrAdmin
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg) => {
      const response = await base44.functions.invoke('createPaymentIntent', {
        amount: pkg.amount,
        price: pkg.price,
        isRecurring: false
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    },
    onError: (error) => {
      toast.error('Failed to initiate payment: ' + error.message);
    }
  });

  const completeTestOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await base44.functions.invoke('completeTestOrder', { orderId });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Order completed! New balance: ${data.newBalance} credits`);
      queryClient.invalidateQueries(['credits']);
      queryClient.invalidateQueries(['credit-transactions']);
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error) => {
      toast.error('Failed to complete order: ' + error.message);
    }
  });

  const handlePaymentSuccess = () => {
    setCheckoutData(null);
    queryClient.invalidateQueries(['credits']);
    queryClient.invalidateQueries(['credit-transactions']);
    queryClient.invalidateQueries(['orders']);
    toast.success('Payment successful! Redirecting to select content...');
    setTimeout(() => {
      window.location.href = '/ContentOrders';
    }, 1500);
  };

  const toggleAutoMutation = useMutation({
    mutationFn: async (isActive) => {
      if (autoPurchase) {
        return await base44.entities.AutoPurchase.update(autoPurchase.id, { is_active: isActive });
      } else {
        const selectedPkg = CREDIT_PACKAGES.find(p => p.amount === autoAmount);
        return await base44.entities.AutoPurchase.create({
          credits_amount: autoAmount,
          trigger_threshold: autoThreshold,
          price: selectedPkg?.price || 45,
          is_active: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['auto-purchase']);
      toast.success('Auto-purchase settings updated');
    }
  });

  const updateAutoMutation = useMutation({
    mutationFn: async () => {
      const selectedPkg = CREDIT_PACKAGES.find(p => p.amount === autoAmount);
      if (autoPurchase) {
        return await base44.entities.AutoPurchase.update(autoPurchase.id, {
          credits_amount: autoAmount,
          trigger_threshold: autoThreshold,
          price: selectedPkg?.price || 45
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['auto-purchase']);
      toast.success('Auto-purchase settings saved');
    }
  });



  const daysUntilExpiration = credits?.expiration_date 
    ? Math.ceil((new Date(credits.expiration_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;



  return (
    <AuthGuard>
      <TooltipProvider>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Credit Management</h1>
              <p className="text-gray-400">
                {isStaffOrAdmin ? 'You have unlimited credits as ' + user?.access_level + ' - but you can test purchases below' : 'Manage your credits, purchase history, and auto-purchase settings'}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-5 h-5 text-gray-500 hover:text-purple-400 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Credits are used for content generation. Purchase credit packages or enable auto-purchase to never run out.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button
            onClick={() => window.location.href = '/ContentOrders'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue to Orders →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Current Balance</p>
                  <p className="text-3xl font-bold text-white">{credits?.balance || 0}</p>
                </div>
                <Coins className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Purchased</p>
                  <p className="text-3xl font-bold text-green-400">{credits?.total_purchased || 0}</p>
                </div>
                <ArrowUpCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Used</p>
                  <p className="text-3xl font-bold text-blue-400">{credits?.total_used || 0}</p>
                </div>
                <ArrowDownCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Expiration</p>
                  <p className="text-xl font-bold text-orange-400">
                    {daysUntilExpiration ? `${daysUntilExpiration}d` : 'N/A'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {daysUntilExpiration && daysUntilExpiration < 30 && (
          <Card className="bg-orange-500 bg-opacity-10 border-orange-500 mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-white font-semibold">Credit Expiration Warning</p>
                <p className="text-sm text-orange-300">
                  {credits?.expiring_credits || credits?.balance} credits will expire in {daysUntilExpiration} days
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="purchase" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchase">Purchase Credits</TabsTrigger>
            <TabsTrigger value="auto">Auto-Purchase</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card 
                  key={pkg.amount}
                  className={`bg-[#1A1A1A] border-gray-800 relative ${
                    pkg.popular ? 'border-purple-500' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-600">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <p className="text-4xl font-bold text-white">{pkg.amount}</p>
                      <p className="text-sm text-gray-400">Credits</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-3xl font-bold text-purple-400">${pkg.price}</p>
                      <p className="text-xs text-gray-500">${(pkg.price / pkg.amount).toFixed(3)}/credit</p>
                    </div>
                    <Button
                      onClick={() => purchaseMutation.mutate(pkg)}
                      disabled={purchaseMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="auto">
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Automatic Credit Purchases</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-gray-400">Enable</Label>
                    <Switch
                      checked={autoPurchase?.is_active || false}
                      onCheckedChange={(checked) => toggleAutoMutation.mutate(checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-500 bg-opacity-10 border border-purple-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Never Run Out of Credits</p>
                      <p className="text-sm text-purple-300">
                        Automatically purchase credits via Stripe when your balance falls below the threshold
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    ⚠️ Note: You'll need to set up a payment method first. The system will charge your saved payment method automatically when credits run low.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-400">Trigger When Balance Falls Below</Label>
                    <Input
                      type="number"
                      value={autoThreshold}
                      onChange={(e) => setAutoThreshold(Number(e.target.value))}
                      className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Credits</p>
                  </div>

                  <div>
                    <Label className="text-gray-400">Credits to Purchase</Label>
                    <select
                      value={autoAmount}
                      onChange={(e) => setAutoAmount(Number(e.target.value))}
                      className="w-full mt-2 bg-[#0D0D0D] border border-gray-700 text-white rounded-md px-3 py-2"
                    >
                      {CREDIT_PACKAGES.map((pkg) => (
                        <option key={pkg.amount} value={pkg.amount}>
                          {pkg.amount} credits - ${pkg.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={() => updateAutoMutation.mutate()}
                  disabled={updateAutoMutation.isPending || !autoPurchase}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Save Auto-Purchase Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <Card className="bg-[#1A1A1A] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No transactions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              tx.transaction_type === 'purchase' ? 'bg-green-500 bg-opacity-20' :
                              tx.transaction_type === 'usage' ? 'bg-blue-500 bg-opacity-20' :
                              tx.transaction_type === 'refund' ? 'bg-yellow-500 bg-opacity-20' :
                              'bg-purple-500 bg-opacity-20'
                            }`}>
                              {tx.transaction_type === 'purchase' && <ArrowUpCircle className="w-4 h-4 text-green-400" />}
                              {tx.transaction_type === 'usage' && <ArrowDownCircle className="w-4 h-4 text-blue-400" />}
                              {tx.transaction_type === 'refund' && <TrendingUp className="w-4 h-4 text-yellow-400" />}
                              {tx.transaction_type === 'bonus' && <Zap className="w-4 h-4 text-purple-400" />}
                            </div>
                            <div>
                              <p className="text-white font-medium">{tx.description}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(tx.created_date), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              tx.transaction_type === 'usage' ? 'text-blue-400' : 'text-green-400'
                            }`}>
                              {tx.transaction_type === 'usage' ? '-' : '+'}{tx.amount}
                            </p>
                            <p className="text-xs text-gray-500">Balance: {tx.balance_after}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Purchase Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium">{order.amount} Credits</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(order.created_date), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-purple-400 font-semibold">${order.price}</p>
                              <Badge variant={order.status === 'completed' ? 'default' : 'outline'}>
                                {order.status}
                              </Badge>
                            </div>
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => completeTestOrderMutation.mutate(order.id)}
                                disabled={completeTestOrderMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Complete (Test)
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </TooltipProvider>
    </AuthGuard>
  );
}