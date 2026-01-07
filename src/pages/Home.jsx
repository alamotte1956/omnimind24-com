import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-purple-500">OmniMind24</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Your AI-powered content generation platform. Create amazing content with cutting-edge AI technology.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Button
                onClick={() => navigate('/Dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6"
                >
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate('/ContentOrders')}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800 text-lg px-8 py-6"
                >
                  Explore Features
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Content Generation</h3>
              <p className="text-gray-400">
                Generate high-quality content for blogs, social media, emails, and more with advanced AI models.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Get your content generated in seconds. Our platform optimizes for speed without compromising quality.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">COSTAR Framework</h3>
              <p className="text-gray-400">
                Personalized AI output based on your Context, Objectives, Style, Tone, Audience, and Response format.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to transform your content creation?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join thousands of creators using AI to produce amazing content faster than ever.
            </p>
            <Button
              onClick={() => user ? navigate('/Dashboard') : base44.auth.redirectToLogin()}
              className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6"
            >
              {user ? 'Go to Dashboard' : 'Start Creating Now'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}