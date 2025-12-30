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
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100">
              Welcome back, {user?.userName}!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              You are currently on a <span className="text-blue-500 font-semibold">14-day premium trial</span>.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm text-neutral-500">Security Status</p>
            <p className="text-green-500 font-medium flex items-center gap-1 justify-end">
              <IconShield className="h-4 w-4" /> Fully Protected
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-800/50 backdrop-blur-sm p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Storage Used</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-800 dark:text-white">{formatBytes(usedStorage)}</span>
              <span className="text-neutral-500">/ 10 GB</span>
            </div>
            <div className="mt-4 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800/50 backdrop-blur-sm p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Total Files</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-800 dark:text-white">{totalFiles}</span>
              <span className="text-neutral-500">files</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800/50 backdrop-blur-sm p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Public Links</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-800 dark:text-white">{sharedFiles}</span>
              <span className="text-neutral-500">shared</span>
            </div>
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
        <div className="mt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Recent Files</h2>
            <button
              onClick={() => router.push("/dashboard/files")}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
            >
              View all files <IconExternalLink className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-800/30 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden">
            {recentFiles.length === 0 ? (
              <div className="p-10 text-center">
                <IconFiles className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">No files found. Start by uploading some digital assets.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">File Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {recentFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                              <IconFiles className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-500 transition-colors truncate max-w-xs">{file.fileName}</p>
                              <p className="text-xs text-neutral-500 capitalize">{file.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                          {formatBytes(file.sizeInBytes)}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDate(file.uploadedAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDownload(file.id)}
                              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors text-neutral-600 dark:text-neutral-400 hover:text-blue-500"
                              title="Download"
                            >
                              <IconDownload className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleShare(file.id)}
                              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors text-neutral-600 dark:text-neutral-400 hover:text-blue-500"
                              title="Share"
                            >
                              <IconShare className="h-5 w-5" />
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
  <div className="flex flex-col gap-2 p-4 w-full h-full min-h-[8rem] bg-neutral-100 dark:bg-neutral-900/50 rounded-xl">
    {files.length === 0 ? (
      <div className="h-full flex items-center justify-center text-neutral-500 italic text-sm">Empty Storage</div>
    ) : (
      files.map(f => (
        <div key={f.id} className="flex items-center gap-2 p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <IconFiles className="h-4 w-4 text-blue-500" />
          <span className="text-xs truncate">{f.fileName}</span>
        </div>
      ))
    )}
  </div>
);

const ActivityPreview = ({ files }: { files: FileMeta[] }) => (
  <div className="flex flex-col gap-2 p-4 w-full h-full min-h-[8rem] bg-neutral-100 dark:bg-neutral-900/50 rounded-xl overflow-hidden">
    {files.slice(0, 4).map(f => (
      <div key={f.id} className="flex items-center justify-between gap-2 text-[10px] text-neutral-500 border-b border-neutral-200 dark:border-neutral-700 pb-1">
        <span className="truncate max-w-[120px]">Uploaded {f.fileName}</span>
        <span>{formatDate(f.uploadedAt)}</span>
      </div>
    ))}
  </div>
);

const UploadBrief = () => (
  <div className="flex flex-col items-center justify-center p-4 w-full h-full min-h-[8rem] bg-neutral-100 dark:bg-neutral-900/50 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 group hover:border-blue-500 transition-colors">
    <IconUpload className="h-8 w-8 text-neutral-400 group-hover:text-blue-500 transition-colors" />
    <span className="text-xs text-neutral-500 mt-2">Ready for upload</span>
  </div>
)

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[8rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);
