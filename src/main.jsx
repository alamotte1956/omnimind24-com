import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { validateEnv, isDemoMode } from '@/lib/envValidator'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from '@/components/ErrorBoundary'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Validate environment variables before starting the app
try {
  validateEnv();
} catch (error) {
  console.error('Failed to start application:', error.message);
  // Show error in UI
  document.getElementById('root').innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0D0D0D; color: white; font-family: system-ui, -apple-system, sans-serif;">
      <div style="max-width: 600px; padding: 2rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Configuration Error</h1>
        <p style="color: #999; margin-bottom: 1rem;">The application is missing required environment variables.</p>
        <p style="color: #999; font-size: 0.875rem;">Please check the browser console for details.</p>
      </div>
    </div>
  `;
  throw error;
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id';

// Show demo mode banner if applicable
if (isDemoMode()) {
  console.log('%c🎭 DEMO MODE ACTIVE', 'background: #9333EA; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
  console.log('This is a preview version with mock data. Some features may be limited.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
)
