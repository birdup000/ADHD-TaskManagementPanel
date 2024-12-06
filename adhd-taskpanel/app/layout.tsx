import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from './providers';
import Script from 'next/script';
import { preloadCriticalCSS, loadNonCriticalCSS } from './lib/styles';
import { ThemeToggle } from './theme-toggle';

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
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "msapplication-tap-highlight": "no",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Preload critical CSS
  if (typeof window !== 'undefined') {
    preloadCriticalCSS();
  }
  return (
    <>
      <Script id="init-css" strategy="beforeInteractive">
        {`(${String(preloadCriticalCSS)})();`}
      </Script>
      <Script id="load-css" strategy="afterInteractive">
        {`(${String(loadNonCriticalCSS)})();`}
      </Script>
      <html 
        lang="en" 
        suppressHydrationWarning
        className="antialiased"
        style={{
          colorScheme: 'light dark',
        }}
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased custom-scrollbar min-h-screen bg-background text-foreground transition-colors`}
        >
          <ThemeProvider>
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <ThemeToggle />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
