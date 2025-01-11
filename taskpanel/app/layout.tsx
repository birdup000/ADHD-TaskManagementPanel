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
    <html lang="en" className="h-full dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-background`}
      >
        <script src="https://js.puter.com/v2/"></script>
        <div className="min-h-full flex flex-col">
          <header className="bg-primary/50 backdrop-blur-sm shadow-sm border-b border-border/50">
            <nav className="w-full px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <a href="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm p-1">
                  <h1 className="text-xl font-semibold">ADHD Task Panel</h1>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  className="px-4 py-2 text-sm rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Get help"
                >
                  Help
                </button>
              </div>
            </nav>
          </header>
          <main className="flex-1">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-4">
              {children}
            </div>
          </main>
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
