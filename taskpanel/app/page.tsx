"use client";

import TaskPanel from './components/TaskPanel';
import LoginForm from './components/LoginForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);
      setToken(tokenFromUrl);
      console.log('Token set from URL:', tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace('/'); // Force re-render
    } else {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
      console.log('Token set from localStorage:', storedToken);
    }
    setLoading(false);
  }, []);


  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }


  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      {token ? <TaskPanel /> : <LoginForm />}
    </main>
  );
}
