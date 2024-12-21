"use client";

import React, { useState, useEffect } from 'react';
import TaskPanel from './components/TaskPanel';
import LoginForm from './components/LoginForm';
import { useAuthContext } from './providers/AuthProvider';

export default function Home() {
  const { token, noAuth } = useAuthContext();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Force a re-render after mounting to ensure we have the latest localStorage values
    setShouldRender(true);
  }, []);

  if (!shouldRender) {
    return null; // Return nothing while we wait for the initial render
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-[#111111]">
      {(token || noAuth) ? (
        <TaskPanel />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <LoginForm />
        </div>
      )}
    </main>
  );
}
