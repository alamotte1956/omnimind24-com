import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TemplateReviewDialog({ templateId, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['template-reviews', templateId],
    queryFn: () => base44.entities.TemplateReview.filter({ template_id: templateId }, '-created_date'),
    enabled: !!templateId
  });

  const { data: userReview } = useQuery({
    queryKey: ['user-template-review', templateId, user?.email],
    queryFn: async () => {
      const userReviews = await base44.entities.TemplateReview.filter({ 
        template_id: templateId,
        reviewer_email: user?.email 
      });
      return userReviews[0];
    },
    enabled: !!templateId && !!user
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data) => {
      if (userReview) {
        return base44.entities.TemplateReview.update(userReview.id, data);
      } else {
        return base44.entities.TemplateReview.create(data);
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['template-reviews']);
      queryClient.invalidateQueries(['user-template-review']);
      
      // Update template average rating
      const allReviews = await base44.entities.TemplateReview.filter({ template_id: templateId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await base44.entities.UserTemplate.update(templateId, {
        average_rating: avgRating,
        review_count: allReviews.length
      });
      
      queryClient.invalidateQueries(['user-templates']);
      queryClient.invalidateQueries(['public-templates']);
      
      setRating(0);
      setReviewText('');
      toast.success('Review submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit review: ' + error.message);
    }
  });

  const markHelpfulMutation = useMutation({
    mutationFn: ({ reviewId, currentCount }) => 
      base44.entities.TemplateReview.update(reviewId, { helpful_count: currentCount + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['template-reviews']);
      toast.success('Thanks for your feedback!');
    }
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    submitReviewMutation.mutate({
      template_id: templateId,
      rating,
      review_text: reviewText,
      reviewer_email: user.email,
      reviewer_name: user.full_name
    });
  };

  const renderStars = (value, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (interactive ? (hoveredStar || rating) : value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Template Reviews</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-[#0D0D0D] rounded-lg p-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">
                    {avgRating.toFixed(1)}
                  </div>
                  {renderStars(Math.round(avgRating))}
                  <p className="text-sm text-gray-400 mt-2">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter(r => r.rating === stars).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-400 w-8">{stars} ★</span>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Review Form */}
            <div className="border border-gray-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">
                {userReview ? 'Update Your Review' : 'Write a Review'}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Your Rating</p>
                  {renderStars(rating, true)}
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Your Review (optional)</p>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this template..."
                    className="bg-[#0D0D0D] border-gray-700 text-white h-24"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitReviewMutation.isPending || rating === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {submitReviewMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    userReview ? 'Update Review' : 'Submit Review'
                  )}
                </Button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">All Reviews</h3>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{review.reviewer_name}</span>
                          {review.reviewer_email === user?.email && (
                            <Badge className="bg-purple-600 text-xs">You</Badge>
                          )}
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(review.created_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {review.review_text && (
                      <p className="text-gray-300 text-sm mb-3">{review.review_text}</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpfulMutation.mutate({ 
                        reviewId: review.id, 
                        currentCount: review.helpful_count || 0 
                      })}
                      className="text-gray-400 hover:text-white"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Helpful ({review.helpful_count || 0})
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}