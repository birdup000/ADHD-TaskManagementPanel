import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import React from "react";
import NotificationSystem from "@/components/NotificationSystem";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ADHD-Friendly Task Panel",
  description: "Enhanced task management for focus and productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-background`}
      >
        <script src="https://js.puter.com/v2/"></script>
        <div className="min-h-full flex flex-col">
          <header className="bg-primary/5 backdrop-blur-md border-b border-border/10 sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-8">
                  <a href="/dashboard" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-lg py-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-accent via-accent to-accent text-transparent bg-clip-text leading-none">ADHD Task Panel</span>
                  </a>
                  <div className="hidden md:flex items-center space-x-2 animate-fade-in bg-background/30 backdrop-blur-sm rounded-full px-2 border border-border/5">
                    <a href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors">Dashboard</a>
                    <a href="/calendar" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors">Calendar</a>
                    <a href="/analytics" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors">Analytics</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="mobile-menu-checkbox" className="p-2 rounded-lg hover:bg-primary/10 transition-colors md:hidden" aria-label="Toggle menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </label>
                </div>
              </div>
              {/* Mobile menu */}
              <input type="checkbox" id="mobile-menu-checkbox" className="hidden" />
              <div className="md:hidden mobile-menu-overlay">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <a href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors block">Dashboard</a>
                  <a href="/calendar" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors block">Calendar</a>
                  <a href="/analytics" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors block">Analytics</a>
                </div>
              </div>
            </nav>
          </header>
          <main className="flex-1">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-4">
              {children}
            </div>
          </main>
          <NotificationSystem tasks={[]} />
          <footer className="bg-primary/50 backdrop-blur-sm border-t border-border/50">
            <div className="w-full px-6 py-4 text-sm text-muted">
              <p>© 2025 ADHD Task Management Panel. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}