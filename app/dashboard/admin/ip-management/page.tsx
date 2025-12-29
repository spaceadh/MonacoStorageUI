"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiClient, WhitelistedIP } from "@/lib/api";
import {
    IconPlus,
    IconTrash,
    IconLock,
    IconCheck,
    IconX,
    IconLoader2,
    IconRefresh,
} from "@tabler/icons-react";

export default function IPManagementPage() {
    const [ips, setIps] = useState<WhitelistedIP[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newIP, setNewIP] = useState({ ipAddress: "", description: "" });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadIPs();
    }, []);

    const loadIPs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await apiClient.getWhitelist();
            if (result.status && result.data) {
                setIps(result.data);
            } else {
                setError(result.message || "Failed to load IP whitelist");
            }
        } catch (err) {
            setError("Failed to load IP whitelist");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddIP = async () => {
        try {
            setIsAdding(true);
            const result = await apiClient.addIPToWhitelist(
                newIP.ipAddress,
                newIP.description
            );
            if (result.status) {
                setShowAddModal(false);
                setNewIP({ ipAddress: "", description: "" });
                loadIPs();
            } else {
                setError(result.message || "Failed to add IP");
            }
        } catch (err) {
            setError("Failed to add IP");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteIP = async (id: number) => {
        if (!confirm("Are you sure you want to remove this IP from the whitelist?"))
            return;

        try {
            const result = await apiClient.deleteWhitelistedIP(id);
            if (result.status) {
                loadIPs();
            } else {
                setError(result.message || "Failed to delete IP");
            }
        } catch (err) {
            setError("Failed to delete IP");
        }
    };

    const handleLockIP = async (id: number) => {
        try {
            const result = await apiClient.lockWhitelistedIP(id);
            if (result.status) {
                loadIPs();
            } else {
                setError(result.message || "Failed to lock IP");
            }
        } catch (err) {
            setError("Failed to lock IP");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">IP Management</h1>
                        <p className="text-neutral-400 mt-1">
                            Manage whitelisted IP addresses for system access
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadIPs}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                        >
                            <IconRefresh className="h-4 w-4" />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                        >
                            <IconPlus className="h-4 w-4" />
                            Add IP
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex justify-between items-center">
                        <p className="text-red-400">{error}</p>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                            <IconX className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <IconLoader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    ) : ips.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400">
                            No whitelisted IPs found. Add one to get started.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-neutral-800">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Added
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700">
                                {ips.map((ip) => (
                                    <tr key={ip.id} className="hover:bg-neutral-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-white">
                                            {ip.ipAddress}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-300">
                                            {ip.description || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {ip.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                                                        <IconCheck className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-neutral-500/10 text-neutral-400">
                                                        Inactive
                                                    </span>
                                                )}
                                                {ip.isLocked && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400">
                                                        <IconLock className="h-3 w-3" /> Locked
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400 text-sm">
                                            {new Date(ip.addedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {!ip.isLocked && (
                                                    <>
                                                        <button
                                                            onClick={() => handleLockIP(ip.id)}
                                                            className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                                                            title="Lock IP"
                                                        >
                                                            <IconLock className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteIP(ip.id)}
                                                            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                            title="Delete IP"
                                                        >
                                                            <IconTrash className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold text-white mb-4">
                                Add IP to Whitelist
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        IP Address
                                    </label>
                                    <input
                                        type="text"
                                        value={newIP.ipAddress}
                                        onChange={(e) =>
                                            setNewIP({ ...newIP, ipAddress: e.target.value })
                                        }
                                        placeholder="e.g., 192.168.1.100"
                                        className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={newIP.description}
                                        onChange={(e) =>
                                            setNewIP({ ...newIP, description: e.target.value })
                                        }
                                        placeholder="e.g., Office Network"
                                        className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddIP}
                                    disabled={!newIP.ipAddress || isAdding}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 text-white rounded-lg transition-colors"
                                >
                                    {isAdding ? (
                                        <>
                                            <IconLoader2 className="h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        "Add IP"
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
