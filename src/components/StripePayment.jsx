import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Fail fast: do not initialize Stripe with a placeholder key.
// If STRIPE_KEY is missing, stripePromise stays null and we show a clear UI message.
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

function CheckoutForm({ amount, price, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/Credits`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
      return;
    }

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-purple-500 bg-opacity-10 border border-purple-500 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">{amount} Credits</span>
          <span className="text-2xl font-bold text-purple-400">${price}</span>
        </div>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${price}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function StripePayment({
  clientSecret,
  amount,
  price,
  onSuccess,
  onCancel,
}) {
  if (!stripePromise) {
    return (
      <Card className="bg-[#1A1A1A] border-gray-800 max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center text-red-500">
            Configuration Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300 text-center">
              Stripe publishable key is not configured.
            </p>
            <p className="text-sm text-gray-400 text-center">
              Please add <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to your
              environment variables and reload the page.
            </p>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className="bg-[#1A1A1A] border-gray-800 max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center">
            Loading Payment...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "night",
        variables: {
          colorPrimary: "#9333EA",
          colorBackground: "#0D0D0D",
          colorText: "#FFFFFF",
          colorDanger: "#EF4444",
          borderRadius: "8px",
        },
      },
    }),
    [clientSecret]
  );

  return (
    <Card className="bg-[#1A1A1A] border-gray-800 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-white text-center">
          Complete Your Purchase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            amount={amount}
            price={price}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}