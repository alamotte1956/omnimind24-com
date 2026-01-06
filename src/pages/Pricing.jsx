import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Zap, Crown, Sparkles, CreditCard } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';

const SUBSCRIPTION_PLANS = [
  {
    name: 'Starter',
    price: 29,
    credits: 200,
    icon: Zap,
    color: 'purple',
    features: [
      '200 credits per month',
      'Access to all AI models',
      'Basic analytics',
      'Email support',
      'Standard processing speed'
    ]
  },
  {
    name: 'Professional',
    price: 79,
    credits: 600,
    icon: Crown,
    color: 'blue',
    popular: true,
    features: [
      '600 credits per month',
      'Priority AI model access',
      'Advanced analytics & insights',
      'Priority email support',
      'Faster processing speed',
      'Team collaboration (up to 3)',
      'Custom templates'
    ]
  },
  {
    name: 'Enterprise',
    price: 199,
    credits: 1800,
    icon: Sparkles,
    color: 'green',
    features: [
      '1800 credits per month',
      'Unlimited AI model access',
      'Full analytics suite',
      'Dedicated account manager',
      'Fastest processing priority',
      'Unlimited team members',
      'Custom integrations',
      'API access',
      'White-label options'
    ]
  }
];

const CREDIT_PACKAGES = [
  { amount: 50, price: 9, bonus: 0 },
  { amount: 100, price: 15, bonus: 10 },
  { amount: 250, price: 35, bonus: 30 },
  { amount: 500, price: 65, bonus: 75 },
  { amount: 1000, price: 120, bonus: 200 }
];

