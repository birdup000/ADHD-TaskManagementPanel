'use client';

import React from 'react';
import { useAuth } from '../utils/auth';

export const AuthContext = React.createContext<ReturnType<typeof useAuth> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  // Key changes when auth state changes, forcing a re-render
  const authKey = `${auth.isAuthenticated}-${auth.noAuth}`;
  return (
    <AuthContext.Provider value={auth}>
      <div key={authKey}>{children}</div>
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
