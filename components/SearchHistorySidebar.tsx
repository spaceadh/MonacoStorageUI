"use client";

import React, { useState } from "react";
import {
  SearchHistoryEntry,
  VisibilityLevel,
  ParsedSearchHistoryEntry,
} from "@/types/search";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  X,
  Trash2,
  MoreVertical,
  Copy,
  Share2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchHistorySidebarProps {
  entries: SearchHistoryEntry[];
  onSelectSearch: (entry: ParsedSearchHistoryEntry) => void;
  onDeleteEntry: (id: number) => Promise<void>;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

interface ScopeInfo {
  label: string;
  color: string;
  icon: string;
}

const scopeInfo: Record<VisibilityLevel, ScopeInfo> = {
  [VisibilityLevel.PRIVATE]: {
    label: "Private",
    color: "bg-blue-500/10 text-blue-600",
    icon: "🔒",
  },
  [VisibilityLevel.DEPARTMENT]: {
    label: "Department",
    color: "bg-purple-500/10 text-purple-600",
    icon: "👥",
  },
  [VisibilityLevel.ORGANIZATION]: {
    label: "Organization",
    color: "bg-orange-500/10 text-orange-600",
    icon: "🏢",
  },
  [VisibilityLevel.PUBLIC]: {
    label: "Public",
    color: "bg-green-500/10 text-green-600",
    icon: "🌐",
  },
};

export const SearchHistorySidebar: React.FC<SearchHistorySidebarProps> = ({
  entries,
  onSelectSearch,
  onDeleteEntry,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const parseSearchEntry = (
    entry: SearchHistoryEntry
  ): ParsedSearchHistoryEntry => {
    let parsedScopes: VisibilityLevel[] = [];

    try {
      if (entry.searchedScopesJson) {
        parsedScopes = JSON.parse(entry.searchedScopesJson);
      }
    } catch (e) {
      console.warn("Failed to parse scopes:", e);
    }

    let parsedFilters = {};
    try {
      if (entry.filtersJson) {
        parsedFilters = JSON.parse(entry.filtersJson);
      }
    } catch (e) {
      console.warn("Failed to parse filters:", e);
    }

    return {
      ...entry,
      parsedScopes: Array.isArray(parsedScopes) ? parsedScopes : [],
      parsedFilters,
    };
  };

  const handleSelectSearch = (entry: SearchHistoryEntry) => {
    const parsed = parseSearchEntry(entry);
    onSelectSearch(parsed);
  };

  const handleDeleteSearch = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);

    try {
      await onDeleteEntry(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyQuery = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(query);
  };

  if (isLoading && entries.length === 0) {
    return (
      <div className="w-full md:w-80 flex flex-col gap-4 border border-vault-border rounded bg-vault-bg p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-vault-accent" strokeWidth={1.5} />
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-vault-text-primary">
            Search History
          </h3>
          <Loader2 className="h-3 w-3 text-vault-accent animate-spin ml-auto" />
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 text-vault-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 flex flex-col gap-0 border border-vault-border rounded bg-vault-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-vault-border bg-vault-surface">
        <Clock className="h-4 w-4 text-vault-accent" strokeWidth={1.5} />
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-vault-text-primary">
          Recent Searches
        </h3>
        <span className="ml-auto text-[9px] text-vault-text-secondary font-mono">
          {entries.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-vault-text-secondary font-bold">
                No searches yet
              </p>
              <p className="text-[8px] text-vault-text-secondary/60 mt-1 italic">
                Your search history will appear here
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-vault-border">
            {entries.map((entry) => {
              const parsed = parseSearchEntry(entry);
              const timestamp = new Date(entry.timestamp);
              const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

              return (
                <li
                  key={entry.id}
                  onMouseEnter={() => setHoveredId(entry.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group cursor-pointer hover:bg-vault-surface/50 transition-colors duration-200"
                >
                  <button
                    onClick={() => handleSelectSearch(entry)}
                    disabled={deletingId === entry.id}
                    className="w-full text-left px-3 py-2.5 disabled:opacity-50"
                  >
                    {/* Query text */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[10px] font-medium text-vault-text-primary truncate flex-1 group-hover:text-vault-accent transition-colors">
                        {entry.query.length > 40
                          ? entry.query.substring(0, 40) + "..."
                          : entry.query}
                      </p>
                      {hoveredId === entry.id && (
                        <Copy
                          className="h-3 w-3 text-vault-text-secondary hover:text-vault-accent shrink-0"
                          strokeWidth={1.5}
                          onClick={(e) => handleCopyQuery(entry.query, e)}
                        />
                      )}
                    </div>

                    {/* Metadata row */}
                    <div className="flex items-center gap-2 text-[8px] text-vault-text-secondary/70">
                      <span className="font-mono">{entry.resultCount} results</span>
                      <span>•</span>
                      <span>{timeAgo}</span>
                    </div>

                    {/* Scopes */}
                    {parsed.parsedScopes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {parsed.parsedScopes.map((scope) => {
                          const info = scopeInfo[scope] || scopeInfo.PRIVATE;
                          return (
                            <span
                              key={scope}
                              className={cn(
                                "text-[7px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight",
                                info.color
                              )}
                            >
                              {info.icon} {info.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Status indicator */}
                    {!entry.wasSuccessful && (
                      <p className="text-[7px] text-red-600 mt-1 font-bold">
                        ⚠ Search failed
                      </p>
                    )}
                  </button>

                  {/* Delete button */}
                  {hoveredId === entry.id && (
                    <div className="absolute right-2 top-2 opacity-100">
                      <button
                        onClick={(e) => handleDeleteSearch(entry.id, e)}
                        disabled={deletingId === entry.id}
                        className="p-1 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                        title="Delete search"
                      >
                        {deletingId === entry.id ? (
                          <Loader2 className="h-3 w-3 text-red-500 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-vault-text-secondary hover:text-red-500 transition-colors" />
                        )}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full px-3 py-2 border-t border-vault-border text-[9px] uppercase tracking-widest font-bold text-vault-accent hover:bg-vault-surface transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 inline animate-spin" />
          ) : (
            "Load More"
          )}
        </button>
      )}
    </div>
  );
};
