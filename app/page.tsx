"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-vault-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vault-accent mx-auto"></div>
        <p className="mt-4 text-lg text-vault-text-secondary uppercase tracking-widest text-[11px]">Authenticating...</p>
      </div>
    </div>
  );
}
