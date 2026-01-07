import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  loginAttemptTracker, 
  securityEventLogger, 
  isValidEmail,
  formatLockoutTime,
  AUTH_CONFIG 
} from '@/lib/authUtils';
import { sanitizeEmail } from '@/lib/sanitizer';
import { getCSRFToken } from '@/lib/security';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Generate CSRF token on mount
    setCsrfToken(getCSRFToken());
    
    // Check for existing lockout
    checkLockout();
    
    // Log page visit
    securityEventLogger.logEvent('login_page_visited');
  }, [checkLockout]);

  const checkLockout = useCallback(() => {
    const lockout = loginAttemptTracker.isLockedOut(email || 'anonymous');
    if (lockout.locked) {
      setLockoutInfo(lockout);
    } else {
      setLockoutInfo(null);
    }
  }, [email]);

  useEffect(() => {
    // Update lockout status when email changes
    if (email) {
      checkLockout();
    }
  }, [email, checkLockout]);

  useEffect(() => {
    // Countdown timer for lockout
    if (lockoutInfo?.locked) {
      const timer = setInterval(() => {
        const remaining = lockoutInfo.lockoutUntil - Date.now();
        if (remaining <= 0) {
          setLockoutInfo(null);
          clearInterval(timer);
        } else {
          setLockoutInfo(prev => ({
            ...prev,
            remainingTime: remaining
          }));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutInfo?.lockoutUntil, lockoutInfo?.locked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check for lockout
    const lockout = loginAttemptTracker.isLockedOut(sanitizedEmail);
    if (lockout.locked) {
      setLockoutInfo(lockout);
      securityEventLogger.logEvent('login_blocked_lockout', { email: sanitizedEmail });
      return;
    }

    // Validate password
    if (!password || password.length < 1) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      // Log login attempt
      securityEventLogger.logEvent('login_attempt', { email: sanitizedEmail });

      // Redirect to Base44 OAuth login
      // The Base44 SDK handles the actual authentication
      base44.auth.redirectToLogin(window.location.origin + '/Dashboard');

      // Clear any previous failed attempts on successful redirect
      loginAttemptTracker.clearAttempts(sanitizedEmail);

    } catch (err) {
      // Record failed attempt
      const attemptResult = loginAttemptTracker.recordFailedAttempt(sanitizedEmail);
      
      // Log the failure
      securityEventLogger.logEvent('login_failed', { 
        email: sanitizedEmail,
        reason: err.message,
        attemptsRemaining: attemptResult.attemptsRemaining
      });

      if (attemptResult.locked) {
        setLockoutInfo({
          locked: true,
          lockoutUntil: attemptResult.lockoutUntil,
          remainingTime: attemptResult.lockoutUntil - Date.now()
        });
        setError(`Too many failed attempts. Account locked for ${formatLockoutTime(AUTH_CONFIG.login.lockoutDuration)}.`);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
        if (attemptResult.attemptsRemaining <= 2) {
          toast.warning(`${attemptResult.attemptsRemaining} login attempts remaining before lockout.`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    securityEventLogger.logEvent('oauth_login_initiated', { provider });
    // Redirect to Base44 OAuth
    base44.auth.redirectToLogin(window.location.origin + '/Dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1A1A] border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Welcome to OmniMind24</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to access your AI content generation platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Lockout Warning */}
          {lockoutInfo?.locked && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                Account temporarily locked due to too many failed attempts.
                <br />
                Try again in {formatLockoutTime(lockoutInfo.remainingTime)}.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && !lockoutInfo?.locked && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Login Button */}
          <Button
            onClick={() => handleOAuthLogin('base44')}
            disabled={isLoading || lockoutInfo?.locked}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Sign in with OmniMind24
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1A1A1A] px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden CSRF Token */}
            <input type="hidden" name="csrf_token" value={csrfToken} />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-400">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-[#0D0D0D] border-gray-700 text-white"
                  disabled={isLoading || lockoutInfo?.locked}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-400">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-[#0D0D0D] border-gray-700 text-white"
                  disabled={isLoading || lockoutInfo?.locked}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  className="rounded border-gray-700 bg-[#0D0D0D] text-purple-600 focus:ring-purple-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading || lockoutInfo?.locked}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in with Email'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300 flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Your connection is secure. We use industry-standard encryption
                to protect your data. Never share your password with anyone.
              </span>
            </p>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Sign up for free
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
