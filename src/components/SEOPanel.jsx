import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Copy,
  Loader2,
  Link as LinkIcon,
  FileText,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

export default function SEOPanel({ contentOrderId }) {
  const queryClient = useQueryClient();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['seo-analysis', contentOrderId],
    queryFn: async () => {
      const results = await base44.entities.SEOAnalysis.filter({ content_order_id: contentOrderId });
      return results[0] || null;
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyzeSEO', { content_order_id: contentOrderId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['seo-analysis', contentOrderId]);
      toast.success('SEO analysis complete!');
    },
    onError: (error) => {
      toast.error('Failed to analyze SEO: ' + error.message);
    }
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'medium') return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardContent className="p-6">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-500" />
            SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">No SEO analysis available for this content yet.</p>
          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Run SEO Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-500" />
          SEO Analysis
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="border-gray-700 text-gray-300"
        >
          {analyzeMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-[#0D0D0D] border-gray-800 mb-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="keywords" className="data-[state=active]:bg-purple-600">
              Keywords
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-purple-600">
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="backlinks" className="data-[state=active]:bg-purple-600">
              Backlinks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0D0D0D] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">SEO Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.seo_score)}`}>
                    {analysis.seo_score}
                  </span>
                </div>
                <Progress value={analysis.seo_score} className="h-2" />
              </div>

              <div className="bg-[#0D0D0D] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Readability</span>
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.readability_score)}`}>
                    {analysis.readability_score}
                  </span>
                </div>
                <Progress value={analysis.readability_score} className="h-2" />
              </div>
            </div>

            <div className="bg-[#0D0D0D] p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Meta Title</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(analysis.meta_title)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-white">{analysis.meta_title}</p>
              <span className="text-xs text-gray-500">{analysis.meta_title?.length || 0} characters</span>
            </div>

            <div className="bg-[#0D0D0D] p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Meta Description</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(analysis.meta_description)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-white text-sm">{analysis.meta_description}</p>
              <span className="text-xs text-gray-500">{analysis.meta_description?.length || 0} characters</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FileText className="w-4 h-4" />
              <span>Word Count: {analysis.word_count}</span>
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                Primary Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.primary_keywords?.map((keyword, idx) => (
                  <Badge key={idx} className="bg-purple-600 text-white">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Secondary Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.secondary_keywords?.map((keyword, idx) => (
                  <Badge key={idx} className="bg-gray-700 text-gray-300">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                Competitor Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.competitor_keywords?.map((keyword, idx) => (
                  <Badge key={idx} className="bg-yellow-600/20 text-yellow-400 border border-yellow-600">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {analysis.keyword_density && Object.keys(analysis.keyword_density).length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Keyword Density</h4>
                <div className="bg-[#0D0D0D] rounded-lg p-4 space-y-2">
                  {Object.entries(analysis.keyword_density).slice(0, 10).map(([keyword, count]) => (
                    <div key={keyword} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{keyword}</span>
                      <span className="text-white font-medium">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3">
            {analysis.suggestions?.map((suggestion, idx) => (
              <div key={idx} className="bg-[#0D0D0D] p-4 rounded-lg flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(suggestion.priority)}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-xs">{suggestion.type}</Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        suggestion.priority === 'high' ? 'border-red-500 text-red-400' :
                        suggestion.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                        'border-blue-500 text-blue-400'
                      }`}
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm">{suggestion.message}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="backlinks" className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">
              High-authority domains relevant for backlink opportunities:
            </p>
            {analysis.backlink_opportunities?.map((opportunity, idx) => (
              <div key={idx} className="bg-[#0D0D0D] p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-white">{opportunity.domain}</span>
                </div>
                <Badge className="bg-green-600/20 text-green-400">
                  {Math.round(opportunity.relevance * 100)}% relevant
                </Badge>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}