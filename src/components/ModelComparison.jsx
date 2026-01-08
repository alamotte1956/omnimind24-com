
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Zap, DollarSign, Gauge } from 'lucide-react';

const MODEL_INFO = {
  'gpt-4o': { name: 'GPT-4o', provider: 'OpenAI', color: 'bg-green-500' },
  'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'OpenAI', color: 'bg-blue-500' },
  'claude-3.5-sonnet': { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', color: 'bg-purple-500' },
  'claude-opus-4': { name: 'Claude Opus 4', provider: 'Anthropic', color: 'bg-indigo-500' },
  'gemini-2.5-pro': { name: 'Gemini 2.5 Pro', provider: 'Google', color: 'bg-orange-500' },
  'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', provider: 'Google', color: 'bg-yellow-500' }
};

export default function ModelComparison({ onSelectModel }) {
  const { data: benchmarks = [], isLoading } = useQuery({
    queryKey: ['model-benchmarks'],
    queryFn: () => base44.entities.ModelBenchmark.list(),
    initialData: []
  });

  if (isLoading) {
    return <div className="text-gray-400">Loading benchmarks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-white">Model Performance Comparison</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benchmarks.map((benchmark) => {
          const info = MODEL_INFO[benchmark.model_id] || { name: benchmark.model_id, provider: 'Unknown', color: 'bg-gray-500' };
          
          return (
            <Card
              key={benchmark.id}
              className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all cursor-pointer"
              onClick={() => onSelectModel && onSelectModel(benchmark.model_id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-base">{info.name}</CardTitle>
                    <p className="text-xs text-gray-500">{info.provider}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${info.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Gauge className="w-4 h-4" />
                    Quality
                  </div>
                  <div className="text-white font-semibold">{benchmark.quality_score}/100</div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Zap className="w-4 h-4" />
                    Speed
                  </div>
                  <div className="text-white font-semibold">{benchmark.speed_score} tok/s</div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    Cost
                  </div>
                  <div className="text-white font-semibold">${benchmark.cost_per_1k_tokens}/1K</div>
                </div>

                {benchmark.strengths && benchmark.strengths.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {benchmark.strengths.map((strength, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-gray-700 text-gray-400">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}