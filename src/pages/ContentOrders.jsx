import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/OnboardingGuard';
import QuickOrderForm from '../components/QuickOrderForm';
import FolderManager from '../components/FolderManager';
import { toast } from 'sonner';

export default function ContentOrders() {
  const queryClient = useQueryClient();
  const [taskType, setTaskType] = useState('content_generation');
  const [selectedCreditCost, setSelectedCreditCost] = useState(0);
  const [quickInput, setQuickInput] = useState('');
  const [productCounts, setProductCounts] = useState({});
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [dateRange, setDateRange] = useState('all');
  const [filters, setFilters] = useState({
    searchTerm: '',
    taskType: 'all',
    status: 'all',
    showFavorites: false
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['content-orders'],
    queryFn: () => base44.entities.ContentOrder.list('-created_date')
  });



  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const allCredits = await base44.entities.Credit.filter({ created_by: user?.email });
      return allCredits[0];
    },
    enabled: !!user && user.access_level !== 'staff' && user.access_level !== 'admin'
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data) => {
      // Check if user has enough credits (staff/admin have unlimited)
      if (user?.access_level !== 'staff' && user?.access_level !== 'admin') {
        const creditCost = selectedCreditCost || 20;
        const remainingBalance = (credits?.balance || 0) - selectedCreditCost;

        if (remainingBalance < 0) {
          throw new Error('Insufficient credits. Please purchase more credits to continue.');
        }

        // Deduct credits immediately
        await base44.entities.Credit.update(credits.id, {
          balance: credits.balance - creditCost,
          total_used: (credits.total_used || 0) + creditCost
        });

        // Create transaction record
        await base44.entities.CreditTransaction.create({
          transaction_type: 'usage',
          amount: -creditCost,
          description: `Content generation: ${data.task_type}`,
          balance_after: credits.balance - creditCost
        });
        }

        // Auto-generate title if not provided
        const title = data.title || `${data.task_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${new Date().toLocaleDateString()}`;
        
        const order = await base44.entities.ContentOrder.create({
          ...data,
          title
        });

        // Send order confirmation email
        await base44.functions.invoke('sendResendEmail', {
          to: user.email,
          subject: 'Order Placed - OmniMind24',
          body: `Hi ${user.full_name || 'there'},\n\nYour content order has been placed successfully!\n\nOrder Details:\n- Type: ${data.task_type}\n- Credits Used: ${creditCost}\n- Remaining Balance: ${credits.balance - creditCost} credits\n\nYour content is being generated and will be ready soon.\n\nThank you for using OmniMind24!`,
          from_name: 'OmniMind24'
        });
      try {
        await base44.functions.invoke('processOrder', { order_id: order.id });
      } catch (error) {
        // Error handled by toast notification
        // Mark as failed if processing fails
        await base44.entities.ContentOrder.update(order.id, {
          status: 'failed',
          output_content: `Processing failed: ${error.message}`
        });
      }
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-orders']);
      queryClient.invalidateQueries(['credits']);
      setQuickInput('');
      setSelectedCreditCost(0);
      setProductCounts({});
      toast.success('Content is being generated! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/Dashboard';
      }, 1500);
    },
    onError: (error) => {
      toast.error('Failed to create order: ' + error.message);
    }
  });

  const handleStartOver = () => {
    setSelectedCreditCost(0);
    setProductCounts({});
    setQuickInput('');
    toast.success('Selection cleared');
  };

  const handleQuickSubmit = (data) => {
    createOrderMutation.mutate(data);
  };



  const allTags = useMemo(() => {
    const tags = new Set();
    orders.forEach(order => {
      if (order.tags && Array.isArray(order.tags)) {
        order.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (selectedFolder !== null && order.folder_id !== selectedFolder) return false;
      if (selectedFolder === null && order.folder_id) return false;
      
      if (filters.showFavorites && !order.is_favorite) return false;
      
      if (filters.taskType !== 'all' && order.task_type !== filters.taskType) return false;
      
      if (filters.status !== 'all' && order.status !== filters.status) return false;
      
      if (dateRange !== 'all') {
        const orderDate = new Date(order.created_date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (dateRange === 'today' && orderDate < today) return false;
        if (dateRange === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekAgo) return false;
        }
        if (dateRange === 'month') {
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          if (orderDate < monthAgo) return false;
        }
        if (dateRange === 'year') {
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          if (orderDate < yearAgo) return false;
        }
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesContent = order.output_content?.toLowerCase().includes(searchLower);
        const matchesInput = order.input_data?.toLowerCase().includes(searchLower);
        const matchesTitle = order.title?.toLowerCase().includes(searchLower);
        const matchesTags = order.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesContent && !matchesInput && !matchesTitle && !matchesTags) return false;
      }
      
      if (selectedTags.length > 0) {
        const orderTags = order.tags || [];
        const hasTag = selectedTags.some(tag => orderTags.includes(tag));
        if (!hasTag) return false;
      }
      
      return true;
    });
  }, [orders, selectedFolder, filters, selectedTags, dateRange]);

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="p-8">
          <TooltipProvider>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-1">
              <FolderManager 
                onFolderSelect={setSelectedFolder}
                selectedFolderId={selectedFolder}
              />
            </div>
            <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Content Orders</h1>
                <p className="text-gray-400">Your COSTAR profile ensures every generation matches your brand perfectly.</p>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-5 h-5 text-gray-500 hover:text-purple-400 transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Use A.I. to generate content like blog posts, emails, social media captions, and more. Select a template or describe what you need.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-2 bg-purple-600/20 border border-purple-500 rounded-lg px-4 py-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {user?.access_level === 'staff' || user?.access_level === 'admin' ? '∞' : (credits?.balance || 0) - selectedCreditCost}
                      </span>
                      <span className="text-sm text-gray-400">credits</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your available credit balance. Each content generation uses credits based on complexity.</p>
                </TooltipContent>
              </Tooltip>
              {selectedCreditCost > 0 && (
                <>
                  <Button
                    onClick={() => handleQuickSubmit({
                      task_type: taskType,
                      input_data: quickInput || 'Generate content based on selected products',
                      status: 'processing'
                    })}
                    disabled={createOrderMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2 text-lg px-6 py-6"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Buy Now ({selectedCreditCost} credits)
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartOver}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Start Over
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mb-6 space-y-6">
            <QuickOrderForm 
              initialPrompt={quickInput}
              taskType={taskType}
              onSubmit={handleQuickSubmit}
              isLoading={createOrderMutation.isPending}
            />
          </div>



          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Top 25 Selling Digital Contents</h2>
            <Card className="bg-[#1A1A1A] border-gray-800 mb-12">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: "Blog Post - SEO Optimized", credits: 15 },
                    { name: "Social Media Caption Pack", credits: 5 },
                    { name: "Email Marketing Campaign", credits: 18 },
                    { name: "Product Description", credits: 6 },
                    { name: "Website Copy", credits: 25 },
                    { name: "Video Script", credits: 20 },
                    { name: "Press Release", credits: 18 },
                    { name: "LinkedIn Article", credits: 12 },
                    { name: "Instagram Stories Pack", credits: 8 },
                    { name: "Landing Page Copy", credits: 28 },
                    { name: "Newsletter Content", credits: 10 },
                    { name: "Case Study", credits: 25 },
                    { name: "White Paper", credits: 35 },
                    { name: "Technical Documentation", credits: 30 },
                    { name: "Twitter Thread", credits: 5 },
                    { name: "Facebook Ad Copy", credits: 7 },
                    { name: "Google Ads Copy", credits: 7 },
                    { name: "Sales Email Sequence", credits: 20 },
                    { name: "Brand Story", credits: 22 },
                    { name: "eBook Chapter", credits: 40 },
                    { name: "Product Review", credits: 10 },
                    { name: "How-To Guide", credits: 15 },
                    { name: "Infographic Script", credits: 14 },
                    { name: "Podcast Episode Outline", credits: 12 },
                    { name: "YouTube Video Description", credits: 4 }
                  ].map((content, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 bg-[#0D0D0D] rounded-lg hover:bg-purple-900/20 transition-all cursor-pointer border border-gray-800 hover:border-purple-500"
                      onClick={() => {
                        const newTotal = selectedCreditCost + content.credits;
                        const remainingBalance = (credits?.balance || 0) - newTotal;

                        if (user?.access_level !== 'staff' && user?.access_level !== 'admin' && remainingBalance < 0) {
                          toast.error('Insufficient credits. Please purchase more credits to continue.');
                          return;
                        }

                        setQuickInput(`Create a ${content.name.toLowerCase()}`);
                        setSelectedCreditCost(newTotal);
                        setProductCounts(prev => ({
                          ...prev,
                          [content.name]: (prev[content.name] || 0) + 1
                        }));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-sm text-gray-300">{content.name}</span>
                        {productCounts[content.name] > 0 && (
                          <Badge className="bg-green-600 text-white text-xs">
                            {productCounts[content.name]}x
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-purple-400">{content.credits} cr</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>


          </div>

          </div>
          </div>
          </TooltipProvider>
          </div>
          </OnboardingGuard>
          </AuthGuard>
  );
}