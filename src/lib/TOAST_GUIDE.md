# Toast Implementation Guide

This application uses both `sonner` and a custom toast system. Here's when to use each:

## Sonner (Primary Toast System)

**When to use:**
- User feedback for actions (success, error, info, warning)
- Form submission results
- API call responses
- Standard notifications

**Import:**
```javascript
import { toast } from 'sonner';
```

**Usage:**
```javascript
// Success
toast.success('Changes saved successfully!');

// Error
toast.error('Failed to save changes');

// Info with description
toast.info('Processing your request', {
  description: 'This may take a few moments'
});

// Custom duration
toast.success('Message', { duration: 5000 });
```

## Custom Toast System (components/ui/use-toast.jsx)

**When to use:**
- Complex toast content with custom components
- Toasts that need to be part of the component tree
- Special UI requirements not supported by sonner

**Import:**
```javascript
import { useToast } from '@/components/ui/use-toast';
```

**Usage:**
```javascript
const { toast } = useToast();

toast({
  title: "Custom Title",
  description: "Custom description",
  variant: "default" // or "destructive"
});
```

## Best Practices

1. **Prefer sonner** for most use cases - it's simpler and more performant
2. Use **custom toast** only when you need advanced customization
3. Keep toast messages **concise** (< 60 characters for title)
4. Include **actionable information** when showing errors
5. Use appropriate **duration** based on message importance:
   - Success: 3000ms (default)
   - Info: 4000ms
   - Warning: 5000ms
   - Error: 6000ms

## Examples from Codebase

### Error Handler Integration (sonner)
```javascript
import { toast } from 'sonner';
import { handleError } from '@/lib/errorHandler';

try {
  await saveData();
} catch (error) {
  const errorInfo = handleError(error, 'save-data');
  toast.error(errorInfo.message);
}
```

### Form Validation (sonner)
```javascript
const onSubmit = async (data) => {
  try {
    await submitForm(data);
    toast.success('Form submitted successfully!');
  } catch (error) {
    toast.error('Please check your inputs and try again');
  }
};
```
