import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Gift, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const TUTORIAL_STEPS = [
  {
    title: "Welcome to OmniMind24! 🎉",
    description: "Your AI-powered content creation hub is ready! This 3-minute interactive tour will show you everything you need to start creating professional content. Let's begin your journey to effortless content generation.",
    icon: Sparkles,
    color: "text-purple-500",
    tips: [
      "Navigate using Next/Back buttons at the bottom",
      "Click 'Skip Tutorial' anytime if you prefer to explore on your own",
      "Hover over any icon in the app for helpful tooltips",
      "You can restart this tutorial from Settings anytime"
    ],
    visual: "🚀 Getting Started"
  },
  {
    title: "Understanding Credits 💰",
    description: "Credits are the fuel for your AI content generation. Think of them like tokens that unlock powerful AI capabilities. New users start with welcome credits to test the platform. Different content types cost different amounts based on complexity and length.",
    icon: Zap,
    color: "text-yellow-500",
    tips: [
      "Simple tasks (social captions) = 5-10 credits",
      "Medium tasks (blog posts, emails) = 15-20 credits",
      "Complex tasks (whitepapers, case studies) = 30-40 credits",
      "Watch your balance in the top right corner",
      "Purchase more credits anytime from the Credits page"
    ],
    examples: [
      { name: "Social Media Caption", credits: 5 },
      { name: "Blog Post (800 words)", credits: 15 },
      { name: "Email Campaign", credits: 18 },
      { name: "White Paper", credits: 35 }
    ],
    visual: "⚡ Credit System"
  },
  {
    title: "Create Your First Content 🎨",
    description: "Ready to generate your first piece of content? It's incredibly simple! Just describe what you need in plain English and select from 25+ content types. Our AI orchestrator automatically selects the best model for your task and uses your COSTAR profile for perfect results every time.",
    icon: Sparkles,
    color: "text-blue-500",
    action: "Start Creating Now",
    page: "ContentOrders",
    tips: [
      "Be specific: 'Write a friendly email about our summer sale' works better than just 'email'",
      "Browse the 25 bestselling content types to see what you can create",
      "Credit costs are shown upfront for each content type",
      "Watch the demo: Type your request → Click Buy Now → AI generates in seconds",
      "Your COSTAR profile ensures brand-consistent results automatically"
    ],
    visual: "✨ Content Creation"
  },
  {
    title: "Track & Optimize 📊",
    description: "View all your generated content in Order History. Each piece includes SEO analysis, performance metrics, and the ability to regenerate with tweaks. Check Analytics to see which content types you use most and optimize your credit spending.",
    icon: CheckCircle,
    color: "text-green-500",
    tips: [
      "Order History keeps all your content organized",
      "Download, copy, or share any generated content",
      "SEO scores help optimize for search engines",
      "Add comments and collaborate with team members",
      "Use folders and tags to stay organized"
    ],
    visual: "📈 Analytics & History"
  },
  {
    title: "Earn Free Credits 🎁",
    description: "Love OmniMind24? Share it and earn! Every friend who signs up with your referral code gives you BOTH 15 free credits. There's no limit - refer 10 friends, get 150 credits. It's that simple. Plus, set up auto-purchase to never run out mid-project.",
    icon: Gift,
    color: "text-green-500",
    action: "Get My Referral Code",
    page: "Affiliate",
    tips: [
      "Your unique code is ready to share immediately",
      "Track referral status in real-time",
      "Both parties get 15 credits when your friend makes their first purchase",
      "Share via email, social media, or direct link",
      "Set up auto-purchase to maintain a credit buffer"
    ],
    visual: "💝 Referral Program"
  },
  {
    title: "You're Ready to Create! 🚀",
    description: "Congratulations! You now know everything to start creating amazing AI-powered content. Remember: start with templates, use COSTAR for best results, and hover over any icon for help. Your journey to effortless content creation starts now!",
    icon: CheckCircle,
    color: "text-green-500",
    tips: [
      "💡 Quick start: Go to Content Orders → Pick a template → Generate",
      "🎯 Best practice: Complete COSTAR setup for 30% better results",
      "📚 Explore: Check out the Template Library for inspiration",
      "💰 Save money: Use referrals and set up auto-purchase discounts",
      "🆘 Need help? Every icon has a tooltip - just hover to learn more"
    ],
    visual: "🎉 Ready to Go!"
  }
];

export default function InteractiveTutorial() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    if (user && !user.tutorial_completed) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const completeTutorialMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({ tutorial_completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Tutorial completed! Welcome to OmniMind24 🎉');
    }
  });

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorialMutation.mutate();
      setIsOpen(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTutorialMutation.mutate();
    setIsOpen(false);
  };

  const handleActionClick = () => {
    const step = TUTORIAL_STEPS[currentStep];
    if (step.page) {
      setIsOpen(false);
      completeTutorialMutation.mutate();
      navigate(createPageUrl(step.page));
    }
  };

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#1A1A1A] border-gray-800 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl text-white">{step.title}</DialogTitle>
            <Icon className={`w-8 h-8 ${step.color}`} />
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-400 mt-2">
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </p>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {step.visual && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full mb-2">
              <span className="text-purple-400 font-semibold text-sm">{step.visual}</span>
            </div>
          )}
          
          <p className="text-gray-300 text-lg leading-relaxed">
            {step.description}
          </p>
          
          {step.examples && (
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-700/30">
              <p className="text-yellow-400 text-sm font-semibold mb-3">💰 Example Credit Costs:</p>
              <div className="grid grid-cols-2 gap-3">
                {step.examples.map((example, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg p-3">
                    <span className="text-gray-300 text-sm">{example.name}</span>
                    <span className="text-yellow-400 font-semibold text-sm">{example.credits} cr</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {step.tips && (
            <div className="bg-[#0D0D0D] rounded-lg p-4 border border-purple-800/50">
              <p className="text-purple-400 text-sm font-semibold mb-3">💡 Pro Tips:</p>
              <ul className="space-y-2">
                {step.tips.map((tip, idx) => (
                  <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-400 hover:text-white"
          >
            Skip Tutorial
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {step.action ? (
              <Button
                onClick={handleActionClick}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {step.action}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? "Get Started" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}