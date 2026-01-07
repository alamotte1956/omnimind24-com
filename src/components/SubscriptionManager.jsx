import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2, Crown, Zap, Rocket } from 'lucide-react';
import { toast } from 'sonner';

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 19.99,
    credits: 25,
    icon: Zap,
    color: 'text-blue-500',
    features: ['25 credits per month', 'All AI models', 'Priority support', 'Cancel anytime']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.99,
    credits: 75,
    icon: Crown,
    color: 'text-purple-500',
    popular: true,
    features: ['75 credits per month', 'All AI models', 'Priority support', 'Advanced features', 'Cancel anytime']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149.99,
    credits: 250,
    icon: Rocket,
    color: 'text-orange-500',
    features: ['250 credits per month', 'All AI models', 'Dedicated support', 'Advanced features', 'API access', 'Cancel anytime']
  }
];

const CREDIT_PACKAGES = [
  { amount: 10, price: 10.00, description: 'Starter' },
  { amount: 50, price: 47.50, description: 'Value Pack' },
  { amount: 100, price: 90.00, description: 'Best Value', popular: true },
  { amount: 500, price: 427.50, description: 'Power User' },
  { amount: 1000, price: 812.50, description: 'Enterprise' }
];

export default function SubscriptionManager({ credits }) {
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]);
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[2]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ created_by: user.email });
      return subs.find(s => s.status === 'active');
    },
    enabled: !!user
  });

  const subscribeMutation = useMutation({
    mutationFn: async (plan) => {
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      if (subscription) {
        await base44.entities.Subscription.update(subscription.id, {
          plan: plan.id,
          monthly_credits: plan.credits,
          price: plan.price,
          next_billing_date: nextBilling.toISOString().split('T')[0]
        });
      } else {
        await base44.entities.Subscription.create({
          plan: plan.id,
          status: 'active',
          monthly_credits: plan.credits,
          price: plan.price,
          started_date: new Date().toISOString().split('T')[0],
          next_billing_date: nextBilling.toISOString().split('T')[0]
        });
      }

      await base44.entities.Credit.update(credits.id, {
        balance: credits.balance + plan.credits,
        total_purchased: (credits.total_purchased || 0) + plan.credits
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
      queryClient.invalidateQueries(['credits']);
      toast.success('Subscription activated!');
    },
    onError: (error) => {
      toast.error('Subscription failed: ' + error.message);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Subscription.update(subscription.id, {
        status: 'cancelled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
      toast.success('Subscription cancelled');
    }
  });

  const purchaseCreditsMutation = useMutation({
    mutationFn: async (pkg) => {
      const order = await base44.entities.Order.create({
        amount: pkg.amount,
        price: pkg.price,
        status: 'pending',
        payment_method: 'demo',
        order_id: `ORD-${Date.now()}`
      });

      await base44.entities.Credit.update(credits.id, {
        balance: credits.balance + pkg.amount,
        total_purchased: (credits.total_purchased || 0) + pkg.amount
      });

      await base44.entities.Order.update(order.id, { status: 'completed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['credits']);
      queryClient.invalidateQueries(['orders']);
      toast.success('Credits purchased!');
    }
  });

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Get Credits</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="credits">One-Time Credits</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6">
            {subscription && subscription.status === 'active' && (
              <div className="bg-purple-500 bg-opacity-10 border border-purple-500 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Active Subscription</h3>
                    <p className="text-sm text-gray-400">
                      {SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan)?.name} Plan - {subscription.monthly_credits} credits/month
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-lg border-2 transition-all ${
                      selectedPlan.id === plan.id
                        ? 'border-purple-500 bg-purple-500 bg-opacity-5'
                        : 'border-gray-700'
                    } ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <Icon className={`w-10 h-10 ${plan.color} mx-auto mb-3`} />
                      <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                      <div className="text-3xl font-bold text-white">${plan.price}</div>
                      <div className="text-sm text-gray-400">per month</div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedPlan(plan);
                        subscribeMutation.mutate(plan);
                      }}
                      disabled={subscribeMutation.isPending || (subscription?.plan === plan.id && subscription?.status === 'active')}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {subscription?.plan === plan.id && subscription?.status === 'active' 
                        ? 'Current Plan'
                        : subscribeMutation.isPending && selectedPlan.id === plan.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : 'Subscribe'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPackage.amount === pkg.amount
                      ? 'border-purple-500 bg-purple-500 bg-opacity-10'
                      : 'border-gray-700 hover:border-gray-600'
                  } ${pkg.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                >
                  {pkg.popular && (
                    <div className="text-xs text-purple-400 font-semibold mb-1">Best Value</div>
                  )}
                  <div className="text-2xl font-bold text-white">{pkg.amount}</div>
                  <div className="text-xs text-gray-400 mb-2">credits</div>
                  <div className="text-xl font-semibold text-purple-400">${pkg.price}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${(pkg.price / pkg.amount).toFixed(2)}/credit
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => purchaseCreditsMutation.mutate(selectedPackage)}
              disabled={purchaseCreditsMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
            >
              {purchaseCreditsMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Purchase ${selectedPackage.amount} Credits for $${selectedPackage.price}`
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              * Demo mode: Credits added instantly. Production will use Stripe payment processing.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}