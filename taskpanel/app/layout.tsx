import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
    <html lang="en" className="h-full dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gradient-to-b from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 transition-colors duration-300`}
      >
        <div className="min-h-full flex flex-col">
          <header className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm shadow-sm border-b border-neutral-100/50 dark:border-neutral-700/50">
            <div className="w-full px-6 py-5">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                ADHD-Friendly Task Panel
              </h1>
            </div>
          </header>
          <main className="flex-1 py-10">
            <div className="w-full px-6 sm:px-8 lg:px-10 space-y-10">
              {children}
            </div>
          </main>
          <footer className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border-t border-neutral-100/50 dark:border-neutral-700/50">
            <div className="w-full px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
              <p>© 2025 ADHD Task Management Panel. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
