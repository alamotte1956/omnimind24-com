import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, Plus, Edit, Trash2, Star, Users, Search, 
  Sparkles, Share2, Copy, HelpCircle, TrendingUp, MessageCircle, Tag, X
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/OnboardingGuard';
import TemplateReviewDialog from '../components/TemplateReviewDialog';
import { toast } from 'sonner';

const _ICON_OPTIONS = [
  'FileText', 'Mail', 'MessageSquare', 'Youtube', 'Instagram', 
  'Facebook', 'Twitter', 'Linkedin', 'Video', 'Megaphone',
  'ShoppingCart', 'Newspaper', 'BookOpen', 'Code', 'Briefcase'
];

const CATEGORY_LABELS = {
  blog: 'Blog Posts',
  social_media: 'Social Media',
  email: 'Email',
  ad_copy: 'Ad Copy',
  video: 'Video',
  technical: 'Technical',
  creative: 'Creative',
  business: 'Business',
  other: 'Other'
};

export default function TemplateLibrary() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTags, setSelectedTags] = useState([]);
  const [reviewDialogTemplateId, setReviewDialogTemplateId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    task_type: 'content_generation',
    prompt: '',
    credits: 20,
    is_public: false,
    icon: 'FileText',
    tags: []
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.auth.me()
  });

  const { data: myTemplates = [] } = useQuery({
    queryKey: ['user-templates'],
    queryFn: () => apiClient.entities.UserTemplate.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user
  });

  const { data: publicTemplates = [] } = useQuery({
    queryKey: ['public-templates'],
    queryFn: () => apiClient.entities.UserTemplate.filter({ is_public: true }, '-usage_count'),
    enabled: !!user
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => apiClient.entities.UserTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-templates']);
      queryClient.invalidateQueries(['public-templates']);
      setIsDialogOpen(false);
      resetForm();
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create template: ' + error.message);
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.UserTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-templates']);
      queryClient.invalidateQueries(['public-templates']);
      setIsDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update template: ' + error.message);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => apiClient.entities.UserTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-templates']);
      toast.success('Template deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete template: ' + error.message);
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      apiClient.entities.UserTemplate.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-templates']);
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }) => 
      apiClient.entities.UserTemplate.update(id, { is_featured: !isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-templates']);
      queryClient.invalidateQueries(['public-templates']);
      toast.success('Template featured status updated');
    }
  });

  const duplicateTemplateMutation = useMutation({
    mutationFn: async (template) => {
      const { id: _id, created_date: _created_date, updated_date: _updated_date, created_by: _created_by, usage_count: _usage_count, ...templateData } = template;
      return apiClient.entities.UserTemplate.create({
        ...templateData,
        name: `${template.name} (Copy)`,
        is_public: false,
        usage_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-templates']);
      toast.success('Template duplicated');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'other',
      task_type: 'content_generation',
      prompt: '',
      credits: 20,
      is_public: false,
      icon: 'FileText',
      tags: []
    });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      task_type: template.task_type,
      prompt: template.prompt,
      credits: template.credits,
      is_public: template.is_public,
      icon: template.icon || 'FileText',
      tags: template.tags || []
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.prompt) {
      toast.error('Name and prompt are required');
      return;
    }

    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const filteredMyTemplates = useMemo(() => {
    let filtered = myTemplates.filter(t => {
      const matchesSearch = !searchTerm || 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchesFavorite = !showFavoritesOnly || t.is_favorite;
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => t.tags?.includes(tag));
      return matchesSearch && matchesCategory && matchesFavorite && matchesTags;
    });

    // Sort templates
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.average_rating || 0) - (a.average_rating || 0);
      } else if (sortBy === 'popular') {
        return (b.usage_count || 0) - (a.usage_count || 0);
      } else if (sortBy === 'recent') {
        return new Date(b.created_date) - new Date(a.created_date);
      } else if (sortBy === 'lastUsed') {
        const aDate = a.last_used ? new Date(a.last_used) : new Date(0);
        const bDate = b.last_used ? new Date(b.last_used) : new Date(0);
        return bDate - aDate;
      }
      return 0;
    });

    return filtered;
  }, [myTemplates, searchTerm, filterCategory, showFavoritesOnly, selectedTags, sortBy]);

  const filteredPublicTemplates = useMemo(() => {
    let filtered = publicTemplates.filter(t => {
      const matchesSearch = !searchTerm || 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => t.tags?.includes(tag));
      return matchesSearch && matchesCategory && matchesTags && t.created_by !== user?.email;
    });

    // Sort public templates
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      
      if (sortBy === 'rating') {
        return (b.average_rating || 0) - (a.average_rating || 0);
      } else if (sortBy === 'popular') {
        return (b.usage_count || 0) - (a.usage_count || 0);
      } else if (sortBy === 'recent') {
        return new Date(b.created_date) - new Date(a.created_date);
      }
      return 0;
    });

    return filtered;
  }, [publicTemplates, searchTerm, filterCategory, selectedTags, user, sortBy]);

  const isAdmin = user?.access_level === 'admin';

  const allTags = useMemo(() => {
    const tags = new Set();
    [...myTemplates, ...publicTemplates].forEach(template => {
      if (template.tags && Array.isArray(template.tags)) {
        template.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [myTemplates, publicTemplates]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const TemplateCard = ({ template, isOwner }) => (
    <Card className={`bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all ${template.is_featured ? 'ring-2 ring-yellow-500' : ''}`}>
      <CardContent className="p-4">
        {template.is_featured && (
          <div className="mb-2">
            <Badge className="bg-yellow-600 text-white">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Featured
            </Badge>
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">{template.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
            </div>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavoriteMutation.mutate({ 
                id: template.id, 
                isFavorite: template.is_favorite 
              })}
              className="text-gray-400 hover:text-yellow-400"
            >
              <Star className={`w-4 h-4 ${template.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className="bg-purple-600/20 text-purple-400 border-purple-500">
            {CATEGORY_LABELS[template.category]}
          </Badge>
          <Badge variant="outline" className="border-gray-700 text-gray-400">
            {template.credits} credits
          </Badge>
          {template.is_public && (
            <Badge className="bg-green-600/20 text-green-400 border-green-500">
              <Users className="w-3 h-3 mr-1" />
              Shared
            </Badge>
          )}
          {template.usage_count > 0 && (
            <Badge variant="outline" className="border-gray-700 text-gray-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              {template.usage_count} uses
            </Badge>
          )}
          {template.average_rating > 0 && (
            <Badge variant="outline" className="border-yellow-600 text-yellow-400">
              <Star className="w-3 h-3 mr-1 fill-yellow-400" />
              {template.average_rating.toFixed(1)} ({template.review_count})
            </Badge>
          )}
        </div>

        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-gray-700 text-gray-400 text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {template.usage_count > 0 && (
          <div className="mb-3 p-2 bg-[#0D0D0D] rounded">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Popularity</span>
              <span className="text-purple-400 font-semibold">{template.usage_count} times</span>
            </div>
            {template.last_used && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400">Last used</span>
                <span className="text-gray-500">{new Date(template.last_used).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReviewDialogTemplateId(template.id)}
            className="w-full border-gray-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Reviews ({template.review_count || 0})
          </Button>

          <div className="flex gap-2">
            {isOwner ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="flex-1 border-gray-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeaturedMutation.mutate({ 
                      id: template.id, 
                      isFeatured: template.is_featured 
                    })}
                    className={`border-gray-700 ${template.is_featured ? 'bg-yellow-600/20' : ''}`}
                    title="Feature this template"
                  >
                    <Star className={`w-4 h-4 ${template.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateTemplateMutation.mutate(template)}
                  className="border-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="border-gray-700 hover:bg-red-600/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateTemplateMutation.mutate(template)}
                  className="flex-1 border-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to My Templates
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeaturedMutation.mutate({ 
                      id: template.id, 
                      isFeatured: template.is_featured 
                    })}
                    className={`border-gray-700 ${template.is_featured ? 'bg-yellow-600/20' : ''}`}
                    title="Feature this template"
                  >
                    <Star className={`w-4 h-4 ${template.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        </CardContent>
        </Card>
        );

  return (
    <AuthGuard>
      <OnboardingGuard>
        <TooltipProvider>
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Template Library</h1>
                  <p className="text-gray-400">Create, manage, and share custom content templates</p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-5 h-5 text-gray-500 hover:text-purple-400 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Save your favorite prompts as templates for quick reuse. Share templates with your team for consistency.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <Card className="bg-[#1A1A1A] border-gray-800 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#0D0D0D] border-gray-700 text-white"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full md:w-48 bg-[#0D0D0D] border-gray-700 text-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full md:w-48 bg-[#0D0D0D] border-gray-700 text-white">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="lastUsed">Recently Used</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={showFavoritesOnly ? "bg-yellow-600" : "border-gray-700"}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Favorites
                    </Button>
                  </div>

                  {allTags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Filter by Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedTags.includes(tag)
                                ? 'bg-purple-600 text-white'
                                : 'border-gray-700 text-gray-400 hover:border-purple-500'
                            }`}
                            onClick={() => toggleTag(tag)}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                            {selectedTags.includes(tag) && (
                              <X className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {myTemplates.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-[#0D0D0D] rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">{myTemplates.length}</p>
                        <p className="text-xs text-gray-400">Total Templates</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {myTemplates.reduce((sum, t) => sum + (t.usage_count || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-400">Total Uses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">
                          {myTemplates.filter(t => t.is_public).length}
                        </p>
                        <p className="text-xs text-gray-400">Shared</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="my-templates" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-templates">My Templates ({filteredMyTemplates.length})</TabsTrigger>
                <TabsTrigger value="team-templates">Team Library ({filteredPublicTemplates.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="my-templates">
                {filteredMyTemplates.length === 0 ? (
                  <Card className="bg-[#1A1A1A] border-gray-800">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-white text-lg mb-2">No templates yet</h3>
                      <p className="text-gray-400 mb-4">Create your first template to get started</p>
                      <Button
                        onClick={() => {
                          setEditingTemplate(null);
                          resetForm();
                          setIsDialogOpen(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMyTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} isOwner={true} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="team-templates">
                {filteredPublicTemplates.length === 0 ? (
                  <Card className="bg-[#1A1A1A] border-gray-800">
                    <CardContent className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-white text-lg mb-2">No shared templates</h3>
                      <p className="text-gray-400">Templates shared by your team will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPublicTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} isOwner={false} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="bg-[#1A1A1A] border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl">
                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-gray-400">Template Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Product Launch Email"
                      className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what this template is for..."
                      className="bg-[#0D0D0D] border-gray-700 text-white mt-2 h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-400">Task Type</Label>
                      <Select 
                        value={formData.task_type} 
                        onValueChange={(value) => setFormData({ ...formData, task_type: value })}
                      >
                        <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content_generation">Content Generation</SelectItem>
                          <SelectItem value="analysis">Analysis</SelectItem>
                          <SelectItem value="translation">Translation</SelectItem>
                          <SelectItem value="summarization">Summarization</SelectItem>
                          <SelectItem value="creative_writing">Creative Writing</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400">Template Prompt *</Label>
                    <Textarea
                      value={formData.prompt}
                      onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                      placeholder="Write your prompt template here..."
                      className="bg-[#0D0D0D] border-gray-700 text-white mt-2 h-32"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Credit Cost</Label>
                    <Input
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                      className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
                      min="1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Tags (comma-separated)</Label>
                    <Input
                      value={formData.tags?.join(', ') || ''}
                      onChange={(e) => {
                        const tagsArray = e.target.value
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0);
                        setFormData({ ...formData, tags: tagsArray });
                      }}
                      placeholder="e.g., marketing, email, B2B"
                      className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Add tags to help organize and search templates</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Share with Team</p>
                        <p className="text-sm text-gray-400">Make this template visible to everyone</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    className="border-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {editingTemplate ? 'Update' : 'Create'} Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <TemplateReviewDialog
              templateId={reviewDialogTemplateId}
              isOpen={!!reviewDialogTemplateId}
              onClose={() => setReviewDialogTemplateId(null)}
            />
          </div>
        </TooltipProvider>
      </OnboardingGuard>
    </AuthGuard>
  );
}