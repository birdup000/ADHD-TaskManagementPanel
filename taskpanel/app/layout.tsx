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
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-background`}
      >
        <script src="https://js.puter.com/v2/"></script>
        <div className="min-h-full flex flex-col">
          <header className="bg-primary/50 backdrop-blur-sm shadow-sm border-b border-border/50">
            <div className="w-full px-6 py-5">
              <h1 className="text-2xl font-bold text-foreground">
                ADHD-Friendly Task Panel
              </h1>
            </div>
          </header>
          <main className="flex-1 py-10">
            <div className="w-full px-6 sm:px-8 lg:px-10 space-y-10">
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
