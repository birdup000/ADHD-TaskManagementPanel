'use client';

import { AuthProvider } from "../providers/AuthProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen items-center justify-center">
        {children}
      </div>
    </AuthProvider>
  );
}
