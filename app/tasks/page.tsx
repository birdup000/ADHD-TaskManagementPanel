"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskPanel from '../components/TaskPanel';

export default function TasksPage() {
  const router = useRouter();

  useEffect(() => {
    // Check auth state
    const noAuth = localStorage.getItem('noAuth') === 'true';
    const token = localStorage.getItem('authToken');

    if (!noAuth && !token) {
      console.log('TasksPage: User is not authenticated, redirecting to login');
      router.push('/');
      return;
    }
  }, [router]);

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-[#111111]">
      <TaskPanel />
    </main>
  );
}
