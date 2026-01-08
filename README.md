# OmniMind24 Frontend Application

A modern, secure, and performant standalone React frontend for the OmniMind24 business intelligence orchestrator.

## 🚀 Features

### Core Functionality
- **Business Intelligence Dashboard**: Real-time analytics and insights
- **AI-Powered Content Generation**: Multi-provider AI integration (OpenAI, Anthropic, Google Gemini)
- **User Management**: Role-based access control with JWT authentication
- **Payment Processing**: Stripe integration for subscriptions and credits
- **Template Library**: Dynamic content templates with virtualization
- **Admin Panel**: Comprehensive administration interface

### Security Features
- **Input Sanitization**: Comprehensive XSS and injection prevention
- **Secure Key Management**: Enhanced Stripe key handling
- **Error Handling**: Sanitized error messages without information leakage
- **Authentication**: JWT-based authentication with secure token storage

### Performance Optimizations
- **Virtual Scrolling**: Efficient handling of large datasets
- **Component Optimization**: React.memo, useCallback, useMemo implementations
- **Memory Management**: Proper cleanup and leak prevention
- **Performance Monitoring**: Real-time performance tracking
- **Optimized Bundle**: ~39KB smaller after removing Base44 SDK

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
- **Custom API Client**: Lightweight fetch-based HTTP client
- **Stripe**: Payment processing
- **React Router**: Client-side routing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server (see Backend Requirements below)

### Setup
```bash
# Clone the repository
git clone https://github.com/alamotte1956/omnimind24-com.git
cd omnimind24-com

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your environment variables
```

### Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Authentication
VITE_JWT_SECRET=your-jwt-secret-here

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic Configuration
VITE_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google AI Configuration
VITE_GOOGLE_AI_API_KEY=your-google-ai-key-here

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key-here

# AWS S3 Configuration (for file uploads)
VITE_AWS_S3_BUCKET=your-bucket-name
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
VITE_AWS_REGION=us-east-1

# SendGrid Configuration (for emails)
VITE_SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
VITE_SENDGRID_FROM_EMAIL=noreply@omnimind24.com

# Optional
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Application Settings
VITE_APP_NAME=OmniMind24
VITE_APP_URL=http://localhost:5173
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

## 🔌 Backend API Requirements

This frontend requires a backend API server at `VITE_API_BASE_URL` (default: `http://localhost:3000/api`).

### Required Endpoints

#### Authentication
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (optional)

#### Entities
For each entity (users, documents, orders, credits, etc.):
- `GET /api/{entity}` - List entities (supports `?sort=`, `?limit=`, `?filter=`)
- `GET /api/{entity}/:id` - Get entity by ID
- `POST /api/{entity}` - Create entity
- `PUT /api/{entity}/:id` - Update entity
- `PATCH /api/{entity}/:id` - Partial update
- `DELETE /api/{entity}/:id` - Delete entity

#### Functions
- `POST /api/functions/:name` - Invoke backend function

#### Integrations
- `POST /api/integrations/llm` - Invoke LLM (OpenAI, Anthropic)
- `POST /api/integrations/email` - Send email via SendGrid
- `POST /api/integrations/upload` - Upload file to S3
- `POST /api/integrations/image` - Generate image with DALL-E

### API Client Usage

```javascript
import { apiClient } from '@/api/apiClient';

// Get current user
const user = await apiClient.auth.me();

// Login
const response = await apiClient.auth.login(email, password);

// Query entities
const orders = await apiClient.entities.ContentOrder.list('-created_date');

// Create entity
await apiClient.entities.Document.create(data);

// Invoke function
await apiClient.functions.invoke('chatWithLLM', params);
```

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for complete API documentation.

## 🚀 Deployment

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider (Netlify, Vercel, AWS S3, etc.)

3. Configure environment variables in your hosting provider

### Backend Deployment
1. Deploy your backend API server
2. Update `VITE_API_BASE_URL` to point to production API
3. Configure CORS to allow your frontend domain
4. Set up SSL/TLS certificates

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