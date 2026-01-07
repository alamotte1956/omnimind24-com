import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    context: '',
    objective: '',
    style: '',
    tone: '',
    audience: '',
    response_format: ''
  });

  const { data: _user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const profile = await base44.entities.CostarProfile.create({
        ...data,
        is_active: true
      });

      await base44.auth.updateMe({ costar_completed: true });
      
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Profile setup complete! Let\'s get you some credits.');
      navigate('/Credits');
    },
    onError: (error) => {
      toast.error('Failed to save profile: ' + error.message);
    }
  });

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    saveMutation.mutate(formData);
  };

  const steps = [
    {
      letter: 'C',
      title: 'Context',
      description: 'Tell us about your business background, industry, and unique challenges',
      field: 'context',
      placeholder: 'e.g., I run a SaaS company in the health tech space serving hospitals...'
    },
    {
      letter: 'O',
      title: 'Objective',
      description: 'What are your primary business goals and what do you want to achieve?',
      field: 'objective',
      placeholder: 'e.g., Generate qualified leads, increase brand awareness, drive sales...'
    },
    {
      letter: 'S',
      title: 'Style',
      description: 'How should we communicate and present information to you?',
      field: 'style',
      placeholder: 'e.g., Direct and concise, detailed and thorough, creative and engaging...'
    },
    {
      letter: 'T',
      title: 'Tone',
      description: 'What voice and personality should our responses have?',
      field: 'tone',
      placeholder: 'e.g., Professional, friendly, warm, authoritative, conversational...'
    },
    {
      letter: 'A',
      title: 'Audience',
      description: 'Who is your target audience and who are you trying to reach?',
      field: 'audience',
      placeholder: 'e.g., Healthcare professionals aged 35-50, tech-savvy millennials...'
    },
    {
      letter: 'R',
      title: 'Response Format',
      description: 'How should we structure and format our responses to you?',
      field: 'response_format',
      placeholder: 'e.g., Bullet points, detailed reports, short summaries, step-by-step guides...'
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6">
      <Card className="bg-[#1A1A1A] border-gray-800 max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx + 1 <= step ? 'bg-purple-500 w-12' : 'bg-gray-700 w-8'
                  }`}
                />
              ))}
            </div>
            <CardTitle className="text-white text-2xl mb-2">
              C - O - S - T - A - R
            </CardTitle>
            <p className="text-gray-400 text-sm">6 questions to help A.I. find the best answers</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-4 p-4 bg-purple-500 bg-opacity-10 border border-purple-500 rounded-lg">
              <div className="text-purple-400 font-bold text-3xl mb-2">{currentStep.letter}</div>
              <div className="text-white font-semibold text-lg mb-1">{currentStep.title}</div>
              <div className="text-gray-400 text-sm">{currentStep.description}</div>
            </div>
            <Label className="text-white text-base mb-2 block">Your Response:</Label>
            <Textarea
              value={formData[currentStep.field]}
              onChange={(e) => setFormData({ ...formData, [currentStep.field]: e.target.value })}
              placeholder={currentStep.placeholder}
              className="bg-[#0D0D0D] border-gray-700 text-white min-h-[150px]"
            />
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Back
            </Button>
            
            {step < 6 ? (
              <Button
                onClick={handleNext}
                disabled={!formData[currentStep.field]}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!formData[currentStep.field] || saveMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}