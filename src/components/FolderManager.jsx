import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Folder, FolderPlus, Edit, Trash2, ChevronRight, ChevronDown, Plus
} from 'lucide-react';
import { toast } from 'sonner';

const FOLDER_COLORS = [
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' }
];

export default function FolderManager({ onFolderSelect, selectedFolderId }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'purple',
    parent_folder_id: null
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['content-folders'],
    queryFn: () => base44.entities.ContentFolder.list('-created_date')
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['content-orders'],
    queryFn: () => base44.entities.ContentOrder.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentFolder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['content-folders']);
      setIsDialogOpen(false);
      resetForm();
      toast.success('Folder created');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContentFolder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['content-folders']);
      setIsDialogOpen(false);
      resetForm();
      toast.success('Folder updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentFolder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['content-folders']);
      toast.success('Folder deleted');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', color: 'purple', parent_folder_id: null });
    setEditingFolder(null);
  };

  const openCreateDialog = (parentId = null) => {
    resetForm();
    setFormData(prev => ({ ...prev, parent_folder_id: parentId }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description || '',
      color: folder.color,
      parent_folder_id: folder.parent_folder_id
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingFolder) {
      updateMutation.mutate({ id: editingFolder.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleExpand = (folderId) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const getContentCount = (folderId) => {
    return orders.filter(order => order.folder_id === folderId).length;
  };

  const getSubfolders = (parentId) => {
    return folders.filter(f => f.parent_folder_id === parentId);
  };

  const renderFolder = (folder, level = 0) => {
    const subfolders = getSubfolders(folder.id);
    const hasSubfolders = subfolders.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const contentCount = getContentCount(folder.id);
    const colorClass = FOLDER_COLORS.find(c => c.value === folder.color)?.class || 'bg-purple-500';

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors ${
            isSelected ? 'bg-purple-600/20 border border-purple-500' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          <div className="flex items-center gap-2 flex-1" onClick={() => onFolderSelect(folder.id)}>
            {hasSubfolders && (
              <button onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id); }}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}
            {!hasSubfolders && <div className="w-4" />}
            <div className={`w-3 h-3 rounded-full ${colorClass}`} />
            <Folder className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-white">{folder.name}</span>
            {contentCount > 0 && (
              <span className="text-xs text-gray-500">({contentCount})</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => { e.stopPropagation(); openCreateDialog(folder.id); }}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => { e.stopPropagation(); openEditDialog(folder); }}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-red-400"
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(folder.id); }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {hasSubfolders && isExpanded && (
          <div>
            {subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter(f => !f.parent_folder_id);
  const uncategorizedCount = orders.filter(order => !order.folder_id).length;

  return (
    <>
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">Folders</CardTitle>
          <Button
            size="sm"
            onClick={() => openCreateDialog()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          <div
            className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors ${
              selectedFolderId === null ? 'bg-purple-600/20 border border-purple-500' : ''
            }`}
            onClick={() => onFolderSelect(null)}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">All Content</span>
              {uncategorizedCount > 0 && (
                <span className="text-xs text-gray-500">({uncategorizedCount})</span>
              )}
            </div>
          </div>
          {rootFolders.map(folder => renderFolder(folder))}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingFolder ? 'Edit Folder' : 'Create New Folder'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter folder name..."
                className="bg-[#0D0D0D] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                className="bg-[#0D0D0D] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Color</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  {FOLDER_COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color.class}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editingFolder && formData.parent_folder_id && (
              <div className="text-sm text-gray-400">
                Creating subfolder in: {folders.find(f => f.id === formData.parent_folder_id)?.name}
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {editingFolder ? 'Update' : 'Create'} Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}