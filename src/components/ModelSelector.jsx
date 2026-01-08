
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const MODELS = {
  base44: [
    { id: 'base44-default', name: 'Base44 AI', badge: 'Free' }
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', badge: 'Fast' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', badge: 'Smart' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', badge: 'Quick' }
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', badge: 'Best' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', badge: 'Pro' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', badge: 'Fast' }
  ],
  google: [
    { id: 'gemini-pro', name: 'Gemini Pro', badge: 'New' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', badge: 'Advanced' }
  ],
  groq: [
    { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', badge: 'Ultra Fast' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', badge: 'Fast' }
  ],
  perplexity: [
    { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large', badge: 'Web' }
  ],
  cohere: [
    { id: 'command-r-plus', name: 'Command R+', badge: 'RAG' },
    { id: 'command-r', name: 'Command R', badge: 'Fast' }
  ]
};

export default function ModelSelector({ selectedModel, onModelChange }) {
  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className="w-full bg-[#1A1A1A] border-gray-700 text-white">
        <SelectValue placeholder="Select AI Model" />
      </SelectTrigger>
      <SelectContent className="bg-[#1A1A1A] border-gray-700">
        {Object.entries(MODELS).map(([provider, models]) => (
          <div key={provider}>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
              {provider}
            </div>
            {models.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id}
                className="text-white hover:bg-gray-800"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{model.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {model.badge}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}