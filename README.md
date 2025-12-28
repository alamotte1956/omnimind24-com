# OmniMind24 Frontend Application

A modern, secure, and performant React frontend for the OmniMind24 business intelligence orchestrator.

## 🚀 Features

### Core Functionality
- **Business Intelligence Dashboard**: Real-time analytics and insights
- **AI-Powered Content Generation**: Multi-provider AI integration (OpenAI, Anthropic, Google Gemini)
- **User Management**: Role-based access control with authentication
- **Payment Processing**: Stripe integration for subscriptions and credits
- **Template Library**: Dynamic content templates with virtualization
- **Admin Panel**: Comprehensive administration interface

### Security Features
- **Input Sanitization**: Comprehensive XSS and injection prevention
- **Secure Key Management**: Enhanced Stripe key handling
- **Error Handling**: Sanitized error messages without information leakage
- **Authentication**: Base44 SDK integration with secure auth flows

### Performance Optimizations
- **Virtual Scrolling**: Efficient handling of large datasets
- **Component Optimization**: React.memo, useCallback, useMemo implementations
- **Memory Management**: Proper cleanup and leak prevention
- **Performance Monitoring**: Real-time performance tracking

### Accessibility
- **WCAG Compliant**: Full keyboard navigation and screen reader support
- **ARIA Labels**: Proper semantic markup and landmarks
- **High Contrast Mode**: Enhanced visibility options
- **Reduced Motion**: Respects user motion preferences

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Vite 6**: Fast build tool and development server
- **TypeScript Ready**: Configured for TypeScript development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library

### State Management
- **TanStack Query**: Server state management and caching
- **React Hooks**: Local state management

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon library
- **Framer Motion**: Animation library
- **Recharts**: Data visualization

### Integration
- **Base44 SDK**: Backend integration
- **Stripe**: Payment processing
- **React Router**: Client-side routing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/alamotte1956/omnimind24-frontend.git
cd omnimind24-frontend

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your environment variables
```

### Environment Variables
```env
# Base44 Configuration
VITE_BASE44_APP_ID=6948a16137ff8a8e50ada4e6
VITE_BASE44_API_URL=https://api.base44.com

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_WEBHOOK_SECRET=whsec_...

# AI Provider Keys
VITE_OPENAI_API_KEY=sk_...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_API_KEY=...

# Optional
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 🚀 Development

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── TemplateForm.jsx
│   ├── TemplateList.jsx
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.jsx
│   ├── Admin.jsx
│   ├── Credits.jsx
│   └── ...
├── lib/                # Utility libraries
│   ├── sanitizer.js    # Input sanitization
│   ├── errorHandler.js # Error handling
│   ├── performance.js  # Performance monitoring
│   └── utils.js
├── api/                # API integration
│   ├── base44Client.js
│   ├── entities.js
│   └── functions.js
├── hooks/              # Custom React hooks
│   └── use-mobile.jsx
└── styles/             # Global styles
```

## 🔒 Security Features

### Input Sanitization
All user inputs are automatically sanitized using our comprehensive sanitization library:

```javascript
import { sanitize } from '@/lib/sanitizer';

// Sanitize text input
const cleanText = sanitize(userInput, { type: 'text', maxLength: 1000 });

// Sanitize HTML content
const cleanHTML = sanitize(htmlContent, { type: 'html', allowHTML: true });
```

### Error Handling
Centralized error handling with sanitized messages:

```javascript
import { handleError, showErrorToast } from '@/lib/errorHandler';

try {
  await apiCall();
} catch (error) {
  const errorInfo = handleError(error, 'operation-context');
  showErrorToast(errorInfo);
}
```

### Performance Monitoring
Built-in performance tracking for components:

```javascript
import { usePerformanceMonitor } from '@/lib/performance';

const MyComponent = () => {
  const metrics = usePerformanceMonitor('MyComponent');
  
  // Component performance is automatically tracked
  return <div>...</div>;
};
```

## 🎯 Performance Optimizations

### Virtual Scrolling
For large lists, use our virtualized list component:

```jsx
import VirtualizedList from '@/components/VirtualizedList';

<VirtualizedList
  items={largeDataSet}
  itemHeight={120}
  containerHeight={600}
  renderItem={renderItem}
/>
```

### Component Optimization
Components are optimized with React patterns:

```javascript
const OptimizedComponent = React.memo(({ data }) => {
  const expensiveValue = useMemo(() => 
    computeExpensiveValue(data), [data]
  );
  
  const handleClick = useCallback(() => {
    // Handle click
  }, [dependency]);
  
  return <div>{expensiveValue}</div>;
});
```

## ♿ Accessibility Features

### Keyboard Navigation
Full keyboard navigation support with proper focus management:

```jsx
<button
  onKeyDown={handleKeyDown}
  aria-label="Descriptive label"
  tabIndex={0}
>
  Accessible Button
</button>
```

### Screen Reader Support
Comprehensive ARIA label support:

```jsx
<div
  role="main"
  aria-label="Main content"
  aria-describedby="content-description"
>
  {/* Content */}
</div>
```

## 🔄 Base44 Integration

This frontend is designed to integrate seamlessly with Base44.com:

### Authentication
Uses Base44 SDK for authentication:

```javascript
import { base44 } from '@/api/base44Client';

// Get current user
const user = await base44.auth.me();

// Redirect to login
base44.auth.redirectToLogin(returnPath);
```

### Data Operations
Base44 entity operations:

```javascript
// Query data
const users = await base44.from('users').select('*');

// Mutate data
await base44.from('templates').insert(newTemplate);
```

## 🚀 Deployment

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider

### Base44 Integration
1. Connect your Base44 project to this frontend
2. Configure environment variables in Base44
3. Deploy and test the integration

## 📊 Monitoring

### Performance Monitoring
The app includes built-in performance monitoring:
- Component render times
- Memory usage tracking
- Performance warnings for slow renders

### Error Tracking
Comprehensive error handling and logging:
- Sanitized error messages
- Error categorization
- Performance impact tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the OmniMind24 business intelligence platform.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Built with ❤️ using modern web technologies**