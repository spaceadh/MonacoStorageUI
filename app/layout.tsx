import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from 'sonner';

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MonacoStorage | The Digital Vault",
  description: "Luxury-grade protection and management of your digital assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable} antialiased`}>
      <body className="font-sans">
        <QueryProvider>
          <AuthProvider>
            <div className="relative min-h-screen">
              {children}
            </div>
          </AuthProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              className: "bg-vault-surface border-vault-border text-vault-text-primary font-sans",
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
