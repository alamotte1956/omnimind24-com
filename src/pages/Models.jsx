import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/OnboardingGuard';
import ModelComparison from '../components/ModelComparison';
import FineTuneManager from '../components/FineTuneManager';
import APIKeyManager from '../components/APIKeyManager';
import ModelMonitoring from '../components/ModelMonitoring';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

export default function Models() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.access_level === 'admin';

  const updateBenchmarksMutation = useMutation({
    mutationFn: () => base44.functions.invoke('syncRealTimeBenchmarks'),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-benchmarks']);
      toast.success('Real-time benchmarks synced from ArtificialAnalysis.ai');
    },
    onError: (error) => {
      toast.error('Failed to sync benchmarks: ' + error.message);
    }
  });

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">A.I. Models</h1>
            <p className="text-gray-400">Compare models, fine-tune your own, and manage API keys</p>
          </div>

          <Tabs defaultValue="monitoring" className="space-y-6">
            <TabsList className="bg-[#1A1A1A] border border-gray-800">
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-600">
                Performance Monitoring
              </TabsTrigger>
              <TabsTrigger value="comparison" className="data-[state=active]:bg-purple-600">
                Model Comparison
              </TabsTrigger>
              <TabsTrigger value="finetune" className="data-[state=active]:bg-purple-600">
                Fine-Tune Models
              </TabsTrigger>
              <TabsTrigger value="apikeys" className="data-[state=active]:bg-purple-600">
                API Keys
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring">
              <ModelMonitoring />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              {isAdmin && (
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => updateBenchmarksMutation.mutate()}
                    disabled={updateBenchmarksMutation.isPending}
                    variant="outline"
                    className="border-gray-700"
                  >
                    {updateBenchmarksMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Real-Time Data
                      </>
                    )}
                  </Button>
                </div>
              )}
              <ModelComparison />
            </TabsContent>

            <TabsContent value="finetune">
              <FineTuneManager />
            </TabsContent>

            <TabsContent value="apikeys">
              <APIKeyManager />
            </TabsContent>
          </Tabs>
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
}