import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Shield, LogOut, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  sessionManager, 
  securityEventLogger,
  AUTH_CONFIG 
} from '@/lib/authUtils';

/**
 * SessionManager Component
 * 
 * Monitors user session and provides:
 * - Session timeout warnings
 * - Automatic session refresh
 * - Inactivity detection
 * - Secure logout functionality
 */
export default function SessionManager({ children }) {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Activity tracking
  const updateActivity = useCallback(() => {
    sessionManager.updateLastActivity();
  }, []);

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    // Throttle activity updates to prevent excessive writes
    let lastUpdate = 0;
    const throttledUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 30000) { // Update at most every 30 seconds
        lastUpdate = now;
        updateActivity();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, throttledUpdate, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledUpdate);
      });
    };
  }, [updateActivity]);

  // Session monitoring
  useEffect(() => {
    const checkSession = () => {
      const session = sessionManager.getSession();
      
      if (!session) {
        // No valid session, redirect to login
        handleSessionExpired();
        return;
      }

      const remaining = session.expiresAt - Date.now();
      
      // Show warning when less than 5 minutes remaining
      if (remaining < 5 * 60 * 1000 && remaining > 0) {
        setTimeRemaining(remaining);
        setShowTimeoutWarning(true);
      } else {
        setShowTimeoutWarning(false);
      }

      // Check if session needs refresh
      if (sessionManager.needsRefresh()) {
        handleRefreshSession();
      }
    };

    // Check immediately
    checkSession();

    // Check every minute
    const interval = setInterval(checkSession, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (showTimeoutWarning && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            handleSessionExpired();
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showTimeoutWarning]);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the session
      sessionManager.refreshSession();
      
      // Log the refresh
      securityEventLogger.logEvent('session_refreshed');
      
      setShowTimeoutWarning(false);
      toast.success('Session extended');
    } catch (error) {
      securityEventLogger.logEvent('session_refresh_failed', { error: error.message });
      toast.error('Failed to extend session. Please log in again.');
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSessionExpired = () => {
    securityEventLogger.logEvent('session_expired');
    sessionManager.clearSession();
    toast.error('Your session has expired. Please log in again.');
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleLogout = () => {
    securityEventLogger.logEvent('user_logout');
    sessionManager.clearSession();
    base44.auth.logout();
  };

  const handleStayLoggedIn = () => {
    handleRefreshSession();
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}

      {/* Session Timeout Warning Dialog */}
      <Dialog open={showTimeoutWarning} onOpenChange={setShowTimeoutWarning}>
        <DialogContent className="bg-[#1A1A1A] border-gray-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Your session will expire in {formatTime(timeRemaining || 0)}.
              Would you like to stay logged in?
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <Shield className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300 text-sm">
              For your security, sessions automatically expire after a period of inactivity.
              Click "Stay Logged In" to continue your session.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
            <Button
              onClick={handleStayLoggedIn}
              disabled={isRefreshing}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Extending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Stay Logged In
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
