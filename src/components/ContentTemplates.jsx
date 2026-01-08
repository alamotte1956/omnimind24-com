import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, MessageSquare, TrendingUp, BookOpen, Code, Star, Users } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'blog_post',
    name: 'Blog Post',
    description: 'SEO-optimized long-form content',
    icon: FileText,
    taskType: 'content_generation',
    credits: 20,
    prompt: 'Write a comprehensive, SEO-optimized blog post about [topic]. Include an engaging introduction, well-structured sections with subheadings, actionable insights, and a compelling conclusion with a call-to-action.'
  },
  {
    id: 'email_campaign',
    name: 'Email Campaign',
    description: 'Engaging marketing emails',
    icon: Mail,
    taskType: 'content_generation',
    credits: 25,
    prompt: 'Create a persuasive email campaign for [product/service]. Include a catchy subject line, personalized greeting, clear value proposition, compelling body copy, and a strong call-to-action button.'
  },
  {
    id: 'social_media',
    name: 'Social Media Post',
    description: 'Platform-specific social content',
    icon: MessageSquare,
    taskType: 'content_generation',
    credits: 8,
    prompt: 'Write an engaging social media post for [platform] about [topic]. Make it attention-grabbing, include relevant hashtags, and encourage engagement from the audience.'
  },
  {
    id: 'product_description',
    name: 'Product Description',
    description: 'Conversion-focused copy',
    icon: TrendingUp,
    taskType: 'content_generation',
    credits: 10,
    prompt: 'Write a compelling product description for [product name]. Highlight key features, benefits, and unique selling points. Use persuasive language that converts readers into buyers.'
  },
  {
    id: 'case_study',
    name: 'Case Study',
    description: 'Customer success stories',
    icon: BookOpen,
    taskType: 'content_generation',
    credits: 35,
    prompt: 'Create a detailed case study showcasing how [customer] achieved [results] using [product/service]. Include the challenge, solution, implementation, and measurable outcomes.'
  },
  {
    id: 'technical_doc',
    name: 'Technical Documentation',
    description: 'Clear technical guides',
    icon: Code,
    taskType: 'technical',
    credits: 45,
    prompt: 'Write clear, comprehensive technical documentation for [feature/API]. Include step-by-step instructions, code examples, common use cases, and troubleshooting tips.'
  }
];

export default function ContentTemplates({ onSelectTemplate }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: userTemplates = [] } = useQuery({
    queryKey: ['user-templates-quick'],
    queryFn: () => base44.entities.UserTemplate.filter({ created_by: user?.email }, '-usage_count', 10),
    enabled: !!user
  });

  const allTemplates = [
    ...TEMPLATES,
    ...userTemplates.map(ut => ({
      id: `user-${ut.id}`,
      name: ut.name,
      description: ut.description,
      icon: FileText,
      taskType: ut.task_type,
      credits: ut.credits,
      prompt: ut.prompt,
      isUserTemplate: true,
      isFavorite: ut.is_favorite,
      isPublic: ut.is_public,
      isFeatured: ut.is_featured,
      usage_count: ut.usage_count
    }))
  ].sort((a, b) => {
    // Featured templates first
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    // Then favorites
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    // Then by usage count
    return (b.usage_count || 0) - (a.usage_count || 0);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allTemplates.map((template) => {
        const Icon = template.icon;
        return (
          <Card 
            key={template.id}
            className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all cursor-pointer group"
            onClick={() => onSelectTemplate(template)}
          >
            {template.isFeatured && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-yellow-600 text-white text-xs">
                  <Star className="w-3 h-3 fill-white" />
                </Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 bg-opacity-20 group-hover:bg-opacity-30 transition-all">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-white text-base">{template.name}</CardTitle>
                      {template.isFavorite && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-purple-600 text-white font-semibold">
                    {template.credits} cr
                  </Badge>
                  {template.isUserTemplate && (
                    <Badge variant="outline" className="border-purple-500 text-purple-400 text-xs">
                      Custom
                    </Badge>
                  )}
                  {template.isPublic && (
                    <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                      <Users className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-2">{template.description}</p>
              {template.usage_count > 0 && (
                <div className="flex items-center gap-1 text-xs text-purple-400 mb-2">
                  <TrendingUp className="w-3 h-3" />
                  <span>Used {template.usage_count} times</span>
                </div>
              )}
              <Button 
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template);
                }}
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}