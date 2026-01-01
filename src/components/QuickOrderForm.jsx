import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import MediaUploader from './MediaUploader';


export default function QuickOrderForm({ initialPrompt = '', taskType = 'content_generation', onSubmit, isLoading }) {
  const [input, setInput] = useState(initialPrompt);
  const [uploadedFileUrls, setUploadedFileUrls] = useState([]);
  const [showCostar, setShowCostar] = useState(false);
  const [costarData, setCostarData] = useState({
    context: '',
    objective: '',
    style: '',
    tone: '',
    audience: '',
    response_format: ''
  });

  const handleFilesUploaded = (urls) => {
    setUploadedFileUrls(urls);
  };

  const handleSubmit = () => {
    if (input.trim()) {
      const orderData = {
        task_type: taskType,
        input_data: uploadedFileUrls.length > 0 
          ? `${input}\n\nAttached files: ${uploadedFileUrls.join(', ')}`
          : input,
        status: 'processing',
        ...(costarData.context && { costar_context: costarData.context }),
        ...(costarData.objective && { costar_objective: costarData.objective }),
        ...(costarData.style && { costar_style: costarData.style }),
        ...(costarData.tone && { costar_tone: costarData.tone }),
        ...(costarData.audience && { costar_audience: costarData.audience }),
        ...(costarData.response_format && { costar_response_format: costarData.response_format })
      };
      onSubmit(orderData);
    }
  };

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Quick Generate Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-400 mb-2 block">What content do you need?</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Write a blog post about AI trends in 2026..."
            rows={3}
            className="bg-[#0D0D0D] border-gray-700 text-white"
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-400 mb-2 block">Upload Media (Optional)</Label>
            <MediaUploader onFilesUploaded={handleFilesUploaded} />
          </div>

          {uploadedFileUrls.length > 0 && (
            <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3">
              <p className="text-xs text-green-300">
                ✓ {uploadedFileUrls.length} file(s) will be included with your content
              </p>
            </div>
          )}
        </div>

        {/* COSTAR Framework Section */}
        <div className="border-t border-gray-700 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowCostar(!showCostar)}
            className="w-full flex items-center justify-between text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              COSTAR Framework (Enhance AI Output)
            </span>
            {showCostar ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {showCostar && (
            <div className="mt-4 space-y-4 bg-[#0D0D0D] p-4 rounded-lg border border-gray-800">
              <p className="text-sm text-gray-400 mb-3">
                Add COSTAR parameters to significantly improve AI output quality and alignment with your needs.
              </p>

              <div className="space-y-2">
                <Label className="text-white text-sm">Context (Background Information)</Label>
                <Textarea
                  value={costarData.context}
                  onChange={(e) => setCostarData({ ...costarData, context: e.target.value })}
                  placeholder="e.g., I am working on a marketing campaign for a new product launch..."
                  rows={2}
                  className="bg-[#1A1A1A] border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white text-sm">Objective (Specific Goal)</Label>
                <Textarea
                  value={costarData.objective}
                  onChange={(e) => setCostarData({ ...costarData, objective: e.target.value })}
                  placeholder="e.g., Create a compelling product description that highlights unique features..."
                  rows={2}
                  className="bg-[#1A1A1A] border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Style</Label>
                  <Input
                    value={costarData.style}
                    onChange={(e) => setCostarData({ ...costarData, style: e.target.value })}
                    placeholder="e.g., Professional, conversational..."
                    className="bg-[#1A1A1A] border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Tone</Label>
                  <Input
                    value={costarData.tone}
                    onChange={(e) => setCostarData({ ...costarData, tone: e.target.value })}
                    placeholder="e.g., Enthusiastic, authoritative..."
                    className="bg-[#1A1A1A] border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Audience</Label>
                  <Input
                    value={costarData.audience}
                    onChange={(e) => setCostarData({ ...costarData, audience: e.target.value })}
                    placeholder="e.g., Tech-savvy millennials..."
                    className="bg-[#1A1A1A] border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Response Format</Label>
                  <Input
                    value={costarData.response_format}
                    onChange={(e) => setCostarData({ ...costarData, response_format: e.target.value })}
                    placeholder="e.g., Bullet points, paragraphs..."
                    className="bg-[#1A1A1A] border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}