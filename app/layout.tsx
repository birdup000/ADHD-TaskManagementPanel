import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

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
    <html lang="en">
      <body className="min-h-screen bg-[#111111] text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
