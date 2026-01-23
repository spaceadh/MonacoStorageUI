"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiClient, AuditLog } from "@/lib/api";
import {
    History,
    Search,
    Filter,
    Download,
    ShieldCheck,
    AlertCircle,
    User,
    Clock,
    FileText,
    Loader2,
    CheckCircle2,
    XCircle,
    Info
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AuditLogsPage() {
    const { accessToken, isLoading: authLoading } = useAuth();
    const [logs, setLogs] = useState<AuditLogUI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        if (!authLoading && accessToken) {
            loadLogs(currentPage);
        }
    }, [accessToken, authLoading, currentPage]);

    const loadLogs = async (page: number) => {
        try {
            setIsLoading(true);
            const result = await apiClient.getAuditLogs(accessToken!, page, 50);
            if (result && result.logs) {
                // Convert backend format to UI format
                const uiLogs: AuditLogUI[] = result.logs.map(log => ({
                    id: log.id.toString(),
                    timestamp: formatDateTime(log.timestamp),
                    actor: log.email,
                    operation: log.action,
                    resource: log.additionalData || "N/A",
                    status: log.type === 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
                    details: log.additionalData
                }));
                setLogs(uiLogs);
                setTotalPages(result.totalPages);
                setTotalElements(result.totalElements);
            } else {
                // Fallback to mock data for demonstration if backend is not ready
                setLogs(MOCK_AUDIT_LOGS_UI);
            }
        } catch (err) {
            console.error("Failed to load audit logs:", err);
            setLogs(MOCK_AUDIT_LOGS_UI);
            toast.info("Displaying local audit registry (System Offline)");
        } finally {
            setIsLoading(false);
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
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
            <div className="flex flex-col gap-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vault-border pb-6">
                    <div>
                        <h1 className="text-4xl font-serif text-vault-text-primary">Audit Registry</h1>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary mt-2">
                            Verifiable Activity Provenance & System Event Log
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-vault-border hover:border-vault-accent text-vault-text-secondary hover:text-vault-accent transition-colors">
                        <Download className="h-3 w-3" strokeWidth={1.5} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Export Trail</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-vault-text-secondary group-hover:text-vault-accent transition-colors" strokeWidth={1.25} />
                            <input
                                type="text"
                                placeholder="Filter Provenance Index..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-vault-border focus:border-vault-accent outline-none text-vault-text-primary placeholder:text-vault-text-secondary/40 transition-colors font-serif"
                            />
                        </div>

                        <div className="flex items-center gap-4 border-l border-vault-border pl-6">
                            <Filter className="h-3 w-3 text-vault-text-secondary" strokeWidth={1.25} />
                            <div className="flex gap-2">
                                {["ALL", "SUCCESS", "FAILURE", "WARNING"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={cn(
                                            "px-3 py-1 text-[9px] uppercase tracking-widest font-bold border transition-colors",
                                            statusFilter === status
                                                ? "bg-vault-accent text-vault-bg border-vault-accent"
                                                : "text-vault-text-secondary border-vault-border hover:border-vault-accent hover:text-vault-accent"
                                        )}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Table */}
                <div className="border border-vault-border bg-vault-surface overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-vault-bg/50 border-b border-vault-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-vault-text-secondary uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-vault-text-secondary uppercase tracking-[0.2em]">Principal</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-vault-text-secondary uppercase tracking-[0.2em]">Operation</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-vault-text-secondary uppercase tracking-[0.2em]">Resource Ref</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-vault-text-secondary uppercase tracking-[0.2em]">Verification</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-vault-text-secondary uppercase tracking-[0.2em] text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-vault-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-vault-accent mx-auto" strokeWidth={1} />
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <p className="text-[11px] uppercase tracking-widest text-vault-text-secondary">No recorded activity matches the current exclusion criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-vault-bg/50 transition-colors group">
                                        <td className="px-6 py-5 font-mono text-[11px] text-vault-text-secondary whitespace-nowrap">
                                            {log.timestamp}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 bg-vault-bg border border-vault-border flex items-center justify-center">
                                                    <User className="h-2 w-2 text-vault-text-secondary" />
                                                </div>
                                                <span className="text-[12px] font-bold text-vault-text-primary uppercase tracking-wider">{log.actor}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[11px] uppercase tracking-widest text-vault-accent font-bold">{log.operation}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-vault-text-secondary group-hover:text-vault-text-primary transition-colors">
                                                <FileText className="h-3 w-3" strokeWidth={1} />
                                                <span className="text-[11px] font-mono truncate max-w-[150px]">{log.resource}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                {log.status === 'SUCCESS' ? (
                                                    <CheckCircle2 className="h-3.3 w-3.5 text-green-700" strokeWidth={2.5} />
                                                ) : log.status === 'FAILURE' ? (
                                                    <XCircle className="h-3.5 w-3.5 text-red-700" strokeWidth={2.5} />
                                                ) : (
                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-700" strokeWidth={2.5} />
                                                )}
                                                <span className={cn(
                                                    "text-[9px] font-bold uppercase tracking-widest",
                                                    log.status === 'SUCCESS' ? "text-green-800" :
                                                        log.status === 'FAILURE' ? "text-red-800" : "text-amber-800"
                                                )}>
                                                    {log.status === 'SUCCESS' ? "Verified" : log.status === 'FAILURE' ? "Failed" : "Review"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-1.5 hover:bg-vault-bg text-vault-text-secondary hover:text-vault-accent transition-colors">
                                                <Info className="h-3 w-3" strokeWidth={1.5} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between border-t border-vault-border pt-6">
                        <div className="text-[10px] uppercase tracking-widest text-vault-text-secondary">
                            Page {currentPage + 1} of {totalPages} • {totalElements} total entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 0}
                                className={cn(
                                    "px-3 py-2 text-[9px] uppercase tracking-widest font-bold border transition-colors",
                                    currentPage === 0
                                        ? "text-vault-text-secondary/50 border-vault-border/50 cursor-not-allowed"
                                        : "text-vault-text-secondary border-vault-border hover:border-vault-accent hover:text-vault-accent"
                                )}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1}
                                className={cn(
                                    "px-3 py-2 text-[9px] uppercase tracking-widest font-bold border transition-colors",
                                    currentPage >= totalPages - 1
                                        ? "text-vault-text-secondary/50 border-vault-border/50 cursor-not-allowed"
                                        : "text-vault-text-secondary border-vault-border hover:border-vault-accent hover:text-vault-accent"
                                )}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="flex gap-10 border-t border-vault-border pt-8 mt-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-vault-text-secondary font-bold">Registry Integrity</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-700" />
                                <span className="text-[10px] text-vault-text-primary font-medium italic">Immutable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-vault-accent" />
                                <span className="text-[10px] text-vault-text-primary font-medium italic">Sealed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// UI representation of audit logs (transformed from backend)
interface AuditLogUI {
    id: string;
    timestamp: string;
    actor: string;
    operation: string;
    resource: string;
    status: 'SUCCESS' | 'FAILURE' | 'WARNING';
    details?: string;
}

// Helper function to format ISO datetime to readable format
function formatDateTime(isoString: string): string {
    try {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6');
    } catch {
        return isoString;
    }
}

const MOCK_AUDIT_LOGS_UI: AuditLogUI[] = [
    {
        id: "1",
        timestamp: "2024-05-20 14:32:11",
        actor: "admin@monaco.io",
        operation: "ASSET_DEPOSIT",
        resource: "FIN-REPORT-Q1.PDF",
        status: "SUCCESS",
        details: "Upload successful. Checksum verified (SHA-256)."
    },
    {
        id: "2",
        timestamp: "2024-05-20 12:15:04",
        actor: "SYSTEM",
        operation: "IP_LOCK",
        resource: "192.168.1.104",
        status: "WARNING",
        details: "Automated perimeter lock triggered by multi-fail login."
    },
    {
        id: "3",
        timestamp: "2024-05-20 10:04:55",
        actor: "dev-service-key",
        operation: "API_KEYS_GEN",
        resource: "VAULT_READ_TEMP",
        status: "SUCCESS",
        details: "Temporary access token generated for automated service."
    },
    {
        id: "4",
        timestamp: "2024-05-19 23:55:12",
        actor: "unknown_origin",
        operation: "AUTH_ATTEMPT",
        resource: "ADMIN_ROOT",
        status: "FAILURE",
        details: "Unauthorized access attempt from blacklisted subnet."
    },
    {
        id: "5",
        timestamp: "2024-05-19 16:44:22",
        actor: "claire@monaco.io",
        operation: "SHARE_AUTHORIZE",
        resource: "P_LEGAL_2024.ZIP",
        status: "SUCCESS",
        details: "Temporary share link generated with 24h expiration."
    },
    {
        id: "6",
        timestamp: "2024-05-19 09:12:00",
        actor: "admin@monaco.io",
        operation: "LICENSE_RENEW",
        resource: "REGISTRY_SUB_2024",
        status: "SUCCESS"
    }
];
