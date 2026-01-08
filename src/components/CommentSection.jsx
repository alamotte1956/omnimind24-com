import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, CheckCircle, User } from 'lucide-react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CommentSection({ contentOrderId }) {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.auth.me()
  });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['content-comments', contentOrderId],
    queryFn: () => apiClient.entities.ContentComment.filter({ content_order_id: contentOrderId }, '-created_date'),
    initialData: []
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data) => {
      return await apiClient.entities.ContentComment.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-comments', contentOrderId]);
      setNewComment('');
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment: ' + error.message);
    }
  });

  const resolveCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      return await apiClient.entities.ContentComment.update(commentId, { is_resolved: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-comments', contentOrderId]);
      toast.success('Comment resolved');
    }
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addCommentMutation.mutate({
      content_order_id: contentOrderId,
      comment_text: newComment,
      author_email: user.email,
      author_name: user.full_name,
      is_resolved: false
    });
  };

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your feedback or comment..."
            className="bg-[#0D0D0D] border-gray-700 text-white"
          />
          <Button
            onClick={handleAddComment}
            disabled={addCommentMutation.isPending || !newComment.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg border ${
                comment.is_resolved
                  ? 'bg-green-900 bg-opacity-20 border-green-700'
                  : 'bg-[#0D0D0D] border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-purple-600">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{comment.author_name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(comment.created_date), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
                {!comment.is_resolved && comment.author_email === user?.email && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resolveCommentMutation.mutate(comment.id)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-gray-300 text-sm">{comment.comment_text}</p>
              {comment.is_resolved && (
                <Badge className="mt-2 bg-green-600 text-white">
                  Resolved
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}