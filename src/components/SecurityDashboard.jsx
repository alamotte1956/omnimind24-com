import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Clock, 
  Monitor, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Smartphone,
  Globe
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  sessionManager, 
  securityEventLogger,
  getSecurityStatus,
  AUTH_CONFIG 
} from '@/lib/authUtils';

/**
 * SecurityDashboard Component
 * 
 * Displays security-related information and settings for the user:
 * - Current session status
 * - Recent security events
 * - Device information
 * - Security recommendations
 */
export default function SecurityDashboard() {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [showDeviceId, setShowDeviceId] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    const status = getSecurityStatus();
    setSecurityStatus(status);
  }, []);

  const handleLogoutAllDevices = async () => {
    try {
      // Log the action
      securityEventLogger.logEvent('logout_all_devices');
      
      // Clear local session
      sessionManager.clearSession();
      
      // Logout through the SDK
      base44.auth.logout();
      
      toast.success('Logged out from all devices');
    } catch (error) {
      toast.error('Failed to logout from all devices');
    }
  };

  const handleClearSecurityEvents = () => {
    securityEventLogger.clearEvents();
    setSecurityStatus(getSecurityStatus());
    toast.success('Security event history cleared');
  };

  const formatEventTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'login_attempt':
      case 'login_page_visited':
        return <Key className="w-4 h-4 text-blue-400" />;
      case 'login_failed':
      case 'login_blocked_lockout':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'session_refreshed':
        return <RefreshCw className="w-4 h-4 text-green-400" />;
      case 'session_expired':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'user_logout':
        return <LogOut className="w-4 h-4 text-gray-400" />;
      default:
        return <Shield className="w-4 h-4 text-purple-400" />;
    }
  };

  const getEventLabel = (eventType) => {
    const labels = {
      'login_attempt': 'Login Attempt',
      'login_page_visited': 'Login Page Visited',
      'login_failed': 'Login Failed',
      'login_blocked_lockout': 'Login Blocked (Lockout)',
      'session_refreshed': 'Session Extended',
      'session_expired': 'Session Expired',
      'user_logout': 'Logged Out',
      'oauth_login_initiated': 'OAuth Login Started',
      'logout_all_devices': 'Logged Out All Devices'
    };
    return labels[eventType] || eventType;
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Security Overview
          </CardTitle>
          <CardDescription className="text-gray-400">
            Monitor your account security and recent activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Status */}
          <div className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                securityStatus?.hasActiveSession ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {securityStatus?.hasActiveSession ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">Session Status</p>
                <p className="text-sm text-gray-400">
                  {securityStatus?.hasActiveSession ? 'Active and secure' : 'No active session'}
                </p>
              </div>
            </div>
            <Badge variant={securityStatus?.hasActiveSession ? 'default' : 'destructive'}>
              {securityStatus?.hasActiveSession ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Session Info */}
          {securityStatus?.sessionInfo && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0D0D0D] rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Session Expires In</p>
                <p className="text-white font-medium">
                  {Math.floor(securityStatus.sessionInfo.expiresIn / 60000)} minutes
                </p>
              </div>
              <div className="p-4 bg-[#0D0D0D] rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Last Activity</p>
                <p className="text-white font-medium">
                  {new Date(securityStatus.sessionInfo.lastActivity).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}

          {/* Device ID */}
          <div className="p-4 bg-[#0D0D0D] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Device ID</p>
                  <p className="text-sm text-gray-400">
                    {showDeviceId 
                      ? securityStatus?.deviceId 
                      : '••••••••••••••••'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeviceId(!showDeviceId)}
                className="text-gray-400 hover:text-white"
              >
                {showDeviceId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              Your account is protected with secure authentication
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Session timeout protection enabled</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Login attempt monitoring active</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Brute force protection enabled</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Device fingerprinting active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Recent Security Events
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your recent security-related activity
            </CardDescription>
          </div>
          {securityStatus?.recentSecurityEvents?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSecurityEvents}
              className="text-gray-400 hover:text-white"
            >
              Clear History
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {securityStatus?.recentSecurityEvents?.length > 0 ? (
            <div className="space-y-3">
              {securityStatus.recentSecurityEvents.map((event, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.type)}
                    <div>
                      <p className="text-white text-sm">{getEventLabel(event.type)}</p>
                      <p className="text-xs text-gray-500">
                        {formatEventTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                  {event.details?.email && (
                    <span className="text-xs text-gray-500">
                      {event.details.email}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent security events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-400" />
            Security Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleLogoutAllDevices}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out from All Devices
          </Button>
          <p className="text-xs text-gray-500 text-center">
            This will end all active sessions, including this one.
            You will need to log in again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
