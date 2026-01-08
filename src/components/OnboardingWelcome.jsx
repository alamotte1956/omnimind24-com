import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, TrendingUp, Clock, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.auth.me()
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['content-orders'],
    queryFn: () => apiClient.entities.ContentOrder.list('-created_date')
  });

  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const allCredits = await apiClient.entities.Credit.filter({ created_by: user?.email });
      return allCredits[0];
    },
    enabled: !!user
  });

  // Hide if user has created content or dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('welcome_banner_dismissed');
    if (orders.length > 0 || dismissed === 'true') {
      setIsVisible(false);
    }
  }, [orders]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('welcome_banner_dismissed', 'true');
  };

  if (!isVisible || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border-purple-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 animate-pulse" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Welcome, {user.full_name || 'Creator'}! 🎉
                  </h2>
                </div>
                <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                  You&apos;re all set to create amazing AI-powered content! Here&apos;s what you can do right now:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#0D0D0D]/50 rounded-lg p-4 border border-purple-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-purple-600/20">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-white font-semibold">Create Content</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Generate blog posts, social media, emails, and more in seconds
                    </p>
                  </div>

                  <div className="bg-[#0D0D0D]/50 rounded-lg p-4 border border-yellow-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-yellow-600/20">
                        <Zap className="w-5 h-5 text-yellow-400" />
                      </div>
                      <h3 className="text-white font-semibold">
                        {user.access_level === 'staff' || user.access_level === 'admin' ? 'Unlimited Credits' : `${credits?.balance || 0} Credits Available`}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {user.access_level === 'staff' || user.access_level === 'admin' 
                        ? 'You have unlimited content generation power' 
                        : 'Each content piece costs 5-40 credits based on complexity'}
                    </p>
                  </div>

                  <div className="bg-[#0D0D0D]/50 rounded-lg p-4 border border-green-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-600/20">
                        <Clock className="w-5 h-5 text-green-400" />
                      </div>
                      <h3 className="text-white font-semibold">Fast Results</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Most content generates in under 30 seconds with our AI orchestrator
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate(createPageUrl('Credits'))}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Buy Credits to Start
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl('Onboarding'))}
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-900/20 gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Update COSTAR Profile
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Your COSTAR profile ensures every piece of content matches your brand perfectly</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}