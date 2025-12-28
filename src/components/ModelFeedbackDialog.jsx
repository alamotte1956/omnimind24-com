import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ModelFeedbackDialog({ orderId, modelId, trigger }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      // Find the performance log for this order
      const logs = await base44.entities.ModelPerformanceLog.filter({ 
        content_order_id: orderId 
      });
      
      if (logs.length > 0) {
        await base44.entities.ModelPerformanceLog.update(logs[0].id, {
          user_rating: rating,
          user_feedback: feedback
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-performance-logs']);
      toast.success('Feedback submitted! Thank you for helping improve our models.');
      setOpen(false);
      setRating(0);
      setFeedback('');
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    }
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    submitFeedbackMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-purple-400">
            <MessageSquare className="w-4 h-4 mr-1" />
            Rate Quality
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#1A1A1A] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Rate Model Quality</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-400 mb-3">How would you rate the quality of this content?</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Additional feedback (optional)</p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What worked well? What could be improved?"
              className="bg-[#0D0D0D] border-gray-700 text-white min-h-24"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitFeedbackMutation.isPending || rating === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}