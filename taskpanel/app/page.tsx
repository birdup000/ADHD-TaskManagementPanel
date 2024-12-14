"use client";

import TaskPanel from './components/TaskPanel';
import LoginForm from './components/LoginForm';
import useLocalStorage from './hooks/useLocalStorage';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useLocalStorage('authToken', null);
  const [noAuth, setNoAuth] = useLocalStorage('noAuth', null);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      console.log('Token set from URL:', tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace('/'); // Force re-render
    }
  }, [setToken, router]);


  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      {token || noAuth ? <TaskPanel /> : <LoginForm />}
    </main>
  );
}
