"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      // Errors are handled by the toast in AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vault-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl text-vault-text-primary mb-3"
          >
            Enter the Vault
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-vault-text-secondary text-sm tracking-widest uppercase"
          >
            Identity Verification Required
          </motion.p>
        </div>

        <div className="bg-vault-surface border border-vault-border p-8 md:p-12 transition-colors duration-500">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[10px] uppercase tracking-[0.2em] font-medium text-vault-text-secondary"
              >
                Identification (Email)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-vault-border py-2 text-vault-text-primary focus:outline-none focus:border-vault-accent transition-colors placeholder:text-vault-text-secondary/30"
                placeholder="archive@monaco.vault"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[10px] uppercase tracking-[0.2em] font-medium text-vault-text-secondary"
              >
                Access Key
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-vault-border py-2 text-vault-text-primary focus:outline-none focus:border-vault-accent transition-colors placeholder:text-vault-text-secondary/30"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-vault-accent text-vault-bg text-[11px] uppercase tracking-[0.3em] font-medium hover:opacity-90 transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? "Verifying..." : "Authorize Access"}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-[11px] text-vault-text-secondary uppercase tracking-widest">
              No access card?{" "}
              <Link
                href="/register"
                className="text-vault-text-primary font-medium hover:underline underline-offset-4"
              >
                Register
              </Link>
            </p>
            <p className="text-[10px] text-vault-text-secondary/50 uppercase tracking-tighter">
              Bespoke Encryption Active
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
