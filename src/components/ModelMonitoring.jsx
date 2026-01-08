import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Clock, DollarSign, Star, Activity } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function ModelMonitoring() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['model-performance-logs'],
    queryFn: () => apiClient.entities.ModelPerformanceLog.list('-created_date', 1000)
  });

  const stats = useMemo(() => {
    if (!logs.length) return {};

    const byModel = {};
    
    logs.forEach(log => {
      if (!byModel[log.model_id]) {
        byModel[log.model_id] = {
          model_id: log.model_id,
          provider: log.provider,
          is_fine_tuned: log.is_fine_tuned,
          latencies: [],
          costs: [],
          ratings: [],
          successes: 0,
          failures: 0,
          total_tokens: 0
        };
      }
      
      const model = byModel[log.model_id];
      model.latencies.push(log.latency_ms);
      model.costs.push(log.cost_usd || 0);
      if (log.user_rating) model.ratings.push(log.user_rating);
      model.total_tokens += log.tokens_used || 0;
      
      if (log.success) model.successes++;
      else model.failures++;
    });

    return Object.values(byModel).map(model => ({
      ...model,
      avg_latency: model.latencies.reduce((a, b) => a + b, 0) / model.latencies.length,
      avg_cost: model.costs.reduce((a, b) => a + b, 0) / model.costs.length,
      avg_rating: model.ratings.length > 0 
        ? model.ratings.reduce((a, b) => a + b, 0) / model.ratings.length 
        : null,
      success_rate: (model.successes / (model.successes + model.failures)) * 100,
      total_requests: model.successes + model.failures
    })).sort((a, b) => b.total_requests - a.total_requests);
  }, [logs]);

  const timeSeriesData = useMemo(() => {
    const daily = {};
    
    logs.forEach(log => {
      const date = new Date(log.created_date).toLocaleDateString();
      if (!daily[date]) {
        daily[date] = { date, latency: [], cost: 0, requests: 0 };
      }
      daily[date].latency.push(log.latency_ms);
      daily[date].cost += log.cost_usd || 0;
      daily[date].requests += 1;
    });

    return Object.values(daily).map(day => ({
      date: day.date,
      avg_latency: day.latency.reduce((a, b) => a + b, 0) / day.latency.length,
      total_cost: day.cost,
      requests: day.requests
    })).slice(-30);
  }, [logs]);

  if (isLoading) {
    return <div className="text-gray-400">Loading performance data...</div>;
  }

  if (logs.length === 0) {
    return (
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No performance data yet. Start generating content to see metrics!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Requests</p>
                <p className="text-2xl font-bold text-white">{logs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Avg Latency</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(logs.reduce((a, b) => a + b.latency_ms, 0) / logs.length)}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Cost</p>
                <p className="text-2xl font-bold text-white">
                  ${logs.reduce((a, b) => a + (b.cost_usd || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Avg Rating</p>
                <p className="text-2xl font-bold text-white">
                  {logs.filter(l => l.user_rating).length > 0 
                    ? (logs.filter(l => l.user_rating).reduce((a, b) => a + b.user_rating, 0) / 
                       logs.filter(l => l.user_rating).length).toFixed(1)
                    : 'N/A'}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="bg-[#1A1A1A] border border-gray-800">
          <TabsTrigger value="models" className="data-[state=active]:bg-purple-600">
            Model Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-purple-600">
            Time Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Model Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.map((model, idx) => (
                  <div key={model.model_id} className="p-4 bg-[#0D0D0D] rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{model.model_id}</span>
                          {model.is_fine_tuned && (
                            <Badge className="bg-purple-600 text-white text-xs">Fine-Tuned</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{model.total_requests} requests</p>
                      </div>
                      {model.avg_rating && (
                        <div className="flex items-center gap-1 bg-yellow-500 bg-opacity-20 px-2 py-1 rounded">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-yellow-400 font-semibold">
                            {model.avg_rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Latency</p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span className="text-white font-medium">
                            {Math.round(model.avg_latency)}ms
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 text-xs mb-1">Avg Cost</p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-400" />
                          <span className="text-white font-medium">
                            ${model.avg_cost.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 text-xs mb-1">Success Rate</p>
                        <div className="flex items-center gap-1">
                          {model.success_rate >= 95 ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                          <span className={`font-medium ${
                            model.success_rate >= 95 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {model.success_rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 text-xs mb-1">Total Tokens</p>
                        <span className="text-white font-medium">
                          {(model.total_tokens / 1000).toFixed(1)}K
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="space-y-6">
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Latency Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="avg_latency" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3}
                      name="Avg Latency (ms)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Daily Cost & Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="total_cost" fill="#10b981" name="Cost ($)" />
                    <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}