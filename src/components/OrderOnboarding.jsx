import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Zap, Lightbulb, Sparkles, CheckCircle } from 'lucide-react';

export default function OrderOnboarding({ onDismiss }) {
  return (
    <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-200" />
            <CardTitle className="text-white text-base">How to Create Amazing Content</CardTitle>
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
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-purple-950 bg-opacity-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-full bg-purple-600">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <h4 className="font-semibold text-white text-sm">1. Quick Create</h4>
            </div>
            <p className="text-xs text-purple-100">
              Describe your needs - AI does the rest.
            </p>
          </div>

          <div className="bg-purple-950 bg-opacity-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-full bg-purple-600">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <h4 className="font-semibold text-white text-sm">2. Use Templates</h4>
            </div>
            <p className="text-xs text-purple-100">
              Pre-optimized templates for blogs, emails, and more.
            </p>
          </div>

          <div className="bg-purple-950 bg-opacity-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-full bg-purple-600">
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
              <h4 className="font-semibold text-white text-sm">3. A.I. Suggestions</h4>
            </div>
            <p className="text-xs text-purple-100">
              AI suggests content ideas from your success patterns.
            </p>
          </div>
        </div>

        <div className="bg-purple-950 bg-opacity-50 rounded-lg p-3 border border-purple-500">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1 text-sm">Settings Optimized</h4>
              <p className="text-xs text-purple-100">
                Your COSTAR profile auto-matches brand voice and objectives.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}