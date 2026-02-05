"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconFiles,
  IconFolder,
  IconUpload,
  IconShare,
  IconClock,
  IconShield,
  IconDownload,
  IconExternalLink,
  IconLoader2,
} from "@tabler/icons-react";
import { apiClient, FileMeta, UserQuota } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, user, accessToken } = useAuth();
  const router = useRouter();

  const [files, setFiles] = useState<FileMeta[]>([]);
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadDashboardData();
    }
  }, [isAuthenticated, accessToken]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [filesRes, quotaRes] = await Promise.all([
        apiClient.getUserFiles(accessToken!),
        apiClient.getUserQuota(accessToken!)
      ]);

      if (filesRes && filesRes.files) {
        setFiles(filesRes.files);
      }

      if (quotaRes) {
        setQuota(quotaRes);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const res = await apiClient.getFileAccessUrl(fileId, accessToken!);
      if (res && res.accessUrl) {
        window.open(res.accessUrl, "_blank");
      }
    } catch (error) {
      toast.error("Failed to get download link");
    }
  };

  const handleShare = async (fileId: string) => {
    try {
      const res = await apiClient.shareFile(fileId, accessToken!);
      if (res && res.shareUrl) {
        await navigator.clipboard.writeText(res.shareUrl);
        toast.success("Share link copied to clipboard!");
      }
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  if (authLoading || (isLoading && !files.length)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <IconLoader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
          <p className="mt-4 text-lg text-neutral-400">Loading your secure vault...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Calculate stats
  const totalFiles = files.length;
  const sharedFiles = files.filter(f => f.isPublic).length;
  const usedStorage = quota?.usedStorage || 0;
  const totalStorage = 10 * 1024 * 1024 * 1024; // 10GB for free trial
  const storagePercentage = Math.min((usedStorage / totalStorage) * 100, 100);

  const recentFiles = [...files]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5);

  const items = [
    {
      title: "My Files",
      description: `${totalFiles} items stored in your secure vault`,
      header: <FilesPreview files={recentFiles.slice(0, 3)} />,
      icon: <IconFiles className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
      href: "/dashboard/files",
    },
    {
      title: "Folders",
      description: "Organize your digital assets",
      header: <Skeleton />,
      icon: <IconFolder className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Quick Upload",
      description: "Drag and drop or click to upload",
      header: <UploadBrief />,
      icon: <IconUpload className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1",
      href: "/dashboard/upload",
    },
    {
      title: "Recent Activity",
      description: "Latest changes in your storage",
      header: <ActivityPreview files={recentFiles} />,
      icon: <IconClock className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-12 pb-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-vault-border pb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-vault-text-primary mb-2">
              Overview
            </h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary">
              Vault Status: <span className="text-vault-accent font-medium">Active</span> • {user?.userName}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-[10px] uppercase tracking-widest text-vault-text-secondary mb-1">Encrypted At Rest</p>
            <p className="text-vault-text-primary text-sm font-medium flex items-center gap-2 md:justify-end">
              <IconShield className="h-4 w-4" /> AES-256 GCM
            </p>
          </div>
        </div>

        {/* Stats Grid - The Ledger Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <div className="p-0">
            <h3 className="text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] mb-4 border-b border-vault-border pb-2">Storage Allocation</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-serif text-vault-text-primary">{formatBytes(usedStorage)}</span>
            </div>
            <p className="text-xs text-vault-text-secondary">Used of 10 GB Provision</p>
          </div>

          <div className="p-0">
            <h3 className="text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] mb-4 border-b border-vault-border pb-2">Total Assets</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-serif text-vault-text-primary">{totalFiles}</span>
            </div>
            <p className="text-xs text-vault-text-secondary">Secured Documents</p>
          </div>

          <div className="p-0">
            <h3 className="text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] mb-4 border-b border-vault-border pb-2">External Access</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-serif text-vault-text-primary">{sharedFiles}</span>
            </div>
            <p className="text-xs text-vault-text-secondary">Active Public Links</p>
          </div>
        </div>

        {/* Bento Grid Features */}
        <BentoGrid className="max-w-full mx-0">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>

        {/* Recent Files Section */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl font-serif text-vault-text-primary">Recent Deposit Log</h2>
            <button
              onClick={() => router.push("/dashboard/files")}
              className="text-vault-accent hover:opacity-80 text-[11px] uppercase tracking-widest font-medium flex items-center gap-2 transition-opacity"
            >
              View Full Archive <IconExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="border-t border-vault-border">
            {recentFiles.length === 0 ? (
              <div className="py-20 text-center">
                <IconFiles className="h-8 w-8 text-vault-text-secondary/30 mx-auto mb-4" strokeWidth={1} />
                <p className="text-vault-text-secondary text-sm">No assets found in the vault.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-left min-w-160">
                  <thead>
                    <tr className="border-b border-vault-border">
                      <th className="px-3 sm:px-6 py-4 sm:py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Asset Name</th>
                      <th className="px-3 sm:px-6 py-4 sm:py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] hidden sm:table-cell">Size</th>
                      <th className="px-3 sm:px-6 py-4 sm:py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] hidden md:table-cell">Timestamp</th>
                      <th className="px-3 sm:px-6 py-4 sm:py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vault-border">
                    {recentFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-vault-surface/50 transition-colors group">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center text-vault-text-primary border border-vault-border bg-vault-surface shrink-0">
                              <IconFiles className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={1} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-serif text-[13px] sm:text-[15px] text-vault-text-primary group-hover:text-vault-accent transition-colors truncate">{file.fileName}</p>
                              <p className="text-[9px] sm:text-[10px] text-vault-text-secondary uppercase tracking-wider">{file.category}</p>
                              <p className="text-[10px] text-vault-text-secondary sm:hidden mt-1">
                                {formatBytes(file.sizeInBytes)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs tabular-nums text-vault-text-secondary hidden sm:table-cell">
                          {formatBytes(file.sizeInBytes)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs tabular-nums text-vault-text-secondary hidden md:table-cell">
                          {formatDate(file.uploadedAt)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDownload(file.id)}
                              className="p-1.5 sm:p-2 hover:bg-vault-surface hover:text-vault-accent rounded-sm transition-colors text-vault-text-secondary"
                              title="Download"
                            >
                              <IconDownload className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.25} />
                            </button>
                            <button
                              onClick={() => handleShare(file.id)}
                              className="p-1.5 sm:p-2 hover:bg-vault-surface hover:text-vault-accent rounded-sm transition-colors text-vault-text-secondary"
                              title="Share"
                            >
                              <IconShare className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.25} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const FilesPreview = ({ files }: { files: FileMeta[] }) => (
  <div className="flex flex-col gap-3 p-4 w-full h-full min-h-40 bg-vault-bg border border-vault-border">
    {files.length === 0 ? (
      <div className="h-full flex flex-col items-center justify-center text-vault-text-secondary/40">
        <IconFiles className="h-8 w-8 mb-2" strokeWidth={1} />
        <span className="text-[10px] uppercase tracking-widest">Vault Empty</span>
      </div>
    ) : (
      files.map(f => (
        <div key={f.id} className="flex items-center gap-3 p-2 hover:bg-vault-surface transition-colors cursor-default group">
          <IconFiles className="h-4 w-4 text-vault-text-secondary group-hover:text-vault-accent" strokeWidth={1.25} />
          <span className="text-xs text-vault-text-primary font-medium truncate">{f.fileName}</span>
        </div>
      ))
    )}
  </div>
);

const ActivityPreview = ({ files }: { files: FileMeta[] }) => (
  <div className="flex flex-col gap-3 p-4 w-full h-full min-h-40 bg-vault-bg border border-vault-border">
    {files.slice(0, 4).map(f => (
      <div key={f.id} className="flex items-center justify-between gap-2 text-[10px] text-vault-text-secondary border-b border-vault-border/50 pb-2 last:border-0 last:pb-0">
        <span className="truncate max-w-37.5 font-medium text-vault-text-primary">{f.fileName}</span>
        <span className="tabular-nums opacity-60">{formatDate(f.uploadedAt)}</span>
      </div>
    ))}
  </div>
);

const UploadBrief = () => (
  <div className="flex flex-col items-center justify-center p-4 w-full h-full min-h-32 bg-vault-surface border border-dashed border-vault-border group hover:border-vault-accent transition-colors">
    <IconUpload className="h-8 w-8 text-vault-text-secondary group-hover:text-vault-accent transition-colors" strokeWidth={1} />
    <span className="text-[10px] uppercase tracking-widest text-vault-text-secondary mt-3 font-bold group-hover:text-vault-accent">Ready for Deposit</span>
  </div>
);

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-32 bg-vault-surface border border-vault-border relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
  </div>
);
