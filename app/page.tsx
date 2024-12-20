"use client";

import TaskPanel from './components/TaskPanel';
import LoginForm from './components/LoginForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useState(() => typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null);
  const [noAuth, setNoAuth] = useState<boolean | null>(() => {
    if (typeof localStorage !== 'undefined') {
      const storedNoAuth = localStorage.getItem('noAuth');
      return storedNoAuth === 'true' ? true : storedNoAuth === 'false' ? false : null;
    }
    return null;
  });
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
    }
  }, [router]);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('authToken'));
      const storedNoAuth = localStorage.getItem('noAuth');
      setNoAuth(storedNoAuth === 'true' ? true : storedNoAuth === 'false' ? false : null);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Initial check

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      {token ? <TaskPanel /> : noAuth ? <TaskPanel /> : <LoginForm />}
    </main>
  );
}
