import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ShareContentDialog({ contentOrderId, trigger }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('comment');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ContentShare.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-shares']);
      setOpen(false);
      setEmail('');
      setMessage('');
      toast.success('Content shared successfully!');
    },
    onError: (error) => {
      toast.error('Failed to share: ' + error.message);
    }
  });

  const handleShare = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    
    shareMutation.mutate({
      content_order_id: contentOrderId,
      shared_with_email: email,
      permission,
      message,
      status: 'pending'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-gray-700">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#1A1A1A] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-gray-400">Share with (email)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="bg-[#0D0D0D] border-gray-700 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-400">Permission</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="comment">Can Comment</SelectItem>
                <SelectItem value="edit">Can Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-400">Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note about this content..."
              className="bg-[#0D0D0D] border-gray-700 text-white"
            />
          </div>

          <Button
            onClick={handleShare}
            disabled={shareMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {shareMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share Content
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}