"use client";

import React, { useEffect } from 'react';
import TaskPanel from './components/TaskPanel';
import LoginForm from './components/LoginForm';
import LoadingScreen from './components/LoadingScreen';
import { useAuthContext } from './providers/AuthProvider';

export default function Home() {
  const { token, noAuth, loading } = useAuthContext();

  useEffect(() => {
    console.log('Home page auth state:', {
      token,
      noAuth,
      loading,
      shouldShowTaskPanel: !!(token || noAuth)
    });
  }, [token, noAuth, loading]);

  // Show loading screen during initial auth check
  if (loading) {
    return <LoadingScreen />;
  }

  // After loading, show either TaskPanel or LoginForm based on auth state
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-[#111111]">
      {(token || noAuth) ? (
        <div className="w-full h-full">
          <TaskPanel key={token || 'no-auth'} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <LoginForm />
        </div>
      )}
    </div>
  );
}
