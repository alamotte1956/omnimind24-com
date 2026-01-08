import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Upload, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BASE_MODELS = {
  openai: ['gpt-3.5-turbo', 'gpt-4o-mini', 'davinci-002', 'babbage-002'],
  anthropic: ['claude-3-haiku-20240307'],
  google: ['gemini-1.0-pro-001'],
  groq: ['llama-3.1-8b', 'mixtral-8x7b'],
  cohere: ['command-light']
};

export default function FineTuneManager() {
  const [modelName, setModelName] = useState('');
  const [provider, setProvider] = useState('openai');
  const [baseModel, setBaseModel] = useState('');
  const [taskType, setTaskType] = useState('content_generation');
  const [trainingFile, setTrainingFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['apiKeys', user?.id],
    queryFn: async () => {
      const keys = await base44.entities.APIKey.filter({ created_by: user.email });
      return keys;
    },
    enabled: !!user
  });

  const { data: fineTunedModels = [] } = useQuery({
    queryKey: ['fineTunedModels'],
    queryFn: () => base44.entities.FineTunedModel.list('-created_date'),
    enabled: !!user
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const response = await base44.integrations.Core.UploadFile({ file });
      return response.file_url;
    },
    onSuccess: (fileUrl) => {
      toast.success('Training file uploaded');
      return fileUrl;
    },
    onError: () => {
      toast.error('Failed to upload file');
    }
  });

  const startFineTuneMutation = useMutation({
    mutationFn: async (data) => {
      const fileUrl = await uploadMutation.mutateAsync(trainingFile);
      
      const model = await base44.entities.FineTunedModel.create({
        model_name: data.modelName,
        provider: data.provider,
        base_model: data.baseModel,
        task_type: data.taskType,
        training_file_url: fileUrl,
        status: 'uploading'
      });

      await base44.functions.invoke('startFineTuning', {
        fine_tune_id: model.id,
        provider: data.provider,
        base_model: data.baseModel,
        training_file_url: fileUrl
      });

      return model;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fineTunedModels']);
      toast.success('Fine-tuning started! This may take several hours.');
      setModelName('');
      setTrainingFile(null);
    },
    onError: (error) => {
      toast.error('Failed to start fine-tuning: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FineTunedModel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['fineTunedModels']);
      toast.success('Fine-tuned model deleted');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => 
      base44.entities.FineTunedModel.update(id, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['fineTunedModels']);
      toast.success('Model status updated');
    }
  });

  const providerHasKey = apiKeys.some(k => k.provider === provider && k.is_active);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!providerHasKey) {
      toast.error(`Please add your ${provider} API key in Settings first`);
      return;
    }

    if (!modelName || !baseModel || !trainingFile) {
      toast.error('Please fill all fields and upload a training file');
      return;
    }

    startFineTuneMutation.mutate({ modelName, provider, baseModel, taskType });
  };

  const getStatusBadge = (status) => {
    const config = {
      uploading: { color: 'bg-blue-500', icon: Upload, text: 'Uploading' },
      training: { color: 'bg-yellow-500', icon: Loader2, text: 'Training', spin: true },
      completed: { color: 'bg-green-500', icon: CheckCircle, text: 'Ready' },
      failed: { color: 'bg-red-500', icon: AlertCircle, text: 'Failed' }
    }[status];

    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className={`w-3 h-3 mr-1 ${config.spin ? 'animate-spin' : ''}`} />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Fine-Tune Your Own Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Model Name</Label>
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="My Custom Model"
                  className="bg-[#0D0D0D] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Task Type</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content_generation">Content Generation</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="translation">Translation</SelectItem>
                    <SelectItem value="summarization">Summarization</SelectItem>
                    <SelectItem value="creative_writing">Creative Writing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                  </SelectContent>
                </Select>
                {!providerHasKey && (
                  <p className="text-xs text-red-400 mt-1">⚠️ API key required</p>
                )}
              </div>
              <div>
                <Label className="text-gray-300">Base Model</Label>
                <Select value={baseModel} onValueChange={setBaseModel}>
                  <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                    <SelectValue placeholder="Select base model" />
                  </SelectTrigger>
                  <SelectContent>
                    {BASE_MODELS[provider]?.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Training Data (JSONL format)</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="file"
                  accept=".jsonl,.txt"
                  onChange={(e) => setTrainingFile(e.target.files[0])}
                  className="bg-[#0D0D0D] border-gray-700 text-white"
                />
                {trainingFile && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload a JSONL file with training examples. Format: {`{"prompt": "...", "completion": "..."}`}
              </p>
            </div>

            <Button
              type="submit"
              disabled={startFineTuneMutation.isPending || !providerHasKey}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {startFineTuneMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Fine-Tune...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Fine-Tuning
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Your Fine-Tuned Models</CardTitle>
        </CardHeader>
        <CardContent>
          {fineTunedModels.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No fine-tuned models yet. Create your first one above!
            </p>
          ) : (
            <div className="space-y-3">
              {fineTunedModels.map(model => (
                <div key={model.id} className="p-4 bg-[#0D0D0D] rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{model.model_name}</h3>
                        {getStatusBadge(model.status)}
                        {model.is_active && (
                          <Badge className="bg-purple-600 text-white">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {model.provider} • {model.base_model} • {model.task_type.replace('_', ' ')}
                      </p>
                      {model.status === 'completed' && model.fine_tuned_model_id && (
                        <p className="text-xs text-gray-400 mt-1">
                          Model ID: {model.fine_tuned_model_id}
                        </p>
                      )}
                      {model.error_message && (
                        <p className="text-xs text-red-400 mt-1">{model.error_message}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {model.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActiveMutation.mutate({ id: model.id, isActive: model.is_active })}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          {model.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(model.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-500 bg-opacity-10 rounded-lg border border-blue-500 border-opacity-20">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">📚 Fine-Tuning Tips</h4>
        <ul className="text-xs text-blue-300 space-y-1">
          <li>• Prepare at least 50-100 high-quality training examples</li>
          <li>• Use consistent formatting across all examples</li>
          <li>• Fine-tuning typically takes 20 minutes to several hours</li>
          <li>• OpenAI charges for training tokens (~$8 per 1M tokens for GPT-3.5)</li>
        </ul>
      </div>
    </div>
  );
}