import { useState, useEffect } from 'react';

const MAGICALAUTH_URL = process.env.NEXT_PUBLIC_MAGICALAUTH_URL || 'http://localhost:12437';

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  email?: string;
}

export interface LoginRequest {
  email: string;
  otp?: string;
  referrer?: string;
}

export const initiateLogin = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${MAGICALAUTH_URL}/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        referrer: window.location.origin 
      } as LoginRequest),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: 'Please check your email for the magic link.',
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

export const verifyMagicLink = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${MAGICALAUTH_URL}/v1/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'Authentication successful',
        token: token,
        email: data.email
      };
    }

    return {
      success: false,
      message: data.detail || 'Verification failed',
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during verification.',
    };
  }
};

export const initiateOAuthLogin = async (provider: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${MAGICALAUTH_URL}/v1/oauth2/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referrer: window.location.origin
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'OAuth authentication initiated',
        token: data.token,
        email: data.email
      };
    }

    return {
      success: false,
      message: data.detail || 'OAuth login failed',
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during OAuth login.',
    };
  }
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    setIsAuthenticated(!!token);
    setUserEmail(email);
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return { isAuthenticated, loading, logout, userEmail };
};
