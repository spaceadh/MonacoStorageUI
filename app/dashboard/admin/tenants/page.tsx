"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Users,
  HardDrive,
  Check,
  X,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { TenantInfo, CreateTenantRequest, apiClient } from "@/lib/api";
import { cn, formatBytes } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTenants, useCreateTenant, useDeleteTenant } from "@/hooks/useAdmin";
import { toast } from "sonner";

export default function TenantManagementPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Use React Query hook for fetching tenants
  const { data: tenants = [], isLoading, error } = useTenants(accessToken);

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.tenantKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.description && tenant.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "Unlimited";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-vault-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-vault-border pb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-vault-text-primary mb-2">
              Tenant Management
            </h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary">
              System Registry: <span className="text-vault-accent font-medium">{tenants.length} Active</span>
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-vault-accent text-vault-bg hover:opacity-90 transition-opacity flex items-center gap-2 text-[11px] uppercase tracking-widest font-medium"
          >
            <Plus className="h-4 w-4" />
            New Tenant
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vault-text-secondary" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-vault-surface border border-vault-border text-vault-text-primary placeholder-vault-text-secondary text-sm focus:outline-none focus:border-vault-accent"
          />
        </div>

        {/* Tenants Grid */}
        {filteredTenants.length === 0 ? (
          <div className="py-20 text-center border border-vault-border">
            <Building2 className="h-12 w-12 text-vault-text-secondary/30 mx-auto mb-4" strokeWidth={1} />
            <p className="text-vault-text-secondary">
              {searchQuery ? "No tenants found matching your search" : "No tenants registered"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <TenantCard key={tenant.id} tenant={tenant} formatBytes={formatBytes} />
            ))}
          </div>
        )}

        {/* Create Tenant Modal */}
        <CreateTenantModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}

function TenantCard({ tenant, formatBytes }: { tenant: TenantInfo; formatBytes: (b?: number) => string }) {
  const { accessToken } = useAuth();
  const deleteMutation = useDeleteTenant(accessToken);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete tenant "${tenant.displayName}"?`)) return;

    try {
      setIsDeleting(true);
      deleteMutation.mutate(tenant.id);
      toast.success("Tenant deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tenant");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-vault-border bg-vault-surface p-6 hover:border-vault-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-vault-accent shrink-0" strokeWidth={1.5} />
            <h3 className="font-serif text-lg text-vault-text-primary truncate">{tenant.displayName}</h3>
          </div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-vault-text-secondary font-mono">
            {tenant.tenantKey}
          </p>
        </div>
        <div className={cn(
          "px-2 py-1 text-[8px] uppercase tracking-wider",
          tenant.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {tenant.isActive ? "Active" : "Inactive"}
        </div>
      </div>

      {tenant.description && (
        <p className="text-xs text-vault-text-secondary mb-4 line-clamp-2">{tenant.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-vault-border">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="h-3 w-3 text-vault-text-secondary" />
            <span className="text-[9px] uppercase tracking-wider text-vault-text-secondary">Users</span>
          </div>
          <p className="text-sm font-medium text-vault-text-primary">
            {tenant.currentUserCount || 0}
            {tenant.maxUsers && <span className="text-vault-text-secondary">/{tenant.maxUsers}</span>}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <HardDrive className="h-3 w-3 text-vault-text-secondary" />
            <span className="text-[9px] uppercase tracking-wider text-vault-text-secondary">Storage</span>
          </div>
          <p className="text-sm font-medium text-vault-text-primary truncate">
            {formatBytes(tenant.maxStorageQuota)}
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-vault-border">
        <FeatureBadge enabled={tenant.enableInference} label="AI" />
        <FeatureBadge enabled={tenant.enableSearch} label="Search" />
        <FeatureBadge enabled={tenant.enablePublicSharing} label="Share" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          disabled={isDeleting}
          onClick={handleDelete}
          className="flex-1 px-3 py-2 border border-vault-border hover:border-red-500/50 hover:bg-red-500/5 text-vault-text-secondary hover:text-red-500 transition-colors text-[10px] uppercase tracking-wider font-medium disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : <><Trash2 className="h-3 w-3 inline mr-1" /> Delete</>}
        </button>
      </div>
    </motion.div>
  );
}

function FeatureBadge({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-0.5 text-[8px] uppercase tracking-wider border",
      enabled
        ? "border-vault-accent/30 bg-vault-accent/5 text-vault-accent"
        : "border-vault-border bg-vault-surface text-vault-text-secondary"
    )}>
      {enabled ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
      {label}
    </div>
  );
}

function CreateTenantModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { accessToken } = useAuth();
  const createMutation = useCreateTenant(accessToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTenantRequest>({
    tenantKey: "",
    displayName: "",
    description: "",
    subscriptionTier: "free",
    enableInference: true,
    enableSearch: true,
    enablePublicSharing: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createMutation.mutate(formData, {
        onSuccess: () => {
          onClose();
          setFormData({
            tenantKey: "",
            displayName: "",
            description: "",
            subscriptionTier: "free",
            enableInference: true,
            enableSearch: true,
            enablePublicSharing: true,
          });
        },
      });
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-vault-surface border border-vault-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-vault-border">
          <h2 className="text-2xl font-serif text-vault-text-primary">Create New Tenant</h2>
          <p className="text-[10px] uppercase tracking-wider text-vault-text-secondary mt-1">
            Register New Organization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tenant Key */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
              Tenant Key * (lowercase, alphanumeric, underscores only)
            </label>
            <input
              type="text"
              required
              pattern="^[a-z0-9_]+$"
              value={formData.tenantKey}
              onChange={(e) => setFormData({ ...formData, tenantKey: e.target.value.toLowerCase() })}
              className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent font-mono"
              placeholder="e.g., membership_portal"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
              placeholder="e.g., Membership Portal"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent resize-none"
              rows={3}
              placeholder="Brief description of this tenant..."
            />
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableInference}
                onChange={(e) => setFormData({ ...formData, enableInference: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-vault-text-primary">Enable AI</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableSearch}
                onChange={(e) => setFormData({ ...formData, enableSearch: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-vault-text-primary">Enable Search</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enablePublicSharing}
                onChange={(e) => setFormData({ ...formData, enablePublicSharing: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-vault-text-primary">Enable Sharing</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-vault-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-vault-border hover:bg-vault-bg text-vault-text-primary transition-colors text-[11px] uppercase tracking-wider font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-vault-accent text-vault-bg hover:opacity-90 transition-opacity text-[11px] uppercase tracking-wider font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Tenant"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
