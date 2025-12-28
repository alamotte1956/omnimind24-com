import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, X, CheckCircle2 } from 'lucide-react';

const TASK_TYPE_COLORS = {
  content_generation: 'bg-purple-500',
  analysis: 'bg-blue-500',
  translation: 'bg-green-500',
  summarization: 'bg-yellow-500',
  creative_writing: 'bg-pink-500',
  technical: 'bg-orange-500'
};

const TASK_TYPE_LABELS = {
  content_generation: 'Content Generation',
  analysis: 'Analysis',
  translation: 'Translation',
  summarization: 'Summarization',
  creative_writing: 'Creative Writing',
  technical: 'Technical'
};

export default function ContentIdeaCard({ idea, onCreateOrder, onDismiss }) {
  const statusIcon = {
    pending: <Lightbulb className="w-4 h-4 text-yellow-400" />,
    acted_upon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    dismissed: <X className="w-4 h-4 text-gray-500" />
  }[idea.status];

  return (
    <Card className={`bg-[#1A1A1A] border-gray-800 transition-all ${
      idea.status === 'pending' ? 'hover:border-purple-500' : 'opacity-60'
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            {statusIcon}
            <div>
              <CardTitle className="text-white text-base">{idea.title}</CardTitle>
              <Badge 
                className={`mt-2 ${TASK_TYPE_COLORS[idea.suggested_task_type]} text-white`}
              >
                {TASK_TYPE_LABELS[idea.suggested_task_type]}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm leading-relaxed">{idea.description}</p>
        
        <div className="bg-purple-500 bg-opacity-10 border border-purple-500 rounded-lg p-3">
          <p className="text-xs text-purple-300">
            <strong className="text-purple-200">Why this idea?</strong> {idea.reasoning}
          </p>
        </div>

        {idea.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              onClick={() => onCreateOrder(idea)}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Order
            </Button>
            <Button
              onClick={() => onDismiss(idea.id)}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {idea.status === 'acted_upon' && (
          <Badge className="bg-green-500 text-white">
            ✓ Order Created
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}