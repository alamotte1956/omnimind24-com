import { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { sanitize } from '@/lib/sanitizer';
import { toast } from 'sonner';

// Constants moved outside component to prevent recreation
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

const TASK_TYPE_OPTIONS = [
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email', label: 'Email' },
  { value: 'ad_copy', label: 'Ad Copy' },
  { value: 'video_script', label: 'Video Script' },
  { value: 'product_description', label: 'Product Description' },
  { value: 'technical_writing', label: 'Technical Writing' },
  { value: 'creative_writing', label: 'Creative Writing' },
  { value: 'business_proposal', label: 'Business Proposal' },
  { value: 'other', label: 'Other' }
];

const TemplateForm = memo(({ 
  template = null, 
  onSave, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = React.useState({
    name: template?.name || '',
    description: template?.description || '',
    content: template?.content || '',
    category: template?.category || 'other',
    task_type: template?.task_type || 'other',
    is_public: template?.is_public || false,
    tags: template?.tags || [],
    icon: template?.icon || 'FileText'
  });

  // Optimized change handlers with sanitization
  const handleInputChange = useCallback((field, sanitizeOptions = {}) => (e) => {
    const value = sanitize(e.target.value, { type: 'text', ...sanitizeOptions });
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleContentChange = useCallback((e) => {
    const value = sanitize(e.target.value, { type: 'html', maxLength: 5000 });
    setFormData(prev => ({ ...prev, content: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Template content is required');
      return;
    }

    try {
      await onSave({
        ...formData,
        name: sanitize(formData.name, { maxLength: 100 }),
        description: sanitize(formData.description, { maxLength: 500 }),
        content: formData.content,
        id: template?.id
      });
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }
  }, [formData, onSave, template]);

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">
          {template ? 'Edit Template' : 'Create New Template'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Template Name *</Label>
              <Input
                value={formData.name}
                onChange={handleInputChange('name', { maxLength: 100 })}
                placeholder="Enter template name"
                className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <Label className="text-gray-400">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-700">
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-white">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-gray-400">Description</Label>
            <Textarea
              value={formData.description}
              onChange={handleInputChange('description', { maxLength: 500 })}
              placeholder="Brief description of this template"
              className="bg-[#0D0D0D] border-gray-700 text-white mt-2 min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label className="text-gray-400">Task Type</Label>
            <Select 
              value={formData.task_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, task_type: value }))}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-gray-700">
                {TASK_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-400">Template Content *</Label>
            <Textarea
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Enter your template content here. Use variables like {{variable_name}} for dynamic content."
              className="bg-[#0D0D0D] border-gray-700 text-white mt-2 min-h-[200px]"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {{variable_name}} syntax for dynamic variables. Max 5000 characters.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                disabled={isLoading}
              />
              <Label className="text-gray-400">Make this template public</Label>
            </div>
            
            <div className="text-sm text-gray-500">
              {formData.content.length}/5000 characters
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                template ? 'Update Template' : 'Create Template'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

TemplateForm.displayName = 'TemplateForm';

export default TemplateForm;