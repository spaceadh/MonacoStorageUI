import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "MonacoStorage - Premium Secure File Storage",
  description: "Luxury-grade protection and management of your digital files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster 
          position="top-right"
          theme="dark"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              background: 'rgb(38 38 38)',
              border: '1px solid rgb(64 64 64)',
              color: 'rgb(250 250 250)',
            },
          }}
        />
      </body>
    </html>
  );
}
