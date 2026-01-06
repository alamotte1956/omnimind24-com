import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Copy, CheckCircle, Loader2, MessageSquare, Star, 
  FolderOpen, Tag, Edit, Trash2, MoreVertical, X, Download, RefreshCw, Search,
  FileText, Music, Video
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ShareContentDialog from './ShareContentDialog';
import SEOPanel from './SEOPanel';
import ModelFeedbackDialog from './ModelFeedbackDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { sanitizeText } from '@/lib/sanitizer';

export default function ContentCard({ order, onCommentClick, onCancel }) {
  const queryClient = useQueryClient();
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(order.folder_id || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(order.title || '');
  const [showSEO, setShowSEO] = useState(false);

  const { data: folders = [] } = useQuery({
    queryKey: ['content-folders'],
    queryFn: () => base44.entities.ContentFolder.list('-created_date')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContentOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['content-orders']);
      toast.success('Content updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentOrder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['content-orders']);
      toast.success('Content deleted');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Content copied to clipboard');
  };

  const downloadContent = async (format = 'txt') => {
    if (format === 'txt') {
      const blob = new Blob([order.output_content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.title || 'content'}-${order.id}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Content downloaded');
    } else if (['pdf', 'docx', 'pptx'].includes(format)) {
      toast.loading(`Generating ${format.toUpperCase()}...`);
      try {
        const response = await base44.functions.invoke('exportContent', {
          content_order_id: order.id,
          format: format
        });
        
        toast.success(`${format.toUpperCase()} generated! Check your email for the download link.`);
      } catch (error) {
        toast.error(`Failed to generate ${format.toUpperCase()}`);
      }
    } else if (format === 'mp3') {
      toast.loading('Generating audio...');
      try {
        const response = await base44.functions.invoke('exportAudio', {
          content_order_id: order.id
        });
        
        toast.success('Audio generated! Check your email for the download link.');
      } catch (error) {
        toast.error('Failed to generate audio');
      }
    }
  };

  const refreshOrder = () => {
    queryClient.invalidateQueries(['content-orders']);
    toast.success('Refreshing...');
  };

  const toggleFavorite = () => {
    updateMutation.mutate({
      id: order.id,
      data: { is_favorite: !order.is_favorite }
    });
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    const tags = order.tags || [];
    if (!tags.includes(newTag.trim())) {
      updateMutation.mutate({
        id: order.id,
        data: { tags: [...tags, newTag.trim()] }
      });
      setNewTag('');
      setIsTagDialogOpen(false);
    }
  };

  const removeTag = (tagToRemove) => {
    const tags = order.tags || [];
    updateMutation.mutate({
      id: order.id,
      data: { tags: tags.filter(t => t !== tagToRemove) }
    });
  };

  const moveToFolder = () => {
    updateMutation.mutate({
      id: order.id,
      data: { folder_id: selectedFolderId || null }
    });
    setIsFolderDialogOpen(false);
  };

  const updateTitle = () => {
    updateMutation.mutate({
      id: order.id,
      data: { title: title.trim() }
    });
    setIsEditingTitle(false);
  };

  return (
    <Card className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex gap-2 mb-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#0D0D0D] border-gray-700 text-white text-sm"
                  placeholder="Add title..."
                  onKeyDown={(e) => e.key === 'Enter' && updateTitle()}
                />
                <Button size="sm" onClick={updateTitle}>Save</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                {order.title && <h3 className="text-white font-semibold">{order.title}</h3>}
                {!order.title && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingTitle(true)}
                    className="text-gray-500 hover:text-white"
                  >
                    Add title
                  </Button>
                )}
                {order.title && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className="bg-purple-500 text-white capitalize">
                {order.task_type.replace('_', ' ')}
              </Badge>
              {order.status === 'completed' && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              )}
              {order.status === 'processing' && (
                <>
                  <Badge className="bg-blue-500 text-white">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshOrder}
                    className="ml-2 border-gray-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onCancel && onCancel(order.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
              {order.status === 'failed' && (
                <Badge className="bg-red-500 text-white">
                  Failed
                </Badge>
              )}
            </div>

            {order.tags && order.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {order.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="border-gray-700 text-xs"
                  >
                    {tag}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              {format(new Date(order.created_date), 'MMM dd, HH:mm')}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFavorite}
              className={order.is_favorite ? "text-yellow-400" : "text-gray-400"}
            >
              <Star className={`w-4 h-4 ${order.is_favorite ? 'fill-yellow-400' : ''}`} />
            </Button>
            
            {order.status === 'completed' && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-gray-700 hover:bg-green-600"
                      title="Download content"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1A1A1A] border-gray-800">
                    <DropdownMenuItem onClick={() => downloadContent('txt')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Download TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadContent('pdf')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadContent('docx')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Download DOCX
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadContent('pptx')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Download PPTX
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadContent('mp3')}>
                      <Music className="w-4 h-4 mr-2" />
                      Download MP3
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(order.output_content)}
                  className="border-gray-700 hover:bg-purple-600"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <ShareContentDialog contentOrderId={order.id} />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onCommentClick(order.id)}
                  className="border-gray-700 hover:bg-purple-600"
                  title="Add comment"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <ModelFeedbackDialog orderId={order.id} modelId={order.model_used} trigger={
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-gray-700 hover:bg-yellow-600"
                    title="Rate quality"
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                } />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setShowSEO(!showSEO)}
                  className="border-gray-700 hover:bg-purple-600"
                  title="SEO Analysis"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="border-gray-700">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1A1A1A] border-gray-800">
                <DropdownMenuItem onClick={() => setIsTagDialogOpen(true)}>
                  <Tag className="w-4 h-4 mr-2" />
                  Add Tag
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFolderDialogOpen(true)}>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Move to Folder
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => deleteMutation.mutate(order.id)}
                  className="text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {order.output_content && (
          <div className="bg-[#0D0D0D] rounded-lg p-4 text-gray-300 text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
            {sanitizeText(order.output_content, 50000)}
          </div>
        )}

        <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter tag name..."
                className="bg-[#0D0D0D] border-gray-700 text-white"
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} className="w-full bg-purple-600 hover:bg-purple-700">
                Add Tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Move to Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  <SelectItem value={null}>No Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={moveToFolder} className="w-full bg-purple-600 hover:bg-purple-700">
                Move
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {showSEO && order.status === 'completed' && (
          <div className="mt-4">
            <SEOPanel contentOrderId={order.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}