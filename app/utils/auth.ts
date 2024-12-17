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
    return {
      success: false,
      message: 'An error occurred during login.',
    };
  }
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    setIsAuthenticated(!!token);
    setUsername(storedUsername);
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(null);
  };

  return { isAuthenticated, loading, logout, username };
};
