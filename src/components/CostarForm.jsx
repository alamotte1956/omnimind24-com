import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from 'lucide-react';

export default function CostarForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    context: '',
    objective: '',
    style: '',
    tone: '',
    audience: '',
    responseFormat: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const fields = [
    {
      key: 'context',
      label: 'Context',
      placeholder: 'e.g., I am working on a marketing campaign for a new product launch...',
      description: 'What background information should the AI know? Include relevant details about your situation, project, or problem.',
      rows: 3
    },
    {
      key: 'objective',
      label: 'Objective',
      placeholder: 'e.g., Create a compelling product description that highlights unique features...',
      description: 'What specific goal do you want to achieve? Be clear about what you need the AI to help you accomplish.',
      rows: 3
    },
    {
      key: 'style',
      label: 'Style',
      placeholder: 'e.g., Professional yet conversational, data-driven, creative...',
      description: 'What writing or communication style should the AI use? Consider formality, creativity, and approach.',
      rows: 2
    },
    {
      key: 'tone',
      label: 'Tone',
      placeholder: 'e.g., Enthusiastic, authoritative, empathetic, neutral...',
      description: 'What emotional quality should the response have? Think about how you want the message to feel.',
      rows: 2
    },
    {
      key: 'audience',
      label: 'Audience',
      placeholder: 'e.g., Tech-savvy millennials, C-level executives, general consumers...',
      description: 'Who is the intended audience? Understanding your audience helps tailor the language and depth.',
      rows: 2
    },
    {
      key: 'responseFormat',
      label: 'Response Format',
      placeholder: 'e.g., Bullet points, step-by-step guide, paragraph format, JSON...',
      description: 'How should the output be structured? Specify the format that works best for your needs.',
      rows: 2
    }
  ];

  return (
    <Card className="bg-[#1A1A1A] border-gray-800 max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <CardTitle className="text-white text-2xl">COSTAR Framework</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Complete this questionnaire to help the AI understand your needs and deliver optimal results. This ensures you get the most value from your credits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-white text-base font-semibold">
                {field.label}
              </Label>
              <p className="text-sm text-gray-400 mb-2">{field.description}</p>
              <Textarea
                value={formData[field.key]}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                rows={field.rows}
                className="bg-[#0D0D0D] border-gray-700 text-white placeholder:text-gray-600"
                required
              />
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 bg-transparent border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Start AI Session
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}