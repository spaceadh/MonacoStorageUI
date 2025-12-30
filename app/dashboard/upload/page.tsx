"use client";
import React, { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
    IconUpload,
    IconFile,
    IconCheck,
    IconX,
    IconLoader2,
    IconCloudUpload
} from "@tabler/icons-react";
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
    const { accessToken } = useAuth();
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

            // Use raw axios for progress tracking
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
                toast.success(`Uploaded ${fileItem.file.name}`);
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            setSelectedFiles(prev => {
                const copy = [...prev];
                copy[index].status = "error";
                copy[index].error = error.response?.data?.message || "Upload failed";
                return copy;
            });
            toast.error(`Failed to upload ${fileItem.file.name}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Upload Assets</h1>
                    <p className="text-neutral-500 mt-1">Add new files to your secure storage perimeter</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Area */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            className="group relative h-64 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white dark:bg-neutral-800/30 hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer transition-all duration-300"
                            onClick={() => document.getElementById("fileInput")?.click()}
                        >
                            <input
                                id="fileInput"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={onFileSelect}
                            />
                            <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <IconCloudUpload className="h-10 w-10" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Click or drag to upload</p>
                                <p className="text-sm text-neutral-500 mt-1">Any file types up to 100MB supported</p>
                            </div>
                        </div>

                        {/* File List */}
                        {selectedFiles.length > 0 && (
                            <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-2 flex flex-col divide-y divide-neutral-100 dark:divide-neutral-700/50">
                                {selectedFiles.map((fileItem, i) => (
                                    <div key={i} className="p-4 flex items-center gap-4 group">
                                        <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500">
                                            <IconFile className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{fileItem.file.name}</p>
                                            <p className="text-xs text-neutral-500">{formatBytes(fileItem.file.size)}</p>
                                            {fileItem.status === "uploading" && (
                                                <div className="mt-2 h-1 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${fileItem.progress}%` }}></div>
                                                </div>
                                            )}
                                            {fileItem.status === "error" && (
                                                <p className="text-[10px] text-red-500 mt-1">{fileItem.error}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {fileItem.status === "success" && <IconCheck className="h-5 w-5 text-green-500" />}
                                            {fileItem.status === "error" && <IconX className="h-5 w-5 text-red-500" />}
                                            {fileItem.status === "uploading" && <IconLoader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                                            {fileItem.status === "pending" && (
                                                <button onClick={() => removeFile(i)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <IconX className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Settings Area */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-700/50 shadow-sm">
                            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-6">Upload Settings</h3>

                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-500">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-xl border-none focus:ring-2 focus:ring-blue-500 py-3 px-4"
                                    >
                                        <option>Documents</option>
                                        <option>Images</option>
                                        <option>Media</option>
                                        <option>Archives</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Public Access</span>
                                        <span className="text-[10px] text-neutral-500">Anyone with the link can view</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="h-5 w-5 rounded-md border-neutral-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={startUpload}
                                disabled={selectedFiles.length === 0 || selectedFiles.every(f => f.status === "success" || f.status === "uploading")}
                                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                            >
                                <IconUpload className="h-5 w-5" /> Start Upload
                            </button>
                        </div>

                        <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/20">
                            <h4 className="text-sm font-bold text-blue-500 mb-2 flex items-center gap-2">
                                <IconCheck className="h-4 w-4" /> Optimization Active
                            </h4>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Your uploads are automatically scanned for malware and optimized for global edge delivery.
                                Images are lazily loaded and compressed without visible quality loss.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
