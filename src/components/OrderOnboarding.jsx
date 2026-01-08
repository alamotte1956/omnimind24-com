import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Zap, Lightbulb, Sparkles, CheckCircle } from 'lucide-react';

export default function OrderOnboarding({ onDismiss }) {
  return (
    <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-600">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-200" />
            <CardTitle className="text-white">How to Create Amazing Content</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-purple-200 hover:text-white hover:bg-purple-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-950 bg-opacity-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-purple-600">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-white">1. Quick Create</h4>
            </div>
            <p className="text-sm text-purple-100">
              Simply describe what you need in plain language. Our A.I. understands your COSTAR profile and generates exactly what you want.
            </p>
          </div>

          <div className="bg-purple-950 bg-opacity-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-purple-600">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-white">2. Use Templates</h4>
            </div>
            <p className="text-sm text-purple-100">
              Start with proven templates for blogs, emails, social posts, and more. They&apos;re pre-optimized for conversions.
            </p>
          </div>

          <div className="bg-purple-950 bg-opacity-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-purple-600">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-white">3. A.I. Suggestions</h4>
            </div>
            <p className="text-sm text-purple-100">
              Let A.I. analyze your needs and suggest fresh content ideas based on your past success and industry trends.
            </p>
          </div>
        </div>

        <div className="bg-purple-950 bg-opacity-50 rounded-lg p-4 border border-purple-500">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Your Settings Are Already Optimized</h4>
              <p className="text-sm text-purple-100">
                Your COSTAR profile ensures every piece of content matches your brand voice, audience, and objectives. The system automatically selects the best A.I. model for each task.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}