import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Eye, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 Turbo' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude 3.5 Sonnet, Opus, Haiku' },
  { id: 'google', name: 'Google', description: 'Gemini Pro, Gemini 1.5 Pro' },
  { id: 'groq', name: 'Groq', description: 'Llama 3.1, Mixtral' },
  { id: 'perplexity', name: 'Perplexity', description: 'Sonar Models' },
  { id: 'cohere', name: 'Cohere', description: 'Command R+, Command R' }
];

export default function APIKeyManager() {
  const [newKeys, setNewKeys] = useState({});
  const [showKeys, setShowKeys] = useState({});
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

  const saveMutation = useMutation({
    mutationFn: async ({ provider, apiKey }) => {
      const existing = apiKeys.find(k => k.provider === provider);
      if (existing) {
        await base44.entities.APIKey.update(existing.id, { api_key: apiKey, is_active: true });
      } else {
        await base44.entities.APIKey.create({ provider, api_key: apiKey, is_active: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['apiKeys']);
      toast.success('API key saved securely');
      setNewKeys({});
    },
    onError: () => {
      toast.error('Failed to save API key');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.APIKey.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['apiKeys']);
      toast.success('API key removed');
    }
  });

  const maskKey = (key) => {
    if (!key || key.length < 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const handleSave = (provider) => {
    const key = newKeys[provider];
    if (!key || key.trim().length < 10) {
      toast.error('Please enter a valid API key');
      return;
    }
    saveMutation.mutate({ provider, apiKey: key.trim() });
  };

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-500" />
          API Key Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400 mb-4">
          Store your API keys securely. Keys are encrypted and only accessible to you.
        </p>
        
        {PROVIDERS.map((provider) => {
          const existingKey = apiKeys.find(k => k.provider === provider.id);
          const isEditing = newKeys[provider.id] !== undefined;
          const showKey = showKeys[provider.id];

          return (
            <div key={provider.id} className="p-4 bg-[#0D0D0D] rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-medium flex items-center gap-2">
                    {provider.name}
                    {existingKey && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="text-xs text-gray-500">{provider.description}</div>
                </div>
              </div>

              {existingKey && !isEditing ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-gray-700">
                    <Key className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-300 flex-1">
                      {showKey ? existingKey.api_key : maskKey(existingKey.api_key)}
                    </span>
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                      className="text-gray-400 hover:text-white"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewKeys(prev => ({ ...prev, [provider.id]: '' }))}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(existingKey.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    placeholder={`Enter ${provider.name} API key`}
                    value={newKeys[provider.id] || ''}
                    onChange={(e) => setNewKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                    className="flex-1 bg-[#1A1A1A] border-gray-700 text-white"
                  />
                  <Button
                    onClick={() => handleSave(provider.id)}
                    disabled={saveMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Save
                  </Button>
                  {existingKey && (
                    <Button
                      variant="ghost"
                      onClick={() => setNewKeys(prev => {
                        const updated = { ...prev };
                        delete updated[provider.id];
                        return updated;
                      })}
                      className="text-gray-400"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-4 p-3 bg-blue-500 bg-opacity-10 rounded-lg border border-blue-500 border-opacity-20">
          <p className="text-xs text-blue-400">
            💡 Your API keys are stored securely and encrypted. They are never shared and only used when you select the corresponding model.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}