"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiClient, WhitelistedIP } from "@/lib/api";
import {
    Plus,
    Trash2,
    Lock,
    Unlock,
    Check,
    X,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Globe,
    ShieldAlert
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function IPManagementPage() {
    const { accessToken, isLoading: authLoading } = useAuth();
    const [ips, setIps] = useState<WhitelistedIP[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newIP, setNewIP] = useState({ ipAddress: "", description: "" });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!authLoading && accessToken) {
            loadIPs();
        }
    }, [accessToken, authLoading]);

    const loadIPs = async () => {
        if (!accessToken) return;
        try {
            setIsLoading(true);
            setError(null);
            const result = await apiClient.getWhitelist(accessToken);
            if (result.status && result.data) {
                setIps(result.data);
            } else {
                setError("Protocol failure: Failed to sync access perimeter");
            }
        } catch (err) {
            setError("Protocol failure: Failed to sync access perimeter");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddIP = async () => {
        if (!accessToken) return;
        try {
            setIsAdding(true);
            const result = await apiClient.addIPToWhitelist(
                accessToken,
                newIP.ipAddress,
                newIP.description,
            );
            if (result.status && result.data) {
                setShowAddModal(false);
                setNewIP({ ipAddress: "", description: "" });
                loadIPs();
                toast.success("New access origin authorized");
            } else {
                setError("Authorization rejected: Invalid origin parameters");
            }
        } catch (err) {
            setError("Authorization rejected: Invalid origin parameters");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteIP = async (id: number) => {
        if (!accessToken) return;
        if (!confirm("Confirm permanent removal of this access origin? Vault access from this location will be immediately blocked."))
            return;

        try {
            await apiClient.deleteWhitelistedIP(id, accessToken);
            loadIPs();
            toast.success("Access origin decommissioned");
        } catch (err) {
            setError("Protocol failure: Decommission denied");
        }
    };

    const handleLockingIP = async (id: number, type: string) => {
        if (!accessToken) return;
        try {
            let response;
            if (type === "locked") {
                response = await apiClient.unLockWhitelistedIP(id, accessToken);
                toast.success("Origin lock released");
            } else if (type === "unlocked") {
                response = await apiClient.lockWhitelistedIP(id, accessToken);
                toast.success("Origin lock engaged");
            }
            loadIPs();
        } catch (err) {
            setError("Protocol failure: Lock state mutation failed");
        }
    };

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
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
                        <h1 className="text-4xl font-serif text-vault-text-primary">Network Perimeter</h1>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary mt-2">
                            Authorized Access Origins & Location Control
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={loadIPs}
                            className="flex items-center gap-2 px-4 py-2 border border-vault-border hover:border-vault-accent text-vault-text-secondary hover:text-vault-accent transition-colors"
                        >
                            <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Resync</span>
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-vault-accent hover:bg-vault-text-primary text-vault-bg transition-colors"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Authorize Origin</span>
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-900/10 border border-red-900/20 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="h-4 w-4 text-red-700" />
                            <p className="text-red-800 text-[11px] uppercase tracking-wider font-medium">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Ledger Table */}
                <div className="border-t border-vault-border">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 text-vault-accent animate-spin" strokeWidth={1} />
                        </div>
                    ) : ips.length === 0 ? (
                        <div className="text-center py-24">
                            <Globe className="h-10 w-10 text-vault-text-secondary/20 mx-auto mb-4" strokeWidth={0.5} />
                            <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary">
                                No perimeter origins currently authorized
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-vault-border">
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Network Address (IPv4/6)</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Origin Identifier</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Clearance & Lock Protocol</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Authorization Date</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] text-right">Perimeter Controls</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-vault-border">
                                    {ips.map((ip) => (
                                        <tr key={ip.id} className="hover:bg-vault-surface transition-colors group">
                                            <td className="px-6 py-4 font-mono text-sm text-vault-accent font-bold tracking-tight">
                                                {ip.ipAddress}
                                            </td>
                                            <td className="px-6 py-4 font-serif text-lg text-vault-text-primary">
                                                {ip.description || "Unlabeled Origin"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-3">
                                                    {ip.isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-green-900/20 text-green-700 text-[10px] uppercase tracking-tighter font-bold">
                                                            <Check className="h-3 w-3" strokeWidth={1} /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-vault-border text-vault-text-secondary text-[10px] uppercase tracking-tighter font-bold bg-vault-surface">
                                                            Disabled
                                                        </span>
                                                    )}
                                                    {ip.isLocked ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-vault-text-primary text-vault-bg text-[10px] uppercase tracking-tighter font-bold">
                                                            <Lock className="h-3 w-3" strokeWidth={1} /> Locked
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-vault-accent text-vault-accent text-[10px] uppercase tracking-tighter font-bold">
                                                            <Unlock className="h-3 w-3" strokeWidth={1.5} /> Open
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs tabular-nums text-vault-text-secondary font-medium">
                                                {new Date(ip.addedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleLockingIP(ip.id, ip.isLocked ? "locked" : "unlocked")}
                                                        className="p-2 text-vault-text-secondary hover:text-vault-accent transition-colors opacity-0 group-hover:opacity-100"
                                                        title={ip.isLocked ? "Release State Lock" : "Engage State Lock"}
                                                    >
                                                        {ip.isLocked ? <Unlock className="h-4 w-4" strokeWidth={1.25} /> : <Lock className="h-4 w-4" strokeWidth={1.25} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteIP(ip.id)}
                                                        className="p-2 text-vault-text-secondary hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Decommission Origin"
                                                    >
                                                        <Trash2 className="h-4 w-4" strokeWidth={1.25} />
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

                {/* Authorize Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-vault-bg/95 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-vault-surface border border-vault-border p-10 w-full max-w-lg">
                            <div className="flex items-center gap-4 mb-8">
                                <ShieldCheck className="h-6 w-6 text-vault-accent" strokeWidth={1} />
                                <h2 className="text-3xl font-serif text-vault-text-primary">Authorize Origin</h2>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                        IPv4 or IPv6 Address
                                    </label>
                                    <input
                                        type="text"
                                        value={newIP.ipAddress}
                                        onChange={(e) =>
                                            setNewIP({ ...newIP, ipAddress: e.target.value })
                                        }
                                        placeholder="e.g., 127.0.0.1"
                                        className="w-full px-4 py-4 bg-vault-bg border border-vault-border text-vault-text-primary placeholder:text-vault-text-secondary/40 focus:border-vault-accent outline-none font-mono text-lg transition-colors"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                        Origin Description
                                    </label>
                                    <input
                                        type="text"
                                        value={newIP.description}
                                        onChange={(e) =>
                                            setNewIP({ ...newIP, description: e.target.value })
                                        }
                                        placeholder="e.g., Primary Residence"
                                        className="w-full px-4 py-4 bg-vault-bg border border-vault-border text-vault-text-primary placeholder:text-vault-text-secondary/40 focus:border-vault-accent outline-none font-serif text-lg transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-6 mt-12 pt-8 border-t border-vault-border">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-[11px] uppercase tracking-widest font-bold text-vault-text-secondary hover:text-vault-text-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddIP}
                                    disabled={!newIP.ipAddress || isAdding}
                                    className="flex items-center gap-3 px-8 py-3 bg-vault-accent hover:bg-vault-text-primary disabled:opacity-30 text-vault-bg transition-colors"
                                >
                                    {isAdding ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-[11px] uppercase tracking-widest font-bold">Validating...</span>
                                        </>
                                    ) : (
                                        <span className="text-[11px] uppercase tracking-widest font-bold">Confirm Origin</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
