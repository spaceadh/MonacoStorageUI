"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
    Files,
    LayoutGrid,
    List,
    Search,
    Filter,
    Download,
    Share2,
    Trash2,
    Loader2,
    Plus,
    FileText
} from "lucide-react";
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
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
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
            toast.error("Failed to retrieve vault index");
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
            toast.error("Access denied or link unavailable");
        }
    };

    const handleShare = async (fileId: string) => {
        try {
            const res = await apiClient.shareFile(fileId, accessToken!);
            if (res && res.shareUrl) {
                await navigator.clipboard.writeText(res.shareUrl);
                toast.success("Secure link copied to clipboard");
            }
        } catch (error) {
            toast.error("Failed to generate secure link");
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm("Confirm permanent deletion from the vault?")) return;
        try {
            await apiClient.deleteFile(fileId, accessToken!);
            setFiles(prev => prev.filter(f => f.id !== fileId));
            toast.success("Asset removed from vault");
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    if (authLoading || (isLoading && !files.length)) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="animate-spin h-8 w-8 text-vault-accent" strokeWidth={1} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vault-border pb-6">
                    <div>
                        <h1 className="text-4xl font-serif text-vault-text-primary">Vault Archive</h1>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary mt-2">
                            Secure Asset Management Index
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/dashboard/upload")}
                        className="bg-vault-accent hover:bg-vault-text-primary text-vault-bg px-5 py-2.5 flex items-center gap-2 transition-colors duration-300 group"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-widest font-medium">Deposit Asset</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-vault-text-secondary group-hover:text-vault-accent transition-colors" strokeWidth={1.25} />
                            <input
                                type="text"
                                placeholder="Search Index..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-vault-border focus:border-vault-accent outline-none text-vault-text-primary placeholder:text-vault-text-secondary/50 transition-colors font-serif"
                            />
                        </div>

                        <div className="flex items-center gap-2 border-l border-vault-border pl-4">
                            <Filter className="h-4 w-4 text-vault-text-secondary" strokeWidth={1.25} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs uppercase tracking-wider text-vault-text-secondary cursor-pointer hover:text-vault-accent transition-colors"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 border border-vault-border p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-2 transition-all",
                                viewMode === "grid" ? "bg-vault-accent text-vault-bg" : "text-vault-text-secondary hover:text-vault-accent"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" strokeWidth={1.25} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-2 transition-all",
                                viewMode === "list" ? "bg-vault-accent text-vault-bg" : "text-vault-text-secondary hover:text-vault-accent"
                            )}
                        >
                            <List className="h-4 w-4" strokeWidth={1.25} />
                        </button>
                    </div>
                </div>

                {/* File Browser */}
                {filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center border-t border-vault-border">
                        <FileText className="h-12 w-12 text-vault-text-secondary/20 mb-4" strokeWidth={0.5} />
                        <h3 className="text-lg font-serif text-vault-text-primary">Index Empty</h3>
                        <p className="text-xs text-vault-text-secondary mt-2 uppercase tracking-widest">
                            No assets found matching criteria
                        </p>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <div className="overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-vault-border">
                                    <th className="px-4 py-4 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Asset Ref</th>
                                    <th className="px-4 py-4 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Classification</th>
                                    <th className="px-4 py-4 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Size</th>
                                    <th className="px-4 py-4 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Deposit Date</th>
                                    <th className="px-4 py-4 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] text-right">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-vault-border">
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
        <div className="group relative bg-vault-surface border border-vault-border p-6 hover:border-vault-accent transition-colors duration-500">
            <div className="aspect-[4/3] bg-vault-bg flex items-center justify-center relative mb-4 border border-vault-border">
                {file.contentType.startsWith("image/") ? (
                    <img
                        src={file.presignedUrl || file.storageUrl}
                        alt={file.fileName}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0 duration-500"
                    />
                ) : (
                    <FileText className="h-12 w-12 text-vault-text-secondary group-hover:text-vault-accent transition-colors duration-500" strokeWidth={1} />
                )}

                {/* Hover Actions Overlay */}
                <div className="absolute inset-0 bg-vault-accent/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button onClick={() => onDownload(file.id)} className="text-vault-bg hover:scale-110 transition-transform" title="Retrieve">
                        <Download className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => onShare(file.id)} className="text-vault-bg hover:scale-110 transition-transform" title="Share Access">
                        <Share2 className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg text-vault-text-primary truncate" title={file.fileName}>
                        {file.fileName}
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider text-vault-text-secondary mt-1">
                        {formatBytes(file.sizeInBytes)}
                    </p>
                </div>
                <button
                    onClick={() => onDelete(file.id)}
                    className="text-vault-text-secondary hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                </button>
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
        <tr className="hover:bg-vault-surface transition-colors group">
            <td className="px-4 py-4">
                <div className="flex items-center gap-4">
                    <FileText className="h-4 w-4 text-vault-text-secondary group-hover:text-vault-accent transition-colors" strokeWidth={1.25} />
                    <span className="font-serif text-base text-vault-text-primary truncate max-w-xs">{file.fileName}</span>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="text-[10px] uppercase tracking-wider text-vault-text-secondary border border-vault-border px-2 py-1">
                    {file.category}
                </span>
            </td>
            <td className="px-4 py-4 text-xs tabular-nums text-vault-text-secondary">
                {formatBytes(file.sizeInBytes)}
            </td>
            <td className="px-4 py-4 text-xs tabular-nums text-vault-text-secondary">
                {formatDate(file.uploadedAt)}
            </td>
            <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDownload(file.id)} className="text-vault-text-secondary hover:text-vault-accent transition-colors" title="Retrieve">
                        <Download className="h-4 w-4" strokeWidth={1.25} />
                    </button>
                    <button onClick={() => onShare(file.id)} className="text-vault-text-secondary hover:text-vault-accent transition-colors" title="Share Access">
                        <Share2 className="h-4 w-4" strokeWidth={1.25} />
                    </button>
                    <button onClick={() => onDelete(file.id)} className="text-vault-text-secondary hover:text-red-700 transition-colors" title="Expunge">
                        <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                    </button>
                </div>
            </td>
        </tr>
    );
};
