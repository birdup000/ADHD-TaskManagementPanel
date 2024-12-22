'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';

export const AuthContext = React.createContext<ReturnType<typeof useAuth> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const init = async () => {
      try {
        // Wait for any initial auth state to be loaded
        await new Promise(resolve => setTimeout(resolve, 0));
        setMounted(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setMounted(true);
      }
    };

    init();
  }, []);

  // Log state changes
  useEffect(() => {
    if (mounted) {
      console.log('AuthProvider: Auth state changed', {
        isAuthenticated: auth.isAuthenticated,
        noAuth: auth.noAuth,
        token: auth.token,
        loading: auth.loading
      });
    }
  }, [auth.isAuthenticated, auth.noAuth, auth.token, auth.loading, mounted]);

  // Show nothing until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
