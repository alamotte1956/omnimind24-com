import React, { memo, useMemo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Search, Edit, Trash2, Star, Copy, Filter, 
  FileText, Mail, MessageSquare, Video, Briefcase 
} from 'lucide-react';
import { sanitize } from '@/lib/sanitizer';
import { toast } from 'sonner';

// Constants moved outside component
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

const TASK_TYPE_LABELS = {
  blog_post: 'Blog Post',
  social_media: 'Social Media',
  email: 'Email',
  ad_copy: 'Ad Copy',
  video_script: 'Video Script',
  product_description: 'Product Description',
  technical_writing: 'Technical Writing',
  creative_writing: 'Creative Writing',
  business_proposal: 'Business Proposal',
  other: 'Other'
};

const ICON_MAP = {
  FileText, Mail, MessageSquare, Video, Briefcase
};

// Virtualized list component for performance
const VirtualizedList = memo(({ items, itemHeight = 120, containerHeight = 600, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="border border-gray-700 rounded-lg bg-[#0D0D0D]"
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: item.index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

const TemplateList = memo(({ 
  templates = [], 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleFavorite,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Memoized filtered and sorted templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      const matchesFavorite = !showFavoritesOnly || template.is_favorite;
      
      return matchesSearch && matchesCategory && matchesFavorite;
    });

    // Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'popular':
          return (b.usage_count || 0) - (a.usage_count || 0);
        default:
          return 0;
      }
    });
  }, [templates, searchTerm, filterCategory, showFavoritesOnly, sortBy]);

  // Memoized handlers
  const handleEdit = useCallback((template) => {
    onEdit(template);
  }, [onEdit]);

  const handleDelete = useCallback(async (template) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await onDelete(template.id);
        toast.success('Template deleted successfully');
      } catch (error) {
        toast.error('Failed to delete template');
      }
    }
  }, [onDelete]);

  const handleDuplicate = useCallback((template) => {
    const duplicated = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined
    };
    onEdit(duplicated);
  }, [onEdit]);

  const handleToggleFavorite = useCallback(async (template) => {
    try {
      await onToggleFavorite(template.id, !template.is_favorite);
      toast.success(template.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  }, [onToggleFavorite]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(sanitize(e.target.value, { maxLength: 100 }));
  }, []);

  // Render individual template item
  const renderTemplateItem = useCallback((template) => {
    const IconComponent = ICON_MAP[template.icon] || FileText;
    
    return (
      <Card className="m-2 bg-[#1A1A1A] border-gray-700 hover:border-purple-500 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <h3 className="text-white font-medium truncate">
                  {sanitize(template.name)}
                </h3>
                {template.is_favorite && (
                  <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                )}
              </div>
              
              <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                {sanitize(template.description, { maxLength: 100 })}
              </p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  {CATEGORY_LABELS[template.category] || template.category}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  {TASK_TYPE_LABELS[template.task_type] || template.task_type}
                </Badge>
                {template.is_public && (
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    Public
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleFavorite(template)}
                className="text-gray-400 hover:text-yellow-400"
              >
                <Star className={`w-4 h-4 ${template.is_favorite ? 'fill-current text-yellow-400' : ''}`} />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDuplicate(template)}
                className="text-gray-400 hover:text-blue-400"
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(template)}
                className="text-gray-400 hover:text-purple-400"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(template)}
                className="text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
            <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
            {template.usage_count > 0 && (
              <span>{template.usage_count} uses</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }, [handleEdit, handleDelete, handleDuplicate, handleToggleFavorite]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="bg-[#0D0D0D] border-gray-700 text-white pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white min-w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-white">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-700">
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={showFavoritesOnly}
                onCheckedChange={setShowFavoritesOnly}
              />
              <span className="text-gray-400 text-sm">Favorites only</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
        </span>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="text-gray-400 hover:text-white"
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Template List */}
      {filteredTemplates.length === 0 ? (
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No templates found</h3>
            <p className="text-gray-400">
              {searchTerm || filterCategory !== 'all' || showFavoritesOnly
                ? 'Try adjusting your filters or search terms'
                : 'Create your first template to get started'}
            </p>
          </CardContent>
        </Card>
      ) : filteredTemplates.length > 10 ? (
        <VirtualizedList
          items={filteredTemplates}
          itemHeight={120}
          containerHeight={600}
          renderItem={renderTemplateItem}
        />
      ) : (
        <div className="space-y-2">
          {filteredTemplates.map(renderTemplateItem)}
        </div>
      )}
    </div>
  );
});

TemplateList.displayName = 'TemplateList';

export default TemplateList;