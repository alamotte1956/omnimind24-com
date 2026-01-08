import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const CREDIT_PACKAGES = [
  { amount: 10, price: 10.00, popular: false, description: 'Starter Pack' },
  { amount: 50, price: 47.50, popular: false, description: 'Value Pack' },
  { amount: 100, price: 90.00, popular: true, description: 'Most Popular' },
  { amount: 500, price: 427.50, popular: false, description: 'Power User' },
  { amount: 1000, price: 812.50, popular: false, description: 'Enterprise' }
];

export default function StripeCheckout({ credits, onSuccess }) {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async (pkg) => {
      // Create order record
      const order = await apiClient.entities.Order.create({
        amount: pkg.amount,
        price: pkg.price,
        status: 'pending',
        payment_method: 'demo',
        order_id: `ORD-${Date.now()}`
      });

      // Demo mode: Add credits immediately
      await apiClient.entities.Credit.update(credits.id, {
        balance: credits.balance + pkg.amount,
        total_purchased: (credits.total_purchased || 0) + pkg.amount
      });

      // Mark order as completed
      await apiClient.entities.Order.update(order.id, {
        status: 'completed'
      });

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['credits']);
      queryClient.invalidateQueries(['orders']);
      toast.success('Credits purchased successfully!');
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error('Purchase failed: ' + error.message);
    }
  });

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Purchase Credits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="flex items-start justify-between mb-2">
                <div>
                  {pkg.popular && (
                    <div className="text-xs text-purple-400 font-semibold mb-1">
                      {pkg.description}
                    </div>
                  )}
                  <div className="text-3xl font-bold text-white">{pkg.amount}</div>
                  <div className="text-sm text-gray-400">credits</div>
                </div>
                {selectedPackage.amount === pkg.amount && (
                  <Check className="w-5 h-5 text-purple-500" />
                )}
              </div>
              <div className="text-2xl font-semibold text-purple-400">${pkg.price}</div>
              <div className="text-xs text-gray-500 mt-1">
                ${(pkg.price / pkg.amount).toFixed(3)} per credit
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={() => purchaseMutation.mutate(selectedPackage)}
          disabled={purchaseMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
        >
          {purchaseMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Purchase {selectedPackage.amount} Credits for ${selectedPackage.price}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          * Demo mode: Credits added instantly. Production will use Stripe payment processing.
        </p>
      </CardContent>
    </Card>
  );
}