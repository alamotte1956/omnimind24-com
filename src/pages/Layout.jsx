import React from 'react';
import Sidebar from '../components/Sidebar';
import CreditMonitor from '../components/CreditMonitor';
import InteractiveTutorial from '../components/InteractiveTutorial';
import SupportChatbot from '../components/SupportChatbot';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white overflow-hidden">
      {/* Hidden accessibility components */}
      <CreditMonitor />
      <InteractiveTutorial />
      <SupportChatbot />
      
      {/* Global styles with accessibility improvements */}
      <style>
        {`
          :root {
            --background: #0D0D0D;
            --foreground: #FFFFFF;
            --primary: #9333EA;
            --primary-foreground: #FFFFFF;
            --focus-ring: 2px solid #9333EA;
            --high-contrast: #FFFFFF;
          }
          
          body {
            background: #0D0D0D;
            color: #FFFFFF;
          }
          
          /* Accessibility improvements */
          *:focus {
            outline: var(--focus-ring);
            outline-offset: 2px;
          }
          
          *:focus:not(:focus-visible) {
            outline: none;
          }
          
          *:focus-visible {
            outline: var(--focus-ring);
            outline-offset: 2px;
          }
          
          /* Skip to main content link for screen readers */
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
          }
          
          .skip-link:focus {
            top: 6px;
          }
          
          /* High contrast mode support */
          @media (prefers-contrast: high) {
            :root {
              --high-contrast: #FFFF00;
            }
            *:focus-visible {
              outline: 3px solid var(--high-contrast);
            }
          }
          
          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* Improved scrollbar styling */
          * {
            scrollbar-width: thin;
            scrollbar-color: #4B5563 #1F2937;
          }
          
          *::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          *::-webkit-scrollbar-track {
            background: #1F2937;
          }
          
          *::-webkit-scrollbar-thumb {
            background: #4B5563;
            border-radius: 4px;
          }
          
          *::-webkit-scrollbar-thumb:hover {
            background: #6B7280;
          }
        `}
      </style>
      
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      {/* Sidebar navigation */}
      <Sidebar currentPage={currentPageName} />
      
      {/* Main content area */}
      <main 
        id="main-content"
        className="flex-1 overflow-auto"
        role="main"
        aria-label="Main content"
        tabIndex="-1"
      >
        {children}
        
        {/* Footer with accessibility improvements */}
        <footer 
          className="mt-auto border-t border-gray-800 bg-[#0D0D0D] px-8 py-4"
          role="contentinfo"
          aria-label="Footer"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span aria-label="Copyright information">© 2025 OmniMind24. All rights reserved.</span>
              <a 
                href="/Privacy" 
                className="hover:text-purple-400 transition-colors focus:text-purple-400"
                aria-label="View Privacy Policy"
              >
                Privacy Policy
              </a>
              <a 
                href="/Terms" 
                className="hover:text-purple-400 transition-colors focus:text-purple-400"
                aria-label="View Terms of Service"
              >
                Terms of Service
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" aria-label="Platform information">
                Powered by AI • Secured by Stripe
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}