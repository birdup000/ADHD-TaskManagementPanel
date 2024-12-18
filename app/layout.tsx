import type { Metadata } from "next";
    import "./globals.css";

    export const metadata: Metadata = {
      title: "Midnight Eclipse - Task Management",
      description: "Modern task management with dark mode themes",
    };

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="en">
          <body
            className="antialiased font-geist-sans font-geist-mono"
          >
            {children}
          </body>
        </html>
      );
    }
