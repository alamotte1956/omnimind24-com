import { createContext, useState, useContext, useEffect } from 'react';
import { apiClient, storage } from '@/api/apiClient';

const AuthContext = createContext();

/**
 * AuthProvider - Custom authentication context
 * Replaces Base44 authentication with JWT-based auth
 * 
 * TODO: Backend API endpoints needed:
 * - GET /api/auth/me - Get current user
 * - POST /api/auth/login - Login user
 * - POST /api/auth/logout - Logout user
 * - POST /api/auth/refresh - Refresh token
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      // Check if we have a token
      const token = storage.getToken();
      if (!token) {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        return;
      }
      
      // Try to get current user
      const currentUser = await apiClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        storage.removeToken();
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      } else {
        setAuthError({
          type: 'unknown',
          message: error.message || 'Failed to authenticate'
        });
      }
    }
  };

  /**
   * Login user
   */
  const login = async (email, password, remember = true) => {
    try {
      setAuthError(null);
      const response = await apiClient.auth.login(email, password, remember);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Login failed'
      });
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    
    const redirectUrl = shouldRedirect ? window.location.href : null;
    apiClient.auth.logout(redirectUrl);
  };

  /**
   * Navigate to login page
   */
  const navigateToLogin = () => {
    apiClient.auth.redirectToLogin(window.location.href);
  };

  /**
   * Refresh authentication
   */
  const refreshAuth = async () => {
    try {
      await apiClient.auth.refresh();
      await checkUserAuth();
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      logout(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authError,
      login,
      logout,
      navigateToLogin,
      checkUserAuth,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
