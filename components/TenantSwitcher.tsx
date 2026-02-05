"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ChevronDown, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMyTenants, useSwitchActiveTenant } from "@/hooks/useAdmin";

export function TenantSwitcher() {
  const { accessToken, user, switchTenant } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch tenants using React Query
  const { data: tenants = [], isLoading: loadingTenants } = useMyTenants(accessToken);

  // 2. Setup the switch mutation
  const switchMutation = useSwitchActiveTenant(accessToken,switchTenant);

  const activeTenantId = user?.activeTenantId;
  const activeTenant = tenants.find((t) => t.tenantId === activeTenantId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!accessToken) {
      console.warn("Switcher: AccessToken is missing, hook will not fire.");
    } else {
      console.log("Switcher: AccessToken present, hook should be firing.");
    }
  }, [accessToken]);

  const handleSwitchTenant = (tenantId: number) => {
    if (tenantId === activeTenantId || switchMutation.isPending) return;
    switchMutation.mutate(tenantId, {
      onSuccess: () => setIsOpen(false),
    });
  };

  console.log("Tenants Data:", tenants);
  console.log("Loading State:", loadingTenants);

  if (loadingTenants) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 border border-vault-border bg-vault-surface/50 opacity-50">
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  if (!tenants || tenants.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 border border-vault-border bg-vault-surface/50">
        <Building2 className="h-3.5 w-3.5 text-vault-text-secondary" strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-[0.15em] text-vault-text-primary font-medium">
          {activeTenant?.tenantDisplayName || "Default Tenant"}
        </span>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switchMutation.isPending}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 border border-vault-border bg-vault-surface/50 transition-colors",
          "hover:bg-vault-surface hover:border-vault-accent/50",
          switchMutation.isPending && "opacity-50 cursor-not-allowed"
        )}
      >
        {switchMutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 text-vault-accent animate-spin" strokeWidth={1.5} />
        ) : (
          <Building2 className="h-3.5 w-3.5 text-vault-text-secondary" strokeWidth={1.5} />
        )}
        <span className="text-[10px] uppercase tracking-[0.15em] text-vault-text-primary font-medium whitespace-nowrap">
          {activeTenant?.tenantDisplayName || "Select Tenant"}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-vault-text-secondary transition-transform",
            isOpen && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-64 border border-vault-border bg-vault-surface shadow-xl z-50"
          >
            <div className="px-3 py-2 border-b border-vault-border">
              <p className="text-[9px] uppercase tracking-[0.2em] text-vault-text-secondary">
                Switch Tenant
              </p>
            </div>

            <div className="py-1 max-h-80 overflow-y-auto">
              {tenants.map((tenant) => {
                const isActive = tenant.tenantId === activeTenantId;
                return (
                  <button
                    key={tenant.tenantId}
                    onClick={() => handleSwitchTenant(tenant.tenantId)}
                    disabled={isActive || switchMutation.isPending}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-vault-accent/5 text-vault-accent cursor-default"
                        : "text-vault-text-primary hover:bg-vault-accent/5 hover:text-vault-accent",
                      switchMutation.isPending && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex flex-col items-start gap-0.5 min-w-0">
                      <span className="text-[11px] font-medium truncate w-full text-left">
                        {tenant.tenantDisplayName}
                      </span>
                      <span className="text-[9px] text-vault-text-secondary uppercase tracking-wider">
                        {tenant.role}
                      </span>
                    </div>

                    {isActive && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}