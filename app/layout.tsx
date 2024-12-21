import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import localFont from 'next/font/local';

const geist = localFont({
  src: [
    {
      path: './fonts/GeistVF.woff',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-geist-sans'
});

export const metadata: Metadata = {
  title: "ADHD Task Management Panel",
  description: "Modern task management for ADHD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-[#111111] text-white antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
