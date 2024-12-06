import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./styles/layout.css";
import { ThemeProvider } from './providers';

import { ThemeSettings } from './components/theme-settings';


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  preload: true,
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: true,
  fallback: ["Consolas", "Monaco", "Liberation Mono", "Courier New", "monospace"],
});

export const metadata: Metadata = {
  title: "ADHD Task Panel",
  description: "A modern, accessible task management panel designed for ADHD users",
  applicationName: "ADHD Task Panel",
  authors: [{ name: "ADHD Task Panel Team" }],
  keywords: ["ADHD", "task management", "productivity", "accessibility"],
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    title: "ADHD Task Panel",
    description: "A modern, accessible task management panel designed for ADHD users",
    siteName: "ADHD Task Panel",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "msapplication-tap-highlight": "no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html 
        lang="en" 
        suppressHydrationWarning
        className="antialiased"
        style={{
          colorScheme: 'light dark',
        }}
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased custom-scrollbar h-screen bg-background text-foreground transition-colors`}
        >
          <ThemeProvider>
            <main className="w-full min-h-screen">
              {children}
            </main>
            <ThemeSettings />
          </ThemeProvider>
        </body>
      </html>
  );
}