const HYBRID_PLANS = [
  {
    name: 'Starter Hybrid',
    price: 39,
    credits: 250,
    bonusCredits: 50,
    discount: 15,
    icon: Zap,
    color: 'purple',
    features: [
      '250 monthly credits',
      '+50 bonus credits on signup',
      '15% off additional credit purchases',
      'Access to all AI models',
      'Basic analytics',
      'Email support',
      'Credits roll over (3 months)'
    ]
  },
  {
    name: 'Growth Hybrid',
    price: 79,
    credits: 600,
    bonusCredits: 150,
    discount: 20,
    icon: Crown,
    color: 'blue',
    popular: true,
    features: [
      '600 monthly credits',
      '+150 bonus credits on signup',
      '20% off additional credit purchases',
      'Priority AI model access',
      'Advanced analytics & insights',
      'Priority email support',
      'Faster processing speed',
      'Team collaboration (up to 3)',
      'Credits roll over (6 months)'
    ]
  },
  {
    name: 'Business Hybrid',
    price: 159,
    credits: 1500,
    bonusCredits: 500,
    discount: 25,
    icon: Sparkles,
    color: 'green',
    features: [
      '1500 monthly credits',
      '+500 bonus credits on signup',
      '25% off additional credit purchases',
      'Unlimited AI model access',
      'Full analytics suite',
      'Dedicated account manager',
      'Fastest processing priority',
      'Unlimited team members',
      'Custom integrations',
      'API access',
      'Credits never expire'
    ]
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const handleSubscribe = (plan) => {
    navigate('/Credits');
  };

  const handleBuyCredits = (pkg) => {
    navigate('/Credits');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0D0D0D] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Flexible Pricing for Every Need
            </h1>
            <p className="text-xl text-gray-400 mb-6">
              Choose a subscription plan or buy credits as you go
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">Hybrid pricing: Subscribe + Pay-as-you-go</span>
            </div>
          </div>

          {/* Hybrid Plans - RECOMMENDED */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-lg">Recommended: Hybrid Plans</span>
                <Crown className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Hybrid Pricing Plans</h2>
              <p className="text-gray-400 text-lg">Best value - Monthly credits + Discounted pay-as-you-go purchases</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {HYBRID_PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card
                    key={plan.name}
                    className={`bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-2 ${
                      plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/50' : 'border-gray-800'
                    } hover:border-purple-500 transition-all relative transform hover:scale-105`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm">
                          ⭐ Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${plan.color}-600 to-${plan.color}-800 flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Icon className={`w-8 h-8 text-white`} />
                      </div>
                      <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-5xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400">/month</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <CardDescription className="text-purple-400 font-semibold">
                          {plan.credits} credits/month
                        </CardDescription>
                        <Badge className="bg-green-600 text-white">
                          +{plan.bonusCredits} bonus credits
                        </Badge>
                        <div className="text-yellow-400 font-bold text-sm mt-2">
                          🎯 {plan.discount}% off extra credits
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleSubscribe(plan)}
                        className={`w-full ${
                          plan.popular
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                        } font-bold`}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                💡 Perfect for growing businesses • Best price per credit • Combine subscription + pay-as-you-go flexibility
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-16">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-500 font-semibold">OR CHOOSE</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Subscription Plans */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Standard Subscription Plans</h2>
              <p className="text-gray-400">Get monthly credits at discounted rates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card
                    key={plan.name}
                    className={`bg-[#1A1A1A] border-2 ${
                      plan.popular ? 'border-purple-500' : 'border-gray-800'
                    } hover:border-purple-500 transition-all relative`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 rounded-full bg-${plan.color}-600/20 flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`w-8 h-8 text-${plan.color}-400`} />
                      </div>
                      <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-5xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400">/month</span>
                      </div>
                      <CardDescription className="text-purple-400 font-semibold mt-2">
                        {plan.credits} credits included
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleSubscribe(plan)}
                        className={`w-full ${
                          plan.popular
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm">
                💡 Unused credits roll over to the next month • Cancel anytime
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-16">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-500 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Pay-as-you-go Credits */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Pay-as-you-go Credits</h2>
              <p className="text-gray-400">Buy credits only when you need them - no monthly commitment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {CREDIT_PACKAGES.map((pkg) => {
                const totalCredits = pkg.amount + pkg.bonus;
                const pricePerCredit = (pkg.price / totalCredits).toFixed(3);
                const savingsPercent = pkg.bonus > 0 ? Math.round((pkg.bonus / pkg.amount) * 100) : 0;

                return (
                  <Card
                    key={pkg.amount}
                    className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all"
                  >
                    <CardHeader className="text-center pb-3">
                      {pkg.bonus > 0 && (
                        <Badge className="bg-green-600 text-white mb-2 mx-auto">
                          +{savingsPercent}% Bonus
                        </Badge>
                      )}
                      <div className="text-4xl font-bold text-white mb-1">
                        {totalCredits}
                      </div>
                      <CardDescription className="text-gray-400">credits</CardDescription>
                      {pkg.bonus > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          ({pkg.amount} + {pkg.bonus} bonus)
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-white">${pkg.price}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        ${pricePerCredit} per credit
                      </div>
                      <Button
                        onClick={() => handleBuyCredits(pkg)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm">
                💳 Credits never expire • Use them whenever you need
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Compare All Pricing Options</h2>
              <p className="text-gray-400">Find the best option for your usage</p>
            </div>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="border-r border-gray-800 pr-4">
                    <div className="text-purple-400 font-semibold mb-2">Pricing Model</div>
                    <div className="space-y-2">
                      <div className="text-white font-medium">Hybrid (Recommended)</div>
                      <div className="text-sm text-gray-400">Monthly subscription + discounted extra credits</div>
                    </div>
                  </div>
                  <div className="border-r border-gray-800 pr-4">
                    <div className="text-purple-400 font-semibold mb-2">Best For</div>
                    <div className="space-y-2">
                      <div className="text-white font-medium">Growing Teams</div>
                      <div className="text-sm text-gray-400">Predictable baseline + flexibility for peaks</div>
                    </div>
                  </div>
                  <div className="border-r border-gray-800 pr-4">
                    <div className="text-purple-400 font-semibold mb-2">Value</div>
                    <div className="space-y-2">
                      <div className="text-white font-medium">Best Overall</div>
                      <div className="text-sm text-gray-400">Lowest cost per credit + bonus credits</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-400 font-semibold mb-2">Commitment</div>
                    <div className="space-y-2">
                      <div className="text-white font-medium">Flexible</div>
                      <div className="text-sm text-gray-400">Cancel anytime, credits roll over</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-6 pt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-gray-500 font-medium mb-2 text-sm">Subscription Only</div>
                    <div className="text-white text-sm">Fixed monthly credits</div>
                    <div className="text-xs text-gray-400 mt-1">$0.10-$0.15 per credit</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-medium mb-2 text-sm">Hybrid</div>
                    <div className="text-purple-400 text-sm font-bold">Monthly + bonus + discount</div>
                    <div className="text-xs text-green-400 mt-1">$0.08-$0.12 per credit</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-medium mb-2 text-sm">Pay-as-you-go Only</div>
                    <div className="text-white text-sm">Buy when needed</div>
                    <div className="text-xs text-gray-400 mt-1">$0.15-$0.18 per credit</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Why choose a Hybrid plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Hybrid plans give you the best of both worlds: consistent monthly credits at a great rate, plus discounts on additional purchases. Perfect for teams with variable workloads.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Can I combine both options?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Yes! Subscribe for your baseline needs and buy extra credits as needed. It's the perfect hybrid approach.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Do credits expire?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Pay-as-you-go credits never expire. Subscription credits roll over for up to 3 months.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Can I cancel my subscription?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Absolutely. Cancel anytime and keep any unused credits. No long-term commitments.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">What if I need more credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Simply buy additional credit packages at any time. Subscribers get a 10% discount on extra credits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}