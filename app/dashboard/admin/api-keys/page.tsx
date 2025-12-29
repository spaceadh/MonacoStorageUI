"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiClient, ApiKey, GeneratedApiKey } from "@/lib/api";
import {
    IconPlus,
    IconTrash,
    IconCopy,
    IconCheck,
    IconKey,
    IconLoader2,
    IconRefresh,
    IconX,
    IconEye,
    IconEyeOff,
} from "@tabler/icons-react";

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<GeneratedApiKey | null>(null);
    const [newKey, setNewKey] = useState({ name: "", expiresInDays: 365 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await apiClient.getApiKeys();
            if (result.status && result.data) {
                setKeys(result.data);
            } else {
                setError(result.message || "Failed to load API keys");
            }
        } catch (err) {
            setError("Failed to load API keys");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateKey = async () => {
        try {
            setIsGenerating(true);
            const result = await apiClient.generateApiKey(
                newKey.name,
                newKey.expiresInDays,
                ["files:read", "files:write"]
            );
            if (result.status && result.data) {
                setGeneratedKey(result.data);
                setNewKey({ name: "", expiresInDays: 365 });
                loadKeys();
            } else {
                setError(result.message || "Failed to generate API key");
            }
        } catch (err) {
            setError("Failed to generate API key");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevokeKey = async (id: number) => {
        if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone."))
            return;

        try {
            const result = await apiClient.revokeApiKey(id);
            if (result.status) {
                loadKeys();
            } else {
                setError(result.message || "Failed to revoke API key");
            }
        } catch (err) {
            setError("Failed to revoke API key");
        }
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">API Keys</h1>
                        <p className="text-neutral-400 mt-1">
                            Manage your API keys for programmatic access
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadKeys}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                        >
                            <IconRefresh className="h-4 w-4" />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                        >
                            <IconPlus className="h-4 w-4" />
                            Generate Key
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
                    ) : keys.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400">
                            No API keys found. Generate one to get started.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-neutral-800">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Key Prefix
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Expires
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Last Used
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700">
                                {keys.map((key) => (
                                    <tr key={key.id} className="hover:bg-neutral-800/50">
                                        <td className="px-6 py-4 text-white font-medium">{key.name}</td>
                                        <td className="px-6 py-4 font-mono text-neutral-300">
                                            {key.keyPrefix}
                                        </td>
                                        <td className="px-6 py-4">
                                            {key.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                                                    <IconCheck className="h-3 w-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-neutral-500/10 text-neutral-400">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400 text-sm">
                                            {key.expiresAt
                                                ? new Date(key.expiresAt).toLocaleDateString()
                                                : "Never"}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400 text-sm">
                                            {key.lastUsedAt
                                                ? new Date(key.lastUsedAt).toLocaleDateString()
                                                : "Never"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleRevokeKey(key.id)}
                                                className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Revoke Key"
                                            >
                                                <IconTrash className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Generate Modal */}
                {showGenerateModal && !generatedKey && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <IconKey className="h-6 w-6 text-blue-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Generate API Key</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        Key Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newKey.name}
                                        onChange={(e) =>
                                            setNewKey({ ...newKey, name: e.target.value })
                                        }
                                        placeholder="e.g., Production Server"
                                        className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        Expires In (Days)
                                    </label>
                                    <input
                                        type="number"
                                        value={newKey.expiresInDays}
                                        onChange={(e) =>
                                            setNewKey({ ...newKey, expiresInDays: parseInt(e.target.value) || 0 })
                                        }
                                        placeholder="365"
                                        className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Set to 0 for no expiration
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowGenerateModal(false)}
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateKey}
                                    disabled={!newKey.name || isGenerating}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 text-white rounded-lg transition-colors"
                                >
                                    {isGenerating ? (
                                        <>
                                            <IconLoader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        "Generate Key"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generated Key Display Modal */}
                {generatedKey && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <IconCheck className="h-6 w-6 text-green-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">API Key Generated</h2>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                                <p className="text-amber-400 text-sm">
                                    ⚠️ Copy this key now! It will only be shown once.
                                </p>
                            </div>
                            <div className="bg-neutral-700/50 rounded-lg p-4 mb-4">
                                <p className="text-xs text-neutral-400 mb-2">Your API Key</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 font-mono text-sm text-white break-all">
                                        {generatedKey.apiKey}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(generatedKey.apiKey)}
                                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-600 rounded-lg transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? (
                                            <IconCheck className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <IconCopy className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                <div>
                                    <p className="text-neutral-400">Name</p>
                                    <p className="text-white">{generatedKey.name}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-400">Expires</p>
                                    <p className="text-white">
                                        {generatedKey.expiresAt
                                            ? new Date(generatedKey.expiresAt).toLocaleDateString()
                                            : "Never"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setGeneratedKey(null);
                                    setShowGenerateModal(false);
                                }}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
