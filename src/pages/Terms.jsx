import { Card, CardContent } from &quot;@/components/ui/card&quot;;
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className=&quot;p-8 max-w-4xl mx-auto&quot;>
      <div className=&quot;mb-8&quot;>
        <h1 className=&quot;text-3xl font-bold text-white mb-2 flex items-center gap-3&quot;>
          <FileText className=&quot;w-8 h-8 text-purple-500&quot; />
          Terms of Service
        </h1>
        <p className=&quot;text-gray-400&quot;>Last updated: December 24, 2025</p>
      </div>

      <Card className=&quot;bg-[#1A1A1A] border-gray-800&quot;>
        <CardContent className=&quot;p-8 space-y-6 text-gray-300&quot;>
          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>1. Acceptance of Terms</h2>
            <p>By accessing and using OmniMind24, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>2. Service Description</h2>
            <p>OmniMind24 provides AI-powered content generation services. We orchestrate multiple AI models to deliver high-quality content based on your specifications.</p>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>3. Credits and Payments</h2>
            <ul className=&quot;list-disc list-inside space-y-2 ml-4&quot;>
              <li>Services are paid for using credits</li>
              <li>Credits are non-refundable once purchased</li>
              <li>Credits may expire 365 days after purchase</li>
              <li>All payments are processed securely through Stripe</li>
              <li>Prices are subject to change with notice</li>
            </ul>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>4. User Responsibilities</h2>
            <p className=&quot;mb-2&quot;>You agree to:</p>
            <ul className=&quot;list-disc list-inside space-y-1 ml-4&quot;>
              <li>Provide accurate account information</li>
              <li>Keep your password secure</li>
              <li>Not share your account with others</li>
              <li>Use the service for lawful purposes only</li>
              <li>Not attempt to reverse engineer or hack our systems</li>
            </ul>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>5. Content Ownership</h2>
            <p>You retain ownership of content you create using our services. However, you grant us a license to process, store, and display your content as necessary to provide our services.</p>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>6. AI-Generated Content</h2>
            <p className=&quot;mb-2&quot;>Please note:</p>
            <ul className=&quot;list-disc list-inside space-y-1 ml-4&quot;>
              <li>AI-generated content may not always be accurate</li>
              <li>You are responsible for reviewing and verifying all content</li>
              <li>We do not guarantee specific results or quality</li>
              <li>Content may be subject to third-party AI provider terms</li>
            </ul>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>7. Prohibited Uses</h2>
            <p className=&quot;mb-2&quot;>You may not use our service to:</p>
            <ul className=&quot;list-disc list-inside space-y-1 ml-4&quot;>
              <li>Generate illegal, harmful, or offensive content</li>
              <li>Infringe on intellectual property rights</li>
              <li>Spread misinformation or spam</li>
              <li>Harass or harm others</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>8. Service Availability</h2>
            <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to modify or discontinue services with or without notice.</p>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, OmniMind24 shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account if you violate these terms or engage in fraudulent activity.</p>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>11. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className=&quot;text-xl font-semibold text-white mb-3&quot;>12. Contact</h2>
            <p>Questions about these terms? Contact us at: <span className=&quot;text-purple-400&quot;>support@omnimind24.com</span></p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}