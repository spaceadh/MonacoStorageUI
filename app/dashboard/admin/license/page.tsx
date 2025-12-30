"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiClient, LicenseInfo, LicenseValidation } from "@/lib/api";
import {
    IconLicense,
    IconRefresh,
    IconCheck,
    IconAlertTriangle,
    IconX,
    IconLoader2,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LicensePage() {
    const { accessToken } = useAuth();
    const [license, setLicense] = useState<LicenseInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [newLicenseKey, setNewLicenseKey] = useState("");
    const [isRenewing, setIsRenewing] = useState(false);
    const [validationResult, setValidationResult] = useState<LicenseValidation | null>(null);

    useEffect(() => {
        loadLicense();
    }, []);

    const loadLicense = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await apiClient.getLicenseInfo(accessToken!);
            if (result) {
                setLicense(result);
            } else {
                setError("Failed to load license info");
            }
        } catch (err) {
            setError("Failed to load license info");
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async () => {
        try {
            setIsValidating(true);
            setValidationResult(null);
            const result = await apiClient.validateLicense(accessToken!);
            if (result) {
                setValidationResult(result);
                loadLicense(); // Refresh license info after validation
            } else {
                setError("Failed to validate license");
            }
        } catch (err) {
            setError("Failed to validate license");
        } finally {
            setIsValidating(false);
        }
    };

    const handleRenew = async () => {
        try {
            setIsRenewing(true);
            const result = await apiClient.renewLicense(accessToken!, newLicenseKey);
            if (result) {
                setShowRenewModal(false);
                setNewLicenseKey("");
                loadLicense();
            } 
        } catch (err) {
            setError("Failed to renew license");
        } finally {
            setIsRenewing(false);
        }
    };

    const getStatusColor = () => {
        if (!license) return "neutral";
        if (!license.isValid) return "red";
        if (license.daysRemaining <= 30) return "amber";
        return "green";
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">License Management</h1>
                        <p className="text-neutral-400 mt-1">
                            View and manage your MonacoStorage license
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleValidate}
                            disabled={isValidating}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 text-white rounded-lg transition-colors"
                        >
                            {isValidating ? (
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <IconRefresh className="h-4 w-4" />
                            )}
                            Validate
                        </button>
                        <button
                            onClick={() => setShowRenewModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                        >
                            <IconLicense className="h-4 w-4" />
                            Renew License
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

                {/* Validation Result */}
                {validationResult && (
                    <div
                        className={`border rounded-lg p-4 ${validationResult.isValid
                                ? "bg-green-500/10 border-green-500/20"
                                : "bg-red-500/10 border-red-500/20"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {validationResult.isValid ? (
                                <IconCheck className="h-5 w-5 text-green-400" />
                            ) : (
                                <IconAlertTriangle className="h-5 w-5 text-red-400" />
                            )}
                            <p className={validationResult.isValid ? "text-green-400" : "text-red-400"}>
                                {validationResult.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* License Card */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <IconLoader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                ) : license ? (
                    <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* License Key */}
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">License Key</p>
                                <p className="text-lg font-mono text-white">{license.licenseKey}</p>
                            </div>

                            {/* Status */}
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Status</p>
                                <span
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor() === "green"
                                            ? "bg-green-500/10 text-green-400"
                                            : getStatusColor() === "amber"
                                                ? "bg-amber-500/10 text-amber-400"
                                                : "bg-red-500/10 text-red-400"
                                        }`}
                                >
                                    {license.isValid ? (
                                        <>
                                            <IconCheck className="h-4 w-4" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <IconAlertTriangle className="h-4 w-4" />
                                            Expired
                                        </>
                                    )}
                                </span>
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Expiry Date</p>
                                <p className="text-lg text-white">
                                    {new Date(license.expiryDate).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Days Remaining */}
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Days Remaining</p>
                                <p
                                    className={`text-2xl font-bold ${getStatusColor() === "green"
                                            ? "text-green-400"
                                            : getStatusColor() === "amber"
                                                ? "text-amber-400"
                                                : "text-red-400"
                                        }`}
                                >
                                    {license.daysRemaining > 0 ? license.daysRemaining : 0}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-sm text-neutral-400 mb-2">
                                <span>License Usage</span>
                                <span>{license.daysRemaining} days remaining</span>
                            </div>
                            <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${getStatusColor() === "green"
                                            ? "bg-green-500"
                                            : getStatusColor() === "amber"
                                                ? "bg-amber-500"
                                                : "bg-red-500"
                                        }`}
                                    style={{ width: `${Math.min((license.daysRemaining / 365) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Warning */}
                        {license.daysRemaining <= 30 && license.daysRemaining > 0 && (
                            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <IconAlertTriangle className="h-5 w-5 text-amber-400" />
                                    <p className="text-amber-400">
                                        Your license expires in {license.daysRemaining} days. Please renew soon.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-12 text-center">
                        <p className="text-neutral-400">No license found. Please complete setup.</p>
                    </div>
                )}

                {/* Renew Modal */}
                {showRenewModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold text-white mb-4">Renew License</h2>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">
                                    New License Key
                                </label>
                                <input
                                    type="text"
                                    value={newLicenseKey}
                                    onChange={(e) => setNewLicenseKey(e.target.value)}
                                    placeholder="Enter your new license key"
                                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowRenewModal(false)}
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRenew}
                                    disabled={!newLicenseKey || isRenewing}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 text-white rounded-lg transition-colors"
                                >
                                    {isRenewing ? (
                                        <>
                                            <IconLoader2 className="h-4 w-4 animate-spin" />
                                            Renewing...
                                        </>
                                    ) : (
                                        "Renew License"
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
