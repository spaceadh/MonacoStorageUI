"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
    IconFiles,
    IconLayoutGrid,
    IconList,
    IconSearch,
    IconFilter,
    IconDownload,
    IconShare,
    IconTrash,
    IconDotsVertical,
    IconLoader2,
    IconPlus
} from "@tabler/icons-react";
import { apiClient, FileMeta } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function FilesPage() {
    const router = useRouter();
    const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
    const [files, setFiles] = useState<FileMeta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            loadFiles();
        }
    }, [isAuthenticated, accessToken]);

    const loadFiles = async () => {
        try {
            setIsLoading(true);
            const res = await apiClient.getUserFiles(accessToken!);
            if (res && res.files) {
                setFiles(res.files);
            }
        } catch (error) {
            toast.error("Failed to load files");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "all" || file.category.toLowerCase() === selectedCategory.toLowerCase();
            return matchesSearch && matchesCategory;
        });
    }, [files, searchQuery, selectedCategory]);

    const categories = ["all", ...new Set(files.map(f => f.category))];

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

    const handleDelete = async (fileId: string) => {
        if (!confirm("Are you sure you want to delete this file? This action cannot be undone.")) return;
        try {
            await apiClient.deleteFile(fileId, accessToken!);
            setFiles(prev => prev.filter(f => f.id !== fileId));
            toast.success("File deleted successfully");
        } catch (error) {
            toast.error("Failed to delete file");
        }
    };

    if (authLoading || (isLoading && !files.length)) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <IconLoader2 className="animate-spin h-10 w-10 text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">My Storage</h1>
                        <p className="text-neutral-500 mt-1">Manage and organize your digital assets</p>
                    </div>
                    <button 
                        onClick={() => router.push("/dashboard/upload")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <IconPlus className="h-5 w-5" /> Upload File
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700/50">
                    <div className="relative flex-1 min-w-[200px]">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <IconFilter className="h-5 w-5 text-neutral-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-neutral-100 dark:bg-neutral-900 rounded-xl border-none focus:ring-2 focus:ring-blue-500 py-2 px-4 capitalize"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === "grid" ? "bg-white dark:bg-neutral-800 shadow-sm text-blue-500" : "text-neutral-500"
                            )}
                        >
                            <IconLayoutGrid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === "list" ? "bg-white dark:bg-neutral-800 shadow-sm text-blue-500" : "text-neutral-500"
                            )}
                        >
                            <IconList className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* File Browser */}
                {filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-800/30 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700">
                        <div className="h-20 w-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                            <IconFiles className="h-10 w-10 text-neutral-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">No files found</h3>
                        <p className="text-neutral-500 mt-2 max-w-sm">
                            We couldn't find any files matching your current search or filter. Try a different query or upload something new.
                        </p>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFiles.map(file => (
                            <FileGridCard
                                key={file.id}
                                file={file}
                                onDownload={handleDownload}
                                onShare={handleShare}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-800/30 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Uploaded</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {filteredFiles.map(file => (
                                    <FileListRow
                                        key={file.id}
                                        file={file}
                                        onDownload={handleDownload}
                                        onShare={handleShare}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

const FileGridCard = ({ file, onDownload, onShare, onDelete }: {
    file: FileMeta,
    onDownload: (id: string) => void,
    onShare: (id: string) => void,
    onDelete: (id: string) => void
}) => {
    return (
        <div className="group relative bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
            <div className="aspect-video bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center relative overflow-hidden">
                {file.contentType.startsWith("image/") ? (
                    <img
                        src={file.presignedUrl || file.storageUrl}
                        alt={file.fileName}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                ) : (
                    <IconFiles className="h-12 w-12 text-neutral-400 group-hover:scale-110 transition-transform" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => onDownload(file.id)} className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors">
                        <IconDownload className="h-5 w-5" />
                    </button>
                    <button onClick={() => onShare(file.id)} className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors">
                        <IconShare className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate" title={file.fileName}>
                            {file.fileName}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">{formatBytes(file.sizeInBytes)} • {formatDate(file.uploadedAt)}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium capitalize">
                            {file.category}
                        </span>
                        <button onClick={() => onDelete(file.id)} className="p-1 text-neutral-400 hover:text-red-500 transition-colors">
                            <IconTrash className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FileListRow = ({ file, onDownload, onShare, onDelete }: {
    file: FileMeta,
    onDownload: (id: string) => void,
    onShare: (id: string) => void,
    onDelete: (id: string) => void
}) => {
    return (
        <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <IconFiles className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-xs">{file.fileName}</p>
                </div>
            </td>
            <td className="px-6 py-4 capitalize text-sm text-neutral-600 dark:text-neutral-400">
                <span className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs">
                    {file.category}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                {formatBytes(file.sizeInBytes)}
            </td>
            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                {formatDate(file.uploadedAt)}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDownload(file.id)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-blue-500" title="Download">
                        <IconDownload className="h-5 w-5" />
                    </button>
                    <button onClick={() => onShare(file.id)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-blue-500" title="Share">
                        <IconShare className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(file.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-neutral-400 hover:text-red-500" title="Delete">
                        <IconTrash className="h-5 w-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};
