"use client";
import React, { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
    CloudUpload,
    File,
    Check,
    X,
    Loader2,
    Lock,
    ShieldCheck,
    Archive
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

interface UploadingFile {
    file: File;
    progress: number;
    status: "pending" | "uploading" | "success" | "error";
    error?: string;
}

export default function UploadPage() {
    const { accessToken, user } = useAuth();
    const [selectedFiles, setSelectedFiles] = useState<UploadingFile[]>([]);
    const [category, setCategory] = useState("Documents");
    const [isPublic, setIsPublic] = useState(false);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    }, []);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const addFiles = (files: File[]) => {
        const newFiles = files.map(file => ({
            file,
            progress: 0,
            status: "pending" as const
        }));
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const startUpload = async () => {
        const pendingFiles = selectedFiles.map((f, i) => ({ ...f, index: i })).filter(f => f.status === "pending" || f.status === "error");

        if (pendingFiles.length === 0) return;

        for (const f of pendingFiles) {
            await uploadSingleFile(f.index);
        }
    };

    const uploadSingleFile = async (index: number) => {
        const fileItem = selectedFiles[index];
        setSelectedFiles(prev => {
            const copy = [...prev];
            copy[index].status = "uploading";
            return copy;
        });

        try {
            const formData = new FormData();
            formData.append("file", fileItem.file);
            formData.append("category", category);
            formData.append("isPublic", String(isPublic));

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9442/api/v1'}/files/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setSelectedFiles(prev => {
                        const copy = [...prev];
                        copy[index].progress = progress;
                        return copy;
                    });
                }
            });

            if (response.status === 200) {
                setSelectedFiles(prev => {
                    const copy = [...prev];
                    copy[index].status = "success";
                    return copy;
                });
                toast.success(`Asset "${fileItem.file.name}" secured`);
            }
        } catch (error: any) {
            console.error("Deposit error:", error);
            setSelectedFiles(prev => {
                const copy = [...prev];
                copy[index].status = "error";
                copy[index].error = error.response?.data?.message || "Deposit rejected";
                return copy;
            });
            toast.error(`Failed to secure ${fileItem.file.name}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto flex flex-col gap-12 pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vault-border pb-6">
                    <div>
                        <h1 className="text-5xl font-serif text-vault-text-primary">Asset Deposit</h1>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary mt-2">
                            Secure ingestion into the Vault Perimeter
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-vault-text-secondary">Deposit Origin</p>
                            <p className="text-vault-text-primary text-xs font-medium uppercase tracking-tighter">Terminal ID: {user?.id?.slice(0, 8) || "SYSTEM"}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Deposit Area */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            className="group relative h-80 border border-vault-border bg-vault-surface flex flex-col items-center justify-center gap-6 hover:border-vault-accent transition-all duration-500 cursor-pointer overflow-hidden"
                            onClick={() => document.getElementById("fileInput")?.click()}
                        >
                            <input
                                id="fileInput"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={onFileSelect}
                            />

                            {/* Vault Slot Aesthetic */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-vault-border group-hover:bg-vault-accent transition-colors duration-500" />
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-vault-border group-hover:bg-vault-accent transition-colors duration-500" />

                            <div className="h-20 w-20 flex items-center justify-center text-vault-text-secondary group-hover:text-vault-accent transition-all duration-500 group-hover:scale-110">
                                <CloudUpload strokeWidth={0.75} className="h-16 w-16" />
                            </div>

                            <div className="text-center">
                                <p className="font-serif text-2xl text-vault-text-primary">Release Assets for Ingestion</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-vault-text-secondary mt-2">Click to browse or drag documents into slot</p>
                            </div>
                        </div>

                        {/* Inventory for Deposit */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-vault-text-secondary font-medium">Pending Ingestion Inventory</h3>
                                <div className="border border-vault-border bg-vault-surface divide-y divide-vault-border">
                                    {selectedFiles.map((fileItem, i) => (
                                        <div key={i} className="p-4 flex items-center gap-6 group">
                                            <div className="h-10 w-10 bg-vault-bg border border-vault-border flex items-center justify-center text-vault-text-secondary group-hover:text-vault-accent transition-colors">
                                                <File strokeWidth={1} className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-serif text-[15px] text-vault-text-primary truncate">{fileItem.file.name}</p>
                                                <p className="text-[10px] uppercase tracking-wider text-vault-text-secondary">{formatBytes(fileItem.file.size)}</p>
                                                {fileItem.status === "uploading" && (
                                                    <div className="mt-3 h-[1px] w-full bg-vault-border relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 h-full bg-vault-accent transition-all duration-300" style={{ width: `${fileItem.progress}%` }}></div>
                                                    </div>
                                                )}
                                                {fileItem.status === "error" && (
                                                    <p className="text-[9px] uppercase tracking-tighter text-red-600 mt-1 font-medium">{fileItem.error}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {fileItem.status === "success" && <Check className="h-4 w-4 text-green-600" strokeWidth={2} />}
                                                {fileItem.status === "error" && <X className="h-4 w-4 text-red-600" strokeWidth={2} />}
                                                {fileItem.status === "uploading" && <Loader2 className="h-4 w-4 text-vault-accent animate-spin" strokeWidth={1.5} />}
                                                {fileItem.status === "pending" && (
                                                    <button onClick={() => removeFile(i)} className="text-vault-text-secondary hover:text-red-600 transition-colors">
                                                        <X className="h-4 w-4" strokeWidth={1.25} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Protocol Settings */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-vault-surface border border-vault-border p-8">
                            <h3 className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary font-bold mb-8 flex items-center gap-2">
                                <Lock className="h-3 w-3" strokeWidth={2} /> Ingestion Protocol
                            </h3>

                            <div className="flex flex-col gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-medium">Asset Classification</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-vault-bg border border-vault-border text-vault-text-primary px-4 py-3 outline-none focus:border-vault-accent transition-colors font-serif text-base"
                                    >
                                        <option>Documents</option>
                                        <option>Images</option>
                                        <option>Media</option>
                                        <option>Archives</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-medium">Visibility Clearance</label>
                                    <div
                                        onClick={() => setIsPublic(!isPublic)}
                                        className="flex items-center justify-between p-4 bg-vault-bg border border-vault-border cursor-pointer group hover:border-vault-accent transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase tracking-wider font-medium text-vault-text-primary">Public Link</span>
                                            <span className="text-[9px] text-vault-text-secondary uppercase tracking-tighter mt-1">External Access Enabled</span>
                                        </div>
                                        <div className={cn(
                                            "h-4 w-4 border flex items-center justify-center transition-colors",
                                            isPublic ? "bg-vault-accent border-vault-accent" : "border-vault-border"
                                        )}>
                                            {isPublic && <Check className="h-3 w-3 text-vault-bg" strokeWidth={3} />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={startUpload}
                                disabled={selectedFiles.length === 0 || selectedFiles.every(f => f.status === "success" || f.status === "uploading")}
                                className="w-full mt-10 bg-vault-accent hover:bg-vault-text-primary text-vault-bg disabled:opacity-30 disabled:grayscale py-4 flex items-center justify-center gap-3 transition-all duration-300"
                            >
                                <Lock className="h-4 w-4" strokeWidth={1.5} />
                                <span className="text-xs uppercase tracking-[0.2em] font-bold">Execute Deposit</span>
                            </button>
                        </div>

                        <div className="border border-vault-border bg-vault-accent/5 p-6 space-y-4">
                            <h4 className="text-[10px] uppercase tracking-wider text-vault-accent font-bold flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} /> Integrity Scans Active
                            </h4>
                            <p className="text-[11px] text-vault-text-secondary leading-relaxed font-sans uppercase tracking-tight">
                                Every asset is processed through a zero-trust multi-engine analysis before permanent cold storage encryption.
                                Metadata is extracted and indexed for semantic retrieval.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
