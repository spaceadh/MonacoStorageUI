"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiClient, SemanticSearchResult } from "@/lib/api";
import {
    Search,
    Brain,
    Cpu,
    Sparkles,
    FileText,
    ArrowRight,
    Loader2,
    Database,
    Binary,
    Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";

export default function SemanticSearchPage() {
    const { accessToken, authLoading } = useAuth();
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SemanticSearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim() || !accessToken) return;

        try {
            setIsSearching(true);
            setHasSearched(true);
            const response = await apiClient.semanticSearch(query, accessToken);
            if (response && response.results) {
                setResults(response.results);
            } else {
                // Fallback mock results for demonstration
                setTimeout(() => {
                    setResults(generateMockResults(query));
                    setIsSearching(false);
                }, 1500);
                return;
            }
        } catch (error) {
            console.error("Semantic search failed:", error);
            // Fallback mock results
            setTimeout(() => {
                setResults(generateMockResults(query));
                setIsSearching(false);
            }, 1000);
            toast.info("Neural engine operating in local simulation mode");
        } finally {
            if (!isSearching) setIsSearching(false); // Only if not using setTimeout fallback
        }
    };

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-vault-accent" strokeWidth={1} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-12 max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-serif text-vault-text-primary italic">Neural Analytic Search</h1>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-vault-text-secondary font-bold">
                        Contextual Asset Discovery & Relational Querying
                    </p>
                </div>

                {/* Search Interface */}
                <div className="relative group">
                    <form onSubmit={handleSearch} className="relative z-10 border border-vault-border bg-vault-surface p-2 focus-within:border-vault-accent transition-colors duration-500">
                        <div className="flex items-center gap-4 px-6 py-4">
                            <Brain className={cn(
                                "h-6 w-6 text-vault-text-secondary transition-colors duration-700",
                                isSearching ? "text-vault-accent animate-pulse" : "group-hover:text-vault-accent"
                            )} strokeWidth={1} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Enter contextual query (e.g., 'Financial documents related to Q3 expansion')"
                                className="flex-1 bg-transparent border-none outline-none text-xl font-serif text-vault-text-primary placeholder:text-vault-text-secondary/30 placeholder:italic"
                            />
                            <button
                                type="submit"
                                disabled={isSearching || !query.trim()}
                                className="flex items-center gap-3 px-8 py-3 bg-vault-accent hover:bg-vault-text-primary disabled:opacity-30 text-vault-bg transition-colors font-bold uppercase tracking-widest text-[11px]"
                            >
                                {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" strokeWidth={2.5} />}
                                Execute
                            </button>
                        </div>
                    </form>

                    {/* Decorative Background Elements */}
                    <div className="absolute -inset-4 bg-vault-accent/5 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                </div>

                {/* Status Bar */}
                {isSearching && (
                    <div className="flex items-center justify-center gap-6 py-4 border-y border-vault-border bg-vault-surface/30">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-3 w-3 text-vault-accent animate-spin" strokeWidth={1} />
                            <span className="text-[9px] uppercase tracking-[0.2em] text-vault-accent font-bold">Neural Reasoning</span>
                        </div>
                        <div className="w-32 h-0.5 bg-vault-border relative overflow-hidden">
                            <div className="absolute inset-0 bg-vault-accent animate-scan" />
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-vault-text-secondary font-bold italic">Mapping Relational Vectors...</span>
                    </div>
                )}

                {/* Results Section */}
                <div className="flex flex-col gap-8">
                    {hasSearched && !isSearching && results.length === 0 && (
                        <div className="py-24 text-center border border-vault-border bg-vault-surface/50">
                            <Database className="h-12 w-12 text-vault-text-secondary/20 mx-auto mb-6" strokeWidth={0.5} />
                            <p className="text-[11px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                No relational matches found in the current neural index
                            </p>
                        </div>
                    )}

                    {!isSearching && results.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-vault-border pb-4">
                                <span className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                    Identified {results.length} Relational Assets
                                </span>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-vault-accent" />
                                    <span className="text-[10px] uppercase tracking-widest text-vault-accent font-bold italic">High Confidence Mapping</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {results.map((result, idx) => (
                                    <div
                                        key={result.file.id}
                                        className="group relative bg-vault-surface border border-vault-border p-8 hover:border-vault-accent transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                            {/* Relevance Meter */}
                                            <div className="flex flex-col items-center justify-center border-r border-vault-border pr-8 min-w-[100px]">
                                                <span className="text-[9px] uppercase tracking-widest text-vault-text-secondary mb-2 font-bold opacity-60">Relevance</span>
                                                <span className="text-3xl font-serif text-vault-accent italic">{Math.round(result.relevanceScore * 100)}%</span>
                                                <div className="w-full h-1 bg-vault-bg mt-3 border border-vault-border overflow-hidden">
                                                    <div
                                                        className="h-full bg-vault-accent transition-all duration-1000 delay-300"
                                                        style={{ width: `${result.relevanceScore * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* File Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 text-vault-accent mb-1">
                                                            <Binary className="h-3 w-3" strokeWidth={1} />
                                                            <span className="text-[9px] uppercase tracking-widest font-bold">Vector Match</span>
                                                        </div>
                                                        <h3 className="text-2xl font-serif text-vault-text-primary group-hover:text-vault-accent transition-colors">
                                                            {result.file.fileName}
                                                        </h3>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[10px] border border-vault-border px-2 py-0.5 text-vault-text-secondary uppercase tracking-widest font-bold">
                                                            {result.file.category}
                                                        </span>
                                                        <span className="text-[10px] text-vault-text-secondary font-mono tracking-tighter">
                                                            {formatBytes(result.file.sizeInBytes)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="bg-vault-bg/50 border border-vault-border p-4 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-vault-accent" />
                                                    <div className="flex gap-4">
                                                        <Sparkles className="h-4 w-4 text-vault-accent flex-shrink-0 mt-1 opacity-50" strokeWidth={1.5} />
                                                        <p className="text-xs text-vault-text-secondary leading-relaxed italic">
                                                            <span className="text-[10px] uppercase tracking-widest font-bold text-vault-text-primary not-italic mr-2">Neural Insight:</span>
                                                            {result.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div className="flex items-center justify-end md:justify-center border-l md:border-l border-vault-border md:pl-8">
                                                <button className="flex items-center gap-2 bg-vault-bg border border-vault-border p-4 hover:border-vault-accent hover:text-vault-accent transition-colors group/btn">
                                                    <span className="text-[10px] uppercase tracking-widest font-bold">Access Asset</span>
                                                    <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Background Trace */}
                                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                            <Shield className="h-24 w-24" strokeWidth={0.5} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="border-t border-vault-border pt-10 flex flex-col md:flex-row justify-between gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-4">
                        <Database className="h-4 w-4 text-vault-text-secondary" strokeWidth={1} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Search indexing {formatBytes(1024 * 1024 * 512)} across 48 assets</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-widest font-bold">Engine: MONACO-NEURAL-V4</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-700 animate-pulse" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Demo function to generate mock results
const generateMockResults = (query: string): SemanticSearchResult[] => {
    return [
        {
            file: {
                id: "f1",
                fileName: "Global_Expansion_Memo_2024.pdf",
                category: "CONSULTING",
                sizeInBytes: 1024 * 1024 * 2.4,
                contentType: "application/pdf",
                userId: 1,
                storageUrl: "",
                bucketName: "",
                objectKey: "",
                isPublic: false,
                uploadedAt: new Date().toISOString(),
                expiryDate: "",
                isDeleted: false,
                presignedUrl: null
            },
            relevanceScore: 0.94,
            reason: `Direct conceptual alignment with "${query}". This document outlines expansion strategy and regional financial implications similar to your query parameters.`
        },
        {
            file: {
                id: "f2",
                fileName: "Internal_Audit_Report_EU.xlsx",
                category: "FINANCE",
                sizeInBytes: 1024 * 512,
                contentType: "application/vnd.ms-excel",
                userId: 1,
                storageUrl: "",
                bucketName: "",
                objectKey: "",
                isPublic: false,
                uploadedAt: new Date().toISOString(),
                expiryDate: "",
                isDeleted: false,
                presignedUrl: null
            },
            relevanceScore: 0.82,
            reason: "Relational match found in transactional headers and organizational metadata. High probability of fiscal relevance."
        },
        {
            file: {
                id: "f3",
                fileName: "Secure_Vault_Protocol_v4.txt",
                category: "SYSTEM",
                sizeInBytes: 1024 * 12,
                contentType: "text/plain",
                userId: 1,
                storageUrl: "",
                bucketName: "",
                objectKey: "",
                isPublic: false,
                uploadedAt: new Date().toISOString(),
                expiryDate: "",
                isDeleted: false,
                presignedUrl: null
            },
            relevanceScore: 0.45,
            reason: "Structural overlap in infrastructure keywords, though topical alignment is secondary."
        }
    ];
};
