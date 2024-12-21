"use client";

import TaskPanel from './components/TaskPanel';
import LoginForm from './components/LoginForm';
import { useAuthContext } from './providers/AuthProvider';

export default function Home() {
  const { token, noAuth } = useAuthContext();

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      {token ? <TaskPanel /> : noAuth ? <TaskPanel /> : <LoginForm />}
    </main>
  );
}
