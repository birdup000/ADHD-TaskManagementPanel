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

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [noAuth, setNoAuth] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedToken = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    const storedNoAuth = localStorage.getItem('noAuth') === 'true';
    
    setIsAuthenticated(!!storedToken);
    setUsername(storedUsername);
    setToken(storedToken);
    setNoAuth(storedNoAuth);
  }, []);

  const loginUser = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await login(username, password);
      if (response.success && response.token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', username);
        setIsAuthenticated(true);
        setUsername(username);
        setToken(response.token);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login.' };
    } finally {
      setLoading(false);
    }
  };

  const continueWithoutAuth = async (): Promise<AuthResponse> => {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Cannot continue without auth in non-browser environment' };
    }
    
    // Update state first
    setNoAuth(true);
    setIsAuthenticated(false);
    setToken(null);
    setUsername(null);
      
    // Update localStorage
    localStorage.setItem('noAuth', 'true');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    
    return { success: true, message: 'Continuing without authentication' };
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      localStorage.removeItem('noAuth');
    }
    setIsAuthenticated(false);
    setUsername(null);
    setToken(null);
    setNoAuth(false);
  };

  const updateNoAuth = (value: boolean) => {
    if (typeof window !== 'undefined') {
      if (value) {
        localStorage.setItem('noAuth', 'true');
        setNoAuth(true);
      } else {
        localStorage.removeItem('noAuth');
        setNoAuth(false);
      }
    }
  };

  return { 
    isAuthenticated, 
    loading, 
    logout, 
    username, 
    token, 
    loginUser,
    noAuth,
    setNoAuth: updateNoAuth,
    continueWithoutAuth
  };
};
