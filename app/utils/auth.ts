import { useState, useEffect } from 'react';

const AGIXT_URL = process.env.NEXT_PUBLIC_AGIXT_URL || 'http://localhost:7437';

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AGIXT_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      } as LoginRequest),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'Login successful',
        token: data.token,
        username: username
      };
    }

    return {
      success: false,
      message: data.detail || 'Login failed',
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: 'An error occurred during login.',
    };
  }
};

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
  loading: boolean;
  noAuth: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    token: null,
    loading: true,
    noAuth: false
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('authToken');
        const storedUsername = localStorage.getItem('username');
        const storedNoAuth = localStorage.getItem('noAuth') === 'true';

        setAuthState({
          isAuthenticated: !!storedToken,
          username: storedUsername,
          token: storedToken,
          loading: false,
          noAuth: storedNoAuth
        });

        console.log('Auth state initialized:', {
          isAuthenticated: !!storedToken,
          username: storedUsername,
          token: storedToken,
          noAuth: storedNoAuth,
          loading: false
        });
      }
    };

    initializeAuth();
  }, []);

  const loginUser = async (username: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const response = await login(username, password);
      if (response.success && response.token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', username);
        localStorage.removeItem('noAuth');
        
        setAuthState({
          isAuthenticated: true,
          username,
          token: response.token,
          loading: false,
          noAuth: false
        });
        console.log('loginUser success:', authState);
      } else {
        console.log('loginUser failed:', response);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const continueWithoutAuth = async (): Promise<AuthResponse> => {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Cannot continue without auth in non-browser environment' };
    }
    
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Set noAuth flag in localStorage
      localStorage.setItem('noAuth', 'true');
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      
      // Update state immediately
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        username: null,
        token: null,
        noAuth: true
      }));
      
      setAuthState(prev => ({ ...prev, loading: false }));
      console.log('continueWithoutAuth success:', authState);
      
      return { success: true, message: 'Continuing without authentication' };
    } catch (error) {
      console.error('Error in continueWithoutAuth:', error);
      localStorage.removeItem('noAuth');
      setAuthState(prev => ({
        ...prev,
        noAuth: false,
        loading: false
      }));
      return { success: false, message: 'An error occurred while continuing without auth' };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      localStorage.removeItem('noAuth');
      
      setAuthState({
        isAuthenticated: false,
        username: null,
        token: null,
        loading: false,
        noAuth: false
      });
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    username: authState.username,
    token: authState.token,
    loading: authState.loading,
    noAuth: authState.noAuth,
    loginUser,
    logout,
    continueWithoutAuth
  };
};
