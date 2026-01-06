import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Security headers plugin for development server
const securityHeadersPlugin = () => ({
  name: 'security-headers',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Content Security Policy - adjust as needed for your CDN/API domains
      res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.stripe.com https://*.base44.io wss://*.base44.io https://api.openai.com https://api.anthropic.com",
        "frame-src 'self' https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
      ].join('; '));
      
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      
      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Enable XSS filter in browsers
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Permissions policy (formerly Feature-Policy)
      res.setHeader('Permissions-Policy', [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=(self "https://js.stripe.com")'
      ].join(', '));
      
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  base: '/omnimind24-com/',
  plugins: [
    react(),
    securityHeadersPlugin()
  ],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    // Generate source maps for production error tracking with Sentry
    // Check for SENTRY_DSN via process.env at build time
    sourcemap: process.env.VITE_SENTRY_DSN ? true : false,
    // Minify output
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production unless Sentry is enabled (for fallback logging)
        drop_console: !process.env.VITE_SENTRY_DSN,
        drop_debugger: true
      }
    },
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      }
    }
  }
})
