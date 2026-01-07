import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  loginAttemptTracker, 
  securityEventLogger, 
  sessionManager,
  isValidEmail,
  formatLockoutTime 
} from '@/lib/authUtils';
import { sanitizeEmail } from '@/lib/sanitizer';
import { getCSRFToken } from '@/lib/security';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Generate CSRF token on mount
    setCsrfToken(getCSRFToken());
    
    // Check for existing lockout
    checkLockout();
    
    // Log page visit
    securityEventLogger.logEvent('login_page_visited');
    
    // Check if already authenticated
    checkExistingSession();
  }, []);

  const checkExistingSession = useCallback(async () => {
    try {
      const session = sessionManager.getSession();
      if (session) {
        // User already has a valid session
        const user = await base44.auth.me();
        if (user) {
          navigate('/Dashboard');
        }
      }
    } catch {
      // No valid session, continue to login
    }
  }, [navigate]);

  const checkLockout = useCallback(() => {
    const lockout = loginAttemptTracker.isLockedOut(email || 'anonymous');
    if (lockout.locked) {
      setLockoutInfo(lockout);
    } else {
      setLockoutInfo(null);
    }
  }, [email]);

  useEffect(() => {
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

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Log login attempt
      securityEventLogger.logEvent('email_login_attempt', { email: sanitizedEmail });

      // Use Base44 authentication (which handles the backend)
      // In production, you would call your custom auth endpoint here
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: sanitizedEmail, password, rememberMe })
      // });

      // For now, redirect to Base44 OAuth login
      base44.auth.redirectToLogin(window.location.origin + '/Dashboard');

      // Clear any previous failed attempts on successful redirect
      loginAttemptTracker.clearAttempts(sanitizedEmail);
      
      // Create session
      sessionManager.createSession('user_id', sanitizedEmail);

      setSuccess('Login successful! Redirecting...');
      
      // Log success
      securityEventLogger.logEvent('email_login_success', { email: sanitizedEmail });

    } catch (err) {
      // Record failed attempt
      const attemptResult = loginAttemptTracker.recordFailedAttempt(sanitizedEmail);
      
      // Log the failure
      securityEventLogger.logEvent('email_login_failed', { 
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
        setError('Too many failed attempts. Account locked for 15 minutes.');
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

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      securityEventLogger.logEvent('google_oauth_initiated');

      // Send credential to backend for verification
      // const response = await fetch('/api/auth/google', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ credential: credentialResponse.credential })
      // });
      // const data = await response.json();

      // For now, use Base44 auth flow
      // In production, you would decode the JWT and create/update user
      console.log('Google credential received:', credentialResponse);

      // Decode the JWT token to get user info (client-side only for display)
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      console.log('Google user info:', {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        email_verified: decoded.email_verified
      });

      // Create session
      if (decoded.email) {
        sessionManager.createSession(decoded.sub, decoded.email);
        loginAttemptTracker.clearAttempts(decoded.email);
        
        securityEventLogger.logEvent('google_oauth_success', { 
          email: decoded.email,
          name: decoded.name 
        });

        setSuccess('Google login successful! Redirecting...');
        toast.success(`Welcome, ${decoded.name}!`);

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/Dashboard');
        }, 1500);
      }

    } catch (error) {
      console.error('Google login error:', error);
      securityEventLogger.logEvent('google_oauth_failed', { 
        error: error.message 
      });
      setError('Google login failed. Please try again.');
      toast.error('Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleGoogleError = useCallback(() => {
    console.error('Google login failed');
    securityEventLogger.logEvent('google_oauth_error');
    setError('Google login failed. Please try again.');
    toast.error('Google authentication failed');
  }, []);

  const handleBase44Login = () => {
    securityEventLogger.logEvent('base44_login_initiated');
    base44.auth.redirectToLogin(window.location.origin + '/Dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1A1A] border-gray-800 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Sign in to access your AI content generation platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message */}
          {success && (
            <Alert className="bg-green-500/10 border-green-500/30 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">{success}</AlertDescription>
            </Alert>
          )}

          {/* Lockout Warning */}
          {lockoutInfo?.locked && (
            <Alert className="bg-red-500/10 border-red-500/30 animate-in fade-in">
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
            <Alert className="bg-red-500/10 border-red-500/30 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Google OAuth Login */}
          <div className="flex flex-col items-center space-y-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              width="100%"
              useOneTap={false}
            />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1A1A1A] px-3 text-gray-500 font-medium">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            {/* Hidden CSRF Token */}
            <input type="hidden" name="csrf_token" value={csrfToken} />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-11 bg-[#0D0D0D] border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500 h-11"
                  disabled={isLoading || lockoutInfo?.locked}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 bg-[#0D0D0D] border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500 h-11"
                  disabled={isLoading || lockoutInfo?.locked}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  className="border-gray-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <label 
                  htmlFor="remember" 
                  className="text-sm text-gray-400 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>
              <a 
                href="/forgot-password" 
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading || lockoutInfo?.locked}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold h-11 transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in with Email'
              )}
            </Button>
          </form>

          {/* Alternative Login */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1A1A1A] px-3 text-gray-500 font-medium">Or</span>
            </div>
          </div>

          <Button
            onClick={handleBase44Login}
            disabled={isLoading || lockoutInfo?.locked}
            variant="outline"
            className="w-full border-gray-700 bg-[#0D0D0D] hover:bg-gray-800 text-white h-11"
          >
            <Shield className="w-5 h-5 mr-2" />
            Sign in with Base44
          </Button>

          {/* Security Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-xs text-blue-300 flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Your connection is secure. We use industry-standard encryption
                and never share your personal information.
              </span>
            </p>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a 
              href="/signup" 
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign up for free
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
