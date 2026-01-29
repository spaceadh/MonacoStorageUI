"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ScopeSelector } from "@/components/ScopeSelector";
import { SearchHistorySidebar } from "@/components/SearchHistorySidebar";
import { apiClient } from "@/lib/api";
import {
    Search,
    Brain,
    Cpu,
    Sparkles,
    ArrowRight,
    Loader2,
    Database,
    Binary,
    Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";
import { VisibilityLevel, SearchHistoryEntry, UserScopes, SearchResultItem, MultiScopeSearchResponse } from "@/types/search";

export default function SemanticSearchPage() {
    const { accessToken, isLoading } = useAuth();
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [scopeBreakdown, setScopeBreakdown] = useState<Record<string, number>>({});
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedScopes, setSelectedScopes] = useState<VisibilityLevel[]>([
        VisibilityLevel.PRIVATE,
        VisibilityLevel.DEPARTMENT,
        VisibilityLevel.ORGANIZATION,
        VisibilityLevel.PUBLIC,
    ]);
    const [userScopes, setUserScopes] = useState<UserScopes | null>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [executionTime, setExecutionTime] = useState<number | null>(null);

    // Load user scopes and search history on mount
    useEffect(() => {
        if (accessToken) {
            loadUserScopes();
            loadSearchHistory();
        }
    }, [accessToken]);

    const loadUserScopes = async () => {
        try {
            const scopes = await apiClient.getUserScopes(accessToken!);
            setUserScopes(scopes);
        } catch (error) {
            console.warn("Failed to load user scopes:", error);
        }
    };

    const loadSearchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const response = await apiClient.getSearchHistory(accessToken!, 0, 20);
            setSearchHistory(response.content || []);
        } catch (error) {
            console.warn("Failed to load search history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim() || !accessToken) return;

        try {
            setIsSearching(true);
            setHasSearched(true);

            const startTime = Date.now();

            const response = await apiClient.multiScopeSearch(
                {
                    query: query.trim(),
                    nResults: 5,
                    scopes: selectedScopes,
                },
                accessToken
            );

            const elapsed = Date.now() - startTime;
            setExecutionTime(elapsed);

            if (response && response.results) {
                setResults(response.results);
                setScopeBreakdown(response.scopeBreakdown || {});
                toast.success(`Found ${response.results.length} results in ${elapsed}ms`);

                // Reload search history to show new search
                loadSearchHistory();
            }
        } catch (error) {
            console.error("Search failed:", error);
            toast.error("Search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectHistorySearch = async (entry: any) => {
        if (!entry.query) return;

        setQuery(entry.query);

        // Parse scopes from history entry
        try {
            if (entry.searchedScopesJson) {
                const parsedScopes = JSON.parse(entry.searchedScopesJson);
                if (Array.isArray(parsedScopes)) {
                    setSelectedScopes(parsedScopes);
                }
            }
        } catch (e) {
            console.warn("Failed to parse scopes:", e);
        }

        // Execute search with same parameters
        setTimeout(() => {
            handleSearch();
        }, 100);
    };

    const handleDeleteHistoryEntry = async (id: number) => {
        try {
            await apiClient.deleteSearchHistoryEntry(id, accessToken!);
            setSearchHistory(searchHistory.filter(h => h.id !== id));
            toast.success("Search entry deleted");
        } catch (error) {
            console.error("Failed to delete search:", error);
            toast.error("Failed to delete search entry");
        }
    };

    if (isLoading) {
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
            <div className="flex gap-8 max-w-7xl mx-auto">
                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-serif text-vault-text-primary italic">
                            Neural Analytic Search
                        </h1>
                        <p className="text-[11px] uppercase tracking-[0.4em] text-vault-text-secondary font-bold">
                            Contextual Asset Discovery & Relational Querying
                        </p>
                    </div>

                    {/* Scope Selector */}
                    <ScopeSelector
                        selected={selectedScopes}
                        onChange={setSelectedScopes}
                        userScopes={userScopes}
                        disabled={isSearching}
                    />

                    {/* Search Interface */}
                    <div className="relative group">
                        <form
                            onSubmit={handleSearch}
                            className="relative z-10 border border-vault-border bg-vault-surface p-2 focus-within:border-vault-accent transition-colors duration-500"
                        >
                            <div className="flex items-center gap-4 px-6 py-4">
                                <Brain
                                    className={cn(
                                        "h-6 w-6 text-vault-text-secondary transition-colors duration-700",
                                        isSearching
                                            ? "text-vault-accent animate-pulse"
                                            : "group-hover:text-vault-accent"
                                    )}
                                    strokeWidth={1}
                                />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Enter contextual query (e.g., 'Financial documents related to Q3 expansion')"
                                    className="flex-1 bg-transparent border-none outline-none text-xl font-serif text-vault-text-primary placeholder:text-vault-text-secondary/30 placeholder:italic"
                                    disabled={isSearching}
                                />
                                <button
                                    type="submit"
                                    disabled={isSearching || !query.trim()}
                                    className="flex items-center gap-3 px-8 py-3 bg-vault-accent hover:bg-vault-text-primary disabled:opacity-30 text-vault-bg transition-colors font-bold uppercase tracking-widest text-[11px]"
                                >
                                    {isSearching ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Search className="h-3 w-3" strokeWidth={2.5} />
                                    )}
                                    Execute
                                </button>
                            </div>
                        </form>

                        <div className="absolute -inset-4 bg-vault-accent/5 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    </div>

                    {/* Status Bar */}
                    {isSearching && (
                        <div className="flex items-center justify-center gap-6 py-4 border-y border-vault-border bg-vault-surface/30">
                            <div className="flex items-center gap-2">
                                <Cpu className="h-3 w-3 text-vault-accent animate-spin" strokeWidth={1} />
                                <span className="text-[9px] uppercase tracking-[0.2em] text-vault-accent font-bold">
                                    Neural Reasoning
                                </span>
                            </div>
                            <div className="w-32 h-0.5 bg-vault-border relative overflow-hidden">
                                <div className="absolute inset-0 bg-vault-accent animate-scan" />
                            </div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-vault-text-secondary font-bold italic">
                                Mapping Relational Vectors...
                            </span>
                        </div>
                    )}

                    {/* Results Section */}
                    <div className="flex flex-col gap-8">
                        {hasSearched && !isSearching && results.length === 0 && (
                            <div className="py-24 text-center border border-vault-border bg-vault-surface/50">
                                <Database className="h-12 w-12 text-vault-text-secondary/20 mx-auto mb-6" strokeWidth={0.5} />
                                <p className="text-[11px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                    No relational matches found
                                </p>
                            </div>
                        )}

                        {!isSearching && results.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-vault-border pb-4">
                                    <span className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                        Identified {results.length} Results
                                        {executionTime && ` (${executionTime}ms)`}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 text-vault-accent" />
                                        <span className="text-[10px] uppercase tracking-widest text-vault-accent font-bold italic">
                                            High Confidence Mapping
                                        </span>
                                    </div>
                                </div>

                                {/* Scope Breakdown */}
                                {Object.keys(scopeBreakdown).length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(scopeBreakdown).map(([scope, count]) => (
                                            <div
                                                key={scope}
                                                className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-vault-border rounded bg-vault-bg"
                                            >
                                                {scope}: {count}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4">
                                    {results.map((result) => (
                                        <div
                                            key={result.fileId}
                                            className="group relative bg-vault-surface border border-vault-border p-6 hover:border-vault-accent transition-all duration-500 overflow-hidden"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                                {/* Distance/Relevance Meter */}
                                                <div className="flex flex-col items-center justify-center border-r border-vault-border pr-6 min-w-25">
                                                    <span className="text-[9px] uppercase tracking-widest text-vault-text-secondary mb-2 font-bold opacity-60">
                                                        Distance
                                                    </span>
                                                    <span className="text-3xl font-serif text-vault-accent italic">
                                                        {result.distance.toFixed(2)}
                                                    </span>
                                                    <div className="w-full h-1 bg-vault-bg mt-3 border border-vault-border overflow-hidden">
                                                        <div
                                                            className="h-full bg-vault-accent transition-all duration-1000 delay-300"
                                                            style={{
                                                                width: `${Math.max(0, Math.min(100, (1 - result.distance) * 100))}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Content Info */}
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 text-vault-accent mb-1">
                                                                <Binary className="h-3 w-3" strokeWidth={1} />
                                                                <span className="text-[9px] uppercase tracking-widest font-bold">
                                                                    Vector Match
                                                                </span>
                                                            </div>
                                                            <h3 className="text-2xl font-serif text-vault-text-primary group-hover:text-vault-accent transition-colors">
                                                                {result.sourceDocument}
                                                            </h3>
                                                        </div>
                                                        {result.collectionName && (
                                                            <span className="text-[8px] px-2 py-1 border border-vault-border rounded bg-vault-bg text-vault-text-secondary uppercase tracking-tight font-bold">
                                                                {result.collectionName.replace("monaco_", "")}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="bg-vault-bg/50 border border-vault-border p-4 relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-vault-accent" />
                                                        <div className="flex gap-4">
                                                            <Sparkles className="h-4 w-4 text-vault-accent shrink-0 mt-1 opacity-50" strokeWidth={1.5} />
                                                            <p className="text-xs text-vault-text-secondary leading-relaxed italic">
                                                                <span className="text-[10px] uppercase tracking-widest font-bold text-vault-text-primary not-italic mr-2">
                                                                    Result:
                                                                </span>
                                                                {result.text.substring(0, 200)}
                                                                {result.text.length > 200 ? "..." : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <div className="flex items-center justify-end md:justify-center border-l border-vault-border md:pl-6">
                                                    <button className="flex items-center gap-2 bg-vault-bg border border-vault-border p-4 hover:border-vault-accent hover:text-vault-accent transition-colors group/btn">
                                                        <span className="text-[10px] uppercase tracking-widest font-bold">
                                                            View
                                                        </span>
                                                        <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>

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
                    <div className="border-t border-vault-border pt-10 flex flex-col md:flex-row justify-between gap-6 opacity-40 transition-all">
                        <div className="flex items-center gap-4">
                            <Database className="h-4 w-4 text-vault-text-secondary" strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">
                                Multi-scope semantic search engine
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] uppercase tracking-widest font-bold">Engine: MONACO-NEURAL-V5</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-green-700 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Sidebar - Search History */}
                <div className="w-full md:w-96">
                    <SearchHistorySidebar
                        entries={searchHistory}
                        onSelectSearch={handleSelectHistorySearch}
                        onDeleteEntry={handleDeleteHistoryEntry}
                        isLoading={isLoadingHistory}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
