"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Files,
  Search,
  CloudUpload,
  ShieldCheck,
  Users,
  Key,
  Award,
  LogOut,
  User,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { QuotaGauge } from "@/components/QuotaGauge";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, licenses } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const links = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard strokeWidth={1.25} className="h-5 w-5" />,
    },
    {
      label: "Vault Archive",
      href: "/dashboard/files",
      icon: <Files strokeWidth={1.25} className="h-5 w-5" />,
    },
    {
      label: "Analytic Search",
      href: "/dashboard/search",
      icon: <Search strokeWidth={1.25} className="h-5 w-5" />,
    },
    {
      label: "New Deposit",
      href: "/dashboard/upload",
      icon: <CloudUpload strokeWidth={1.25} className="h-5 w-5" />,
    },
    {
      label: "Security & IP",
      href: "/dashboard/admin/ip-management",
      icon: <ShieldCheck strokeWidth={1.25} className="h-5 w-5" />,
    },
    {
      label: "Key Management",
      href: "/dashboard/admin/api-keys",
      icon: <Key strokeWidth={1.25} className="h-5 w-5" />,
    },
    {
      label: "Audit Logs",
      href: "/dashboard/admin/audit-logs",
      icon: <MoreVertical strokeWidth={1.25} className="rotate-90 h-5 w-5" />,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const totalStorage = 10 * 1024 * 1024 * 1024; // 10GB demo
  const usedStorage = 0; // This should be fetched properly, but for layout we use 0

  return (
    <div className="flex h-screen bg-vault-bg overflow-hidden font-sans">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-vault-surface border-r border-vault-border">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="py-4">
              {open ? <Logo /> : <LogoIcon />}
            </div>
            <div className="mt-12 flex flex-col gap-1">
              {links.map((link, idx) => (
                <div key={idx} className={cn(
                  "rounded-none transition-colors duration-300",
                  pathname === link.href ? "bg-vault-accent/5 text-vault-accent border-r-2 border-vault-accent" : "text-vault-text-secondary hover:text-vault-text-primary"
                )}>
                  <SidebarLink
                    link={link}
                    className="px-4 py-3"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 pb-4 px-4">
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4 border-t border-vault-border"
              >
                <QuotaGauge used={usedStorage} total={totalStorage} />
              </motion.div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-1 text-vault-text-secondary hover:text-vault-accent transition-colors duration-300"
              >
                <LogOut strokeWidth={1.25} className="h-5 w-5" />
                {open && <span className="text-[11px] uppercase tracking-widest font-medium">Clear Session</span>}
              </button>

              {user && (
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 mt-4 pt-4 border-t border-vault-border group"
                >
                  <div className="h-8 w-8 rounded-none bg-vault-accent text-vault-bg flex items-center justify-center text-[10px] font-bold">
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                  {open && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[12px] font-medium text-vault-text-primary truncate">{user.userName}</span>
                      <span className="text-[9px] uppercase tracking-tighter text-vault-text-secondary truncate">Vault Admin</span>
                    </div>
                  )}
                </Link>
              )}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="h-20 border-b border-vault-border flex items-center justify-between px-8 bg-vault-bg/80 backdrop-blur-sm z-30">
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-vault-text-secondary">Monaco Vault System</span>
            <div className="h-3 w-[1px] bg-vault-border" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-vault-text-primary font-medium">
              {pathname === "/dashboard" ? "Main Dashboard" : pathname.split('/').pop()?.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-[10px] uppercase tracking-widest text-vault-text-secondary">System Online</span>
            </div>
          </div>
        </header>

        <div className="p-8 md:p-12 overflow-y-auto flex-1 items-start">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

const Logo = () => {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-2">
      <div className="h-6 w-6 border-2 border-vault-accent flex items-center justify-center">
        <div className="h-2 w-2 bg-vault-accent" />
      </div>
      <span className="font-serif text-xl tracking-tight text-vault-text-primary italic">
        Monaco Vault
      </span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link href="/dashboard" className="flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-vault-accent flex items-center justify-center">
        <div className="h-2 w-2 bg-vault-accent" />
      </div>
    </Link>
  );
};
