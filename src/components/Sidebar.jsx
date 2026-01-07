import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Home, Settings, MessageSquare, Shield, CheckSquare, Sparkles, Coins, History, Gift, Library, BarChart3, LogOut, FolderOpen } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CreditBalance from './CreditBalance';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Sidebar({ currentPage }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const userRole = user?.access_level || 'user';
  const isAdmin = userRole === 'admin';

  const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';

  const navItems = [
    { name: 'Pricing', page: 'Pricing', icon: Coins },
    { name: 'Credits', page: 'Credits', icon: Coins },
    { name: 'Orders', page: 'ContentOrders', icon: Sparkles },
    { name: 'Order Delivery', page: 'Dashboard', icon: Home },
    { name: 'My Files', page: 'MyFiles', icon: FolderOpen },
    { name: 'Order History', page: 'OrderHistory', icon: History },
    { name: 'Affiliate', page: 'Affiliate', icon: Gift },
    ...(isAdmin ? [
      { name: 'Analytics', page: 'Analytics', icon: BarChart3 },
      { name: 'LLM Models', page: 'Models', icon: null, isLogo: true },
      { name: 'Settings', page: 'Settings', icon: Settings },
      { name: 'Action List', page: 'ActionList', icon: CheckSquare },
      { name: 'Admin', page: 'Admin', icon: Shield }
    ] : [])
  ];

  const getTooltipForPage = (page) => {
    const tooltips = {
      'Pricing': 'View subscription plans and credit packages',
      'Credits': 'Purchase and manage your credit balance for content generation',
      'ContentOrders': 'Create A.I.-generated content using templates or custom prompts',

      'TemplateLibrary': 'Browse and create reusable content templates',
      'Analytics': 'View detailed insights about your content and usage',
      'OrderHistory': 'Access your past orders and regenerate content',
      'Dashboard': 'View your recent orders and quick stats',
      'MyFiles': 'Access all your exported files and downloads',
      'Affiliate': 'Get your referral code and earn free credits',
      'Models': 'View available A.I. models and their capabilities',
      'Settings': 'Manage your account and preferences',
      'ActionList': 'View and manage assigned tasks',
      'Admin': 'Access admin panel to manage users and system'
    };
    return tooltips[page];
  };

  return (
    <TooltipProvider>
    <div className="w-64 bg-[#1A1A1A] border-r border-gray-800 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-800">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 cursor-help">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6948a16137ff8a8e50ada4e6/6820bd15d_OmniMind24Logo.png" 
                alt="OmniMind24" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">OmniMind24</h1>
                <p className="text-xs text-gray-500">Intelligence Means Business</p>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Your A.I.-powered content generation platform</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to={createPageUrl('Onboarding')}
            className="px-6 py-3 bg-purple-600 bg-opacity-20 border-t border-b border-purple-500 hover:bg-opacity-30 transition-all cursor-pointer block"
          >
            <p className="text-purple-300 text-sm font-semibold tracking-wide">START HERE →</p>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Complete your COSTAR profile for better A.I. results</p>
        </TooltipContent>
      </Tooltip>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          
          return (
            <Tooltip key={item.page}>
              <TooltipTrigger asChild>
                <Link
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive 
                      ? "bg-purple-600 text-white" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {item.isLogo ? (
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6948a16137ff8a8e50ada4e6/6820bd15d_OmniMind24Logo.png" 
                      alt="OmniMind24" 
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <span className="font-medium">{item.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{getTooltipForPage(item.page)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800 space-y-3">
        <CreditBalance />
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-xs text-gray-500 cursor-help">
              <div className="flex items-center justify-between mb-1">
                <span>Active Models</span>
                <span className="text-purple-400 font-semibold">7</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>A.I. models available for content generation</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => base44.auth.logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Sign out of your account</p>
          </TooltipContent>
        </Tooltip>
      </div>
      </div>
      </TooltipProvider>
      );
      }