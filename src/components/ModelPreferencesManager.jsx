import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

const TASK_TYPES = [
  { value: 'content_generation', label: 'Content Generation', description: 'Blog posts, articles, marketing copy' },
  { value: 'analysis', label: 'Analysis & Research', description: 'Data analysis, research summaries' },
  { value: 'translation', label: 'Translation', description: 'Multi-language translation' },
  { value: 'summarization', label: 'Summarization', description: 'Document summaries, meeting notes' },
  { value: 'creative_writing', label: 'Creative Writing', description: 'Stories, scripts, creative content' },
  { value: 'technical', label: 'Technical Writing', description: 'Documentation, code explanations' }
];

const MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Fast & Balanced)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (High Quality)' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Long Content)' },
  { value: 'claude-opus-4', label: 'Claude Opus 4 (Advanced)' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Research)' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Quick)' }
];

export default function ModelPreferencesManager() {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({});

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: savedPreferences = [], isLoading } = useQuery({
    queryKey: ['model-preferences', user?.id],
    queryFn: async () => {
      const prefs = await base44.entities.ModelPreference.filter({ created_by: user.email });
      const prefsMap = {};
      prefs.forEach(p => {
        prefsMap[p.task_type] = { model: p.preferred_model, auto: p.auto_select, id: p.id };
      });
      setPreferences(prefsMap);
      return prefs;
    },
    enabled: !!user
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises = [];
      
      for (const [taskType, pref] of Object.entries(preferences)) {
        if (pref.id) {
          promises.push(
            base44.entities.ModelPreference.update(pref.id, {
              preferred_model: pref.model,
              auto_select: pref.auto
            })
          );
        } else {
          promises.push(
            base44.entities.ModelPreference.create({
              task_type: taskType,
              preferred_model: pref.model,
              auto_select: pref.auto
            })
          );
        }
      }
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-preferences']);
      toast.success('Model preferences saved');
    },
    onError: (error) => {
      toast.error('Failed to save preferences: ' + error.message);
    }
  });

  const handleModelChange = (taskType, model) => {
    setPreferences(prev => ({
      ...prev,
      [taskType]: { ...prev[taskType], model }
    }));
  };

  const handleAutoChange = (taskType, auto) => {
    setPreferences(prev => ({
      ...prev,
      [taskType]: { ...prev[taskType], auto }
    }));
  };

  if (isLoading) {
    return <Loader2 className="w-6 h-6 animate-spin text-purple-500" />;
  }

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-purple-500" />
          Model Preferences by Task Type
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {TASK_TYPES.map((taskType) => {
          const pref = preferences[taskType.value] || { model: 'gpt-4o', auto: true };
          
          return (
            <div key={taskType.value} className="p-4 bg-[#0D0D0D] rounded-lg space-y-3">
              <div>
                <div className="text-white font-semibold">{taskType.label}</div>
                <div className="text-xs text-gray-500">{taskType.description}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 text-sm">Default Model</Label>
                <Select
                  value={pref.model}
                  onValueChange={(value) => handleModelChange(taskType.value, value)}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-400 text-sm">Auto-select based on complexity</Label>
                <Switch
                  checked={pref.auto}
                  onCheckedChange={(checked) => handleAutoChange(taskType.value, checked)}
                />
              </div>
            </div>
          );
        })}

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}