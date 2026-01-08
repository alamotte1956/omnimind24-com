import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, AlertTriangle, Shield, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// Enhanced validation regex patterns
const STRIPE_PATTERNS = {
  secret: /^(sk_|rk_)[a-zA-Z0-9_]{24,}$/,
  publishable: /^pk_[a-zA-Z0-9_]{24,}$/,
  webhook: /^whsec_[a-zA-Z0-9_]{32,}$/
};

// Sanitize input to prevent XSS and injection
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 200);
};

// Rate limiting to prevent abuse
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 2000; // 2 seconds

export default function StripeKeyManager() {
  const [secretKey, setSecretKey] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const validateKey = (key, type) => {
    const sanitized = sanitizeInput(key);
    if (!sanitized) return false;
    return STRIPE_PATTERNS[type].test(sanitized);
  };

  const validateKeys = () => {
    const errors = [];

    // Enhanced validation with better error messages
    if (!secretKey) {
      errors.push('Stripe Secret Key is required');
    } else if (!validateKey(secretKey, 'secret')) {
      errors.push('Invalid Stripe Secret Key format (must start with sk_ or rk_)');
    }

    if (!publishableKey) {
      errors.push('Stripe Publishable Key is required');
    } else if (!validateKey(publishableKey, 'publishable')) {
      errors.push('Invalid Stripe Publishable Key format (must start with pk_)');
    }

    if (webhookSecret && !validateKey(webhookSecret, 'webhook')) {
      errors.push('Invalid Webhook Secret format (must start with whsec_)');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
      toast.error('Please wait a moment before submitting again');
      return;
    }
    lastSubmitTime = now;

    // Client-side validation
    const validation = validateKeys();
    if (!validation.isValid) {
      toast.error(validation.errors.join(', '));
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate server-side validation (in production, this would be a real API call)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In production, you would validate with your backend
      // const response = await fetch('/api/validate-stripe-keys', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     publishableKey: sanitizeInput(publishableKey),
      //     // Never send secret key to frontend validation!
      //   })
      // });

      toast.success('✅ Keys validated successfully!', {
        description: 'Please update your environment variables securely.'
      });

    } catch (error) {
      console.error('Stripe key validation error:', error);
      toast.error('Validation failed. Please check your keys and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySecureInstructions = () => {
    const sanitizedSecret = sanitizeInput(secretKey);
    const sanitizedPublishable = sanitizeInput(publishableKey);
    const sanitizedWebhook = sanitizeInput(webhookSecret);

    if (!sanitizedPublishable) {
      toast.error('Please enter a valid publishable key first');
      return;
    }

    const instructions = `# Stripe Configuration - DO NOT COMMIT TO GIT

# Server-side environment variables (never expose to frontend)
STRIPE_SECRET_KEY=${sanitizedSecret}
${sanitizedWebhook ? `STRIPE_WEBHOOK_SECRET=${sanitizedWebhook}` : '# STRIPE_WEBHOOK_SECRET=your_webhook_secret'}

# Client-side environment variables
VITE_STRIPE_PUBLISHABLE_KEY=${sanitizedPublishable}

# SECURITY NOTES:
# - Never share your secret keys
# - Use environment-specific keys (test vs live)
# - Rotate keys regularly
# - Monitor key usage in Stripe Dashboard`;

    navigator.clipboard.writeText(instructions);
    toast.success('📋 Secure configuration copied to clipboard', {
      description: 'Remember to store these in environment variables, not in code!'
    });
  };

  const handleKeyChange = (setter, keyType) => (e) => {
    const value = sanitizeInput(e.target.value);
    setter(value);
  };

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-green-500" />
          Stripe Configuration
          <Shield className="w-4 h-4 text-blue-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Notice */}
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <AlertTriangle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300 text-sm">
            <strong>🔒 Security Notice:</strong> Never share your secret keys or commit them to version control. 
            Use environment-specific keys and rotate them regularly.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Secret Key Input */}
          <div>
            <Label className="text-gray-400 flex items-center gap-2">
              Stripe Secret Key
              <Eye 
                className="w-4 h-4 cursor-pointer hover:text-gray-300" 
                onClick={() => setShowSecretKey(!showSecretKey)}
              />
            </Label>
            <Input
              type={showSecretKey ? "text" : "password"}
              value={secretKey}
              onChange={handleKeyChange(setSecretKey, 'secret')}
              placeholder="sk_live_... or rk_live_..."
              className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from Stripe Dashboard → Developers → API keys (restricted keys recommended)
            </p>
          </div>

          {/* Publishable Key Input */}
          <div>
            <Label className="text-gray-400">Stripe Publishable Key</Label>
            <Input
              type="text"
              value={publishableKey}
              onChange={handleKeyChange(setPublishableKey, 'publishable')}
              placeholder="pk_live_... or pk_test_..."
              className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from Stripe Dashboard → Developers → API keys (publishable key)
            </p>
          </div>

          {/* Webhook Secret Input */}
          <div>
            <Label className="text-gray-400 flex items-center gap-2">
              Webhook Secret (Optional)
              <Eye 
                className="w-4 h-4 cursor-pointer hover:text-gray-300" 
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              />
            </Label>
            <Input
              type={showWebhookSecret ? "text" : "password"}
              value={webhookSecret}
              onChange={handleKeyChange(setWebhookSecret, 'webhook')}
              placeholder="whsec_..."
              className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from Stripe Dashboard → Developers → Webhooks
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!secretKey || !publishableKey || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Validating Keys...
              </>
            ) : (
              '🔐 Validate Keys'
            )}
          </Button>

          <Button
            onClick={copySecureInstructions}
            variant="outline"
            disabled={!publishableKey || isSubmitting}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Secure Configuration
          </Button>
        </div>

        {/* Best Practices */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">🔧 Best Practices:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Use test keys for development, live keys for production</li>
            <li>• Store keys in environment variables, not in code</li>
            <li>• Use restricted keys with minimum required permissions</li>
            <li>• Enable webhook signatures for security</li>
            <li>• Monitor key usage in Stripe Dashboard regularly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}