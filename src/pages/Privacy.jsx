
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-500" />
          Privacy Policy
        </h1>
        <p className="text-gray-400">Last updated: December 24, 2025</p>
      </div>

      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardContent className="p-8 space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Account information (name, email address)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Content you create using our AI services</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. All payment processing is handled securely through Stripe, and we do not store credit card information on our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. AI Content Processing</h2>
            <p>Content you generate using our AI services may be processed by third-party AI providers (OpenAI, Anthropic, Google, etc.). We do not share your personal information with these providers beyond what's necessary to process your requests.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting support.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at: <span className="text-purple-400">support@omnimind24.com</span></p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}