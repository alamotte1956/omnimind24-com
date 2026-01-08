import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-purple-500" />
          Terms of Service
        </h1>
        <p className="text-gray-400">Last updated: December 24, 2025</p>
      </div>

      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardContent className="p-8 space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using OmniMind24, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Service Description</h2>
            <p>OmniMind24 provides AI-powered content generation services. We orchestrate multiple AI models to deliver high-quality content based on your specifications.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Credits and Payments</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Services are paid for using credits</li>
              <li>Credits are non-refundable once purchased</li>
              <li>Credits may expire 365 days after purchase</li>
              <li>All payments are processed securely through Stripe</li>
              <li>Prices are subject to change with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. User Responsibilities</h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide accurate account information</li>
              <li>Keep your password secure</li>
              <li>Not share your account with others</li>
              <li>Use the service for lawful purposes only</li>
              <li>Not attempt to reverse engineer or hack our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Content Ownership</h2>
            <p>You retain ownership of content you create using our services. However, you grant us a license to process, store, and display your content as necessary to provide our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. AI-Generated Content</h2>
            <p className="mb-2">Please note:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>AI-generated content may not always be accurate</li>
              <li>You are responsible for reviewing and verifying all content</li>
              <li>We do not guarantee specific results or quality</li>
              <li>Content may be subject to third-party AI provider terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Prohibited Uses</h2>
            <p className="mb-2">You may not use our service to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Generate illegal, harmful, or offensive content</li>
              <li>Infringe on intellectual property rights</li>
              <li>Spread misinformation or spam</li>
              <li>Harass or harm others</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Service Availability</h2>
            <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to modify or discontinue services with or without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, OmniMind24 shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account if you violate these terms or engage in fraudulent activity.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact</h2>
            <p>Questions about these terms? Contact us at: <span className="text-purple-400">support@omnimind24.com</span></p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}