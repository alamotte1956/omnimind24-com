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
Required environment variables (see `.env.example` for full list):

```env
# Base44 Configuration (Required)
VITE_BASE44_PROJECT_ID=your_project_id_here
VITE_BASE44_API_URL=https://api.base44.com

# Stripe Configuration (Required)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google OAuth (Required)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Error Logging & Monitoring (Optional for production)
VITE_SENTRY_DSN=https://...@sentry.io/...

# AI Provider Keys (Optional)
VITE_OPENAI_API_KEY=sk_...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_API_KEY=...

# Other Optional
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

**Environment Validation**: The application validates all required environment variables at startup using Zod schema validation. If any required variables are missing, the app will display an error message and refuse to start.

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

## 🧪 Testing

### Run Tests
```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage
The project includes comprehensive tests for:
- **Input Sanitization**: XSS and injection prevention
- **Error Handling**: Error categorization and sanitization
- **Utility Functions**: Core functionality validation

Current test coverage targets:
- Lines: >50%
- Functions: >50%
- Branches: >50%
- Statements: >50%

### Writing Tests
Tests are located in `__tests__` directories next to the files they test:
```
src/lib/__tests__/
  ├── sanitizer.test.js
  ├── errorHandler.test.js
  └── setup.js
```

Example test:
```javascript
import { describe, it, expect } from 'vitest'
import { sanitizeText } from '../sanitizer'

describe('sanitizeText', () => {
  it('should remove HTML tags', () => {
    const input = '<p>Hello</p>'
    const result = sanitizeText(input)
    expect(result).not.toContain('<p>')
    expect(result).toContain('Hello')
  })
})
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
Centralized error handling with Sentry integration for production:

```javascript
import { handleError, showErrorToast } from '@/lib/errorHandler';

try {
  await apiCall();
} catch (error) {
  const errorInfo = handleError(error, 'operation-context');
  showErrorToast(errorInfo);
}
```

**Production Error Tracking**: 
- Errors are automatically sent to Sentry when `VITE_SENTRY_DSN` is configured
- In development, errors are logged to the console
- Error messages are sanitized to prevent information leakage
- Source maps are enabled when Sentry is configured for better error tracking

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

### Pre-deployment Checklist
Before deploying to production:

- [ ] All environment variables are set correctly
- [ ] `VITE_SENTRY_DSN` is configured for error tracking
- [ ] Stripe keys are production keys (not test keys)
- [ ] Run tests: `npm run test:run`
- [ ] Run linter: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Preview build works: `npm run preview`

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. The `dist/` folder contains the production-ready application

3. Deploy to your hosting provider (Vercel, Netlify, Base44, etc.)

### Base44 Integration
1. Connect your Base44 project to this frontend
2. Configure environment variables in Base44
3. Set up authentication entities (User, Session)
4. Deploy and test the integration

### Authentication Setup
The application requires the following Base44 entities to be configured:

**User Entity**:
- Fields: `email`, `password_hash`, `google_id`, `name`, `profile_picture`, `email_verified`, `is_active`, `last_login_at`, `failed_login_attempts`, `locked_until`

**Session Entity**:
- Fields: `user_id`, `token`, `ip_address`, `user_agent`, `expires_at`, `is_active`, `revoked_at`

**RateLimitLog Entity** (already exists):
- Used for API rate limiting

See `DATABASE_SCHEMA.md` for detailed schema definitions.

## 📊 Monitoring

### Error Logging & Monitoring
The application integrates with Sentry for production error tracking:

**Setup Sentry**:
1. Create a Sentry account at https://sentry.io/
2. Create a new project for your application
3. Copy the DSN from your project settings
4. Add `VITE_SENTRY_DSN=your-dsn-here` to your `.env` file
5. Sentry will automatically:
   - Capture all JavaScript errors
   - Track performance metrics
   - Record session replays on errors
   - Send source maps for better stack traces

**Configuration**:
```javascript
// Automatically initialized in errorHandler.js when VITE_SENTRY_DSN is set
- Trace sample rate: 10% of transactions
- Replay on error: 100% of sessions with errors
- Replay sample rate: 10% of normal sessions
```

### Performance Monitoring
The app includes built-in performance monitoring:
- Component render times
- Memory usage tracking
- Performance warnings for slow renders

### Error Tracking
Comprehensive error handling and logging:
- Sanitized error messages
- Error categorization (Network, Auth, Validation, Server)
- Performance impact tracking
- Production errors sent to Sentry

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

**Built with ❤️ using modern web technologies**# Trigger Base44 Deployment
