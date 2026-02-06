"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GeneratedApiKey } from "@/lib/api";
import {
    Plus,
    Trash2,
    Copy,
    Check,
    Key,
    Loader2,
    RefreshCw,
    Terminal
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useApiKeys, useGenerateApiKey, useRevokeApiKey } from "@/hooks/useAdmin";

export default function ApiKeysPage() {
    const { accessToken, isLoading: authLoading } = useAuth();
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<GeneratedApiKey | null>(null);
    const [newKey, setNewKey] = useState({ name: "", expiresInDays: 365 });
    const [copied, setCopied] = useState(false);

    // Use React Query hooks
    const { data: keys = [], isLoading, refetch } = useApiKeys(accessToken);
    const generateMutation = useGenerateApiKey(accessToken);
    const revokeMutation = useRevokeApiKey(accessToken);

    const handleGenerateKey = async () => {
        generateMutation.mutate(
            {
                name: newKey.name,
                expiresInDays: newKey.expiresInDays,
                scopes: ["files:read", "files:write"],
            },
            {
                onSuccess: (response) => {
                    setGeneratedKey(response.data);
                    setNewKey({ name: "", expiresInDays: 365 });
                },
            }
        );
    };

    const handleRevokeKey = async (id: number) => {
        if (!confirm("Confirm permanent revocation of this access token? Programmatic access will be immediately terminated."))
            return;
        revokeMutation.mutate(id);
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                        <h1 className="text-4xl font-serif text-vault-text-primary">Programmatic Access</h1>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary mt-2">
                            Secure API Authorization Management
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-4 py-2 border border-vault-border hover:border-vault-accent text-vault-text-secondary hover:text-vault-accent transition-colors"
                        >
                            <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Refresh</span>
                        </button>
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-vault-accent hover:bg-vault-text-primary text-vault-bg transition-colors"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Issue Token</span>
                        </button>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="border-t border-vault-border">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 text-vault-accent animate-spin" strokeWidth={1} />
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="text-center py-24">
                            <Key className="h-10 w-10 text-vault-text-secondary/20 mx-auto mb-4" strokeWidth={0.5} />
                            <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary">
                                No active access tokens found in registry
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-vault-border">
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Credential Name</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Token Identification</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Clearance Status</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Expiration</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Last Active</th>
                                        <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-vault-border">
                                    {keys.map((key) => (
                                        <tr key={key.id} className="hover:bg-vault-surface transition-colors group">
                                            <td className="px-6 py-4 font-serif text-lg text-vault-text-primary">{key.name}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-vault-text-secondary">
                                                {key.keyPrefix}••••••••
                                            </td>
                                            <td className="px-6 py-4">
                                                {key.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-green-900/20 text-green-700 text-[10px] uppercase tracking-tighter font-bold">
                                                        <Check className="h-3 w-3" strokeWidth={3} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-vault-border text-vault-text-secondary text-[10px] uppercase tracking-tighter font-bold bg-vault-surface">
                                                        Revoked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs tabular-nums text-vault-text-secondary">
                                                {key.expiresAt
                                                    ? new Date(key.expiresAt).toLocaleDateString()
                                                    : "Forever"}
                                            </td>
                                            <td className="px-6 py-4 text-xs tabular-nums text-vault-text-secondary font-medium">
                                                {key.lastUsedAt
                                                    ? new Date(key.lastUsedAt).toLocaleDateString()
                                                    : "Unused"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRevokeKey(key.id)}
                                                    className="p-2 text-vault-text-secondary hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Revoke Control"
                                                >
                                                    <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Generate Modal */}
                {showGenerateModal && !generatedKey && (
                    <div className="fixed inset-0 bg-vault-bg/95 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-vault-surface border border-vault-border p-10 w-full max-w-lg">
                            <div className="flex items-center gap-4 mb-8">
                                <Terminal className="h-6 w-6 text-vault-accent" strokeWidth={1} />
                                <h2 className="text-3xl font-serif text-vault-text-primary">Issue New Token</h2>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                        Credential Label
                                    </label>
                                    <input
                                        type="text"
                                        value={newKey.name}
                                        onChange={(e) =>
                                            setNewKey({ ...newKey, name: e.target.value })
                                        }
                                        placeholder="e.g., Production Terminal A"
                                        className="w-full px-4 py-4 bg-vault-bg border border-vault-border text-vault-text-primary placeholder:text-vault-text-secondary/40 focus:border-vault-accent outline-none font-serif text-lg transition-colors"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                        Validity Duration (Days)
                                    </label>
                                    <input
                                        type="number"
                                        value={newKey.expiresInDays}
                                        onChange={(e) =>
                                            setNewKey({ ...newKey, expiresInDays: parseInt(e.target.value) || 0 })
                                        }
                                        className="w-full px-4 py-4 bg-vault-bg border border-vault-border text-vault-text-primary outline-none focus:border-vault-accent font-serif text-lg transition-colors"
                                    />
                                    <p className="text-[9px] uppercase tracking-widest text-vault-text-secondary mt-1">
                                        Protocol: 0 = Indefinite duration
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-6 mt-12 pt-8 border-t border-vault-border">
                                <button
                                    onClick={() => setShowGenerateModal(false)}
                                    className="text-[11px] uppercase tracking-widest font-bold text-vault-text-secondary hover:text-vault-text-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateKey}
                                    disabled={!newKey.name || generateMutation.isPending}
                                    className="flex items-center gap-3 px-8 py-3 bg-vault-accent hover:bg-vault-text-primary disabled:opacity-30 text-vault-bg transition-colors"
                                >
                                    {generateMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-[11px] uppercase tracking-widest font-bold">Processing...</span>
                                        </>
                                    ) : (
                                        <span className="text-[11px] uppercase tracking-widest font-bold">Finalize Issuance</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result Modal */}
                {generatedKey && (
                    <div className="fixed inset-0 bg-vault-bg/95 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-vault-surface border border-vault-border p-10 w-full max-w-xl">
                            <div className="flex items-center gap-4 mb-8">
                                <Check className="h-6 w-6 text-green-700" strokeWidth={3} />
                                <h2 className="text-3xl font-serif text-vault-text-primary">Generation Successful</h2>
                            </div>
                            <div className="bg-red-900/5 border border-red-900/10 p-5 mb-8">
                                <p className="text-red-900 text-[10px] uppercase tracking-widest font-bold leading-relaxed">
                                    Protocol Alert: This credential will only be displayed once. Failure to secure it now requires immediate revocation and re-issuance.
                                </p>
                            </div>
                            <div className="bg-vault-bg border border-vault-border p-6 mb-8 relative group">
                                <div className="text-[9px] uppercase tracking-widest text-vault-text-secondary mb-3">Permanent Access Token</div>
                                <div className="flex items-center gap-6">
                                    <code className="flex-1 font-mono text-sm text-vault-accent break-all leading-relaxed tracking-tighter">
                                        {generatedKey.apiKey}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(generatedKey.apiKey)}
                                        className="p-3 bg-vault-accent text-vault-bg hover:bg-vault-text-primary transition-all duration-300"
                                        title="Secure to Clipboard"
                                    >
                                        {copied ? (
                                            <Check className="h-5 w-5" strokeWidth={3} />
                                        ) : (
                                            <Copy className="h-5 w-5" strokeWidth={1.5} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 mb-10 pt-6 border-t border-vault-border">
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-vault-text-secondary mb-1">Assigned Name</p>
                                    <p className="text-vault-text-primary font-serif text-lg">{generatedKey.name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-vault-text-secondary mb-1">Termination Date</p>
                                    <p className="text-vault-text-primary font-serif text-lg">
                                        {generatedKey.expiresAt
                                            ? new Date(generatedKey.expiresAt).toLocaleDateString()
                                            : "No Expiration"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setGeneratedKey(null);
                                    setShowGenerateModal(false);
                                }}
                                className="w-full py-4 border border-vault-accent text-vault-accent hover:bg-vault-accent hover:text-vault-bg transition-all duration-300 text-[11px] uppercase tracking-widest font-bold"
                            >
                                Clearance Confirmed
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
