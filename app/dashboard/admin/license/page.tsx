"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiClient, LicenseInfo, LicenseValidation } from "@/lib/api";
import {
    ShieldCheck,
    RefreshCw,
    Check,
    AlertTriangle,
    X,
    Loader2,
    Key,
    Calendar,
    Hourglass,
    Activity,
    ShieldAlert
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function LicensePage() {
    const { accessToken, isLoading: authLoading } = useAuth();
    const [license, setLicense] = useState<LicenseInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [newLicenseKey, setNewLicenseKey] = useState("");
    const [isRenewing, setIsRenewing] = useState(false);
    const [validationResult, setValidationResult] = useState<LicenseValidation | null>(null);

    useEffect(() => {
        if (!authLoading && accessToken) {
            loadLicense();
        }
    }, [accessToken, authLoading]);

    const loadLicense = async () => {
        if (!accessToken) return;
        try {
            setIsLoading(true);
            setError(null);
            const result = await apiClient.getLicenseInfo(accessToken);
            if (result.status && result.data) {
                setLicense(result.data);
            } else {
                setError("Protocol failure: Failed to fetch registry entitlement info");
            }
        } catch (err) {
            setError("Protocol failure: Failed to fetch registry entitlement info");
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!accessToken) return;
        try {
            setIsValidating(true);
            setValidationResult(null);
            const result = await apiClient.validateLicense(accessToken);
            if (result) {
                setValidationResult(result);
                loadLicense(); // Refresh license info after validation
            } else {
                setError("Protocol failure: Entitlement attestation failed");
            }
        } catch (err) {
            setError("Protocol failure: Entitlement attestation failed");
        } finally {
            setIsValidating(false);
        }
    };

    const handleRenew = async () => {
        if (!accessToken) return;
        try {
            setIsRenewing(true);
            const result = await apiClient.renewLicense(newLicenseKey, accessToken);
            if (result) {
                setShowRenewModal(false);
                setNewLicenseKey("");
                loadLicense();
            }
        } catch (err) {
            setError("Protocol failure: Entitlement affirmation failed");
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
                        <h1 className="text-4xl font-serif text-vault-text-primary">Registry Entitlement</h1>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary mt-2">
                            Infrastructure Validity & Domain Authorization
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleValidate}
                            disabled={isValidating}
                            className="flex items-center gap-2 px-4 py-2 border border-vault-border hover:border-vault-accent text-vault-text-secondary hover:text-vault-accent disabled:opacity-30 transition-colors"
                        >
                            {isValidating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                            )}
                            <span className="text-[10px] uppercase tracking-widest font-bold">Attest State</span>
                        </button>
                        <button
                            onClick={() => setShowRenewModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-vault-accent hover:bg-vault-text-primary text-vault-bg transition-colors"
                        >
                            <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Affirm Entitlement</span>
                        </button>
                    </div>
                </div>

                {/* Status Banners */}
                <div className="flex flex-col gap-4">
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

                    {validationResult && (
                        <div
                            className={cn(
                                "p-4 border",
                                validationResult.isValid
                                    ? "bg-green-900/5 border-green-900/20"
                                    : "bg-red-900/5 border-red-900/20"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {validationResult.isValid ? (
                                    <Check className="h-4 w-4 text-green-700" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-red-700" />
                                )}
                                <p className={cn(
                                    "text-[11px] uppercase tracking-wider font-bold",
                                    validationResult.isValid ? "text-green-800" : "text-red-800"
                                )}>
                                    {validationResult.message}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Entitlement Details */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-vault-accent animate-spin" strokeWidth={1} />
                    </div>
                ) : license ? (
                    <div className="flex flex-col gap-10">
                        {/* Grid of details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-vault-border border border-vault-border">
                            {/* License Key */}
                            <div className="bg-vault-surface p-8 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-vault-text-secondary">
                                    <Key className="h-3.5 w-3.5" strokeWidth={1} />
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-medium">Entitlement Token</p>
                                </div>
                                <p className="text-sm font-mono text-vault-accent font-bold tracking-wider break-all">
                                    {license.licenseKey}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="bg-vault-surface p-8 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-vault-text-secondary">
                                    <Activity className="h-3.5 w-3.5" strokeWidth={1} />
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-medium">Clearance Status</p>
                                </div>
                                <div>
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-2 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest bg-vault-bg border",
                                            license.isValid
                                                ? "text-green-700 border-green-900/20"
                                                : "text-red-700 border-red-900/20"
                                        )}
                                    >
                                        {license.isValid ? "Authorized State" : "Expunged State"}
                                    </span>
                                </div>
                            </div>

                            {/* Expiry Date */}
                            <div className="bg-vault-surface p-8 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-vault-text-secondary">
                                    <Calendar className="h-3.5 w-3.5" strokeWidth={1} />
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-medium">Term Expiration</p>
                                </div>
                                <p className="text-xl font-serif text-vault-text-primary">
                                    {new Date(license.expiryDate).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            {/* Days Remaining */}
                            <div className="bg-vault-surface p-8 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-vault-text-secondary">
                                    <Hourglass className="h-3.5 w-3.5" strokeWidth={1} />
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-medium">Authorization Reserve</p>
                                </div>
                                <div className="flex items-end gap-2">
                                    <p className={cn(
                                        "text-4xl font-serif leading-none",
                                        getStatusColor() === "green" ? "text-green-700" :
                                            getStatusColor() === "amber" ? "text-amber-700" : "text-red-700"
                                    )}>
                                        {license.daysRemaining > 0 ? license.daysRemaining : 0}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-vault-text-secondary pb-1 font-bold">Standard Days</p>
                                </div>
                            </div>
                        </div>

                        {/* Entitlement Indicator */}
                        <div className="flex flex-col gap-6 p-8 border border-vault-border bg-vault-surface">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold mb-1">Entitlement Lifespan Indicator</p>
                                    <p className="text-2xl font-serif text-vault-text-primary italic opacity-60">Status: {license.isValid ? "Standing Reserve" : "Immediate Renewal Required"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold mb-1">Reserve Balance</p>
                                    <p className="text-lg tabular-nums text-vault-accent font-bold tracking-tight">{license.daysRemaining}d / 365d</p>
                                </div>
                            </div>

                            <div className="h-1.5 w-full bg-vault-bg border border-vault-border p-0.5 overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000 ease-out",
                                        getStatusColor() === "green" ? "bg-green-700" :
                                            getStatusColor() === "amber" ? "bg-amber-700" : "bg-red-700"
                                    )}
                                    style={{ width: `${Math.min((license.daysRemaining / 365) * 100, 100)}%` }}
                                />
                            </div>

                            {license.daysRemaining <= 30 && license.daysRemaining > 0 && (
                                <div className="flex items-center gap-4 py-4 px-6 bg-amber-900/5 border border-amber-900/20 text-amber-800">
                                    <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
                                    <p className="text-[11px] uppercase tracking-widest font-bold">
                                        Perimeter Alert: Authorization reserve is critical. Immediate affirmation required within {license.daysRemaining} days.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="border border-vault-border bg-vault-surface py-32 text-center">
                        <ShieldAlert className="h-12 w-12 text-vault-text-secondary/20 mx-auto mb-6" strokeWidth={0.5} />
                        <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary">
                            No authorized entitlement record detected in the vault registry
                        </p>
                    </div>
                )}

                {/* Affirm Modal */}
                {showRenewModal && (
                    <div className="fixed inset-0 bg-vault-bg/95 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-vault-surface border border-vault-border p-10 w-full max-w-lg">
                            <div className="flex items-center gap-4 mb-8">
                                <ShieldCheck className="h-6 w-6 text-vault-accent" strokeWidth={1} />
                                <h2 className="text-3xl font-serif text-vault-text-primary">Affirm Entitlement</h2>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest text-vault-text-secondary font-bold">
                                        Entitlement Token Key
                                    </label>
                                    <input
                                        type="text"
                                        value={newLicenseKey}
                                        onChange={(e) => setNewLicenseKey(e.target.value)}
                                        placeholder="X-XXXX-XXXX-XXXX"
                                        className="w-full px-4 py-4 bg-vault-bg border border-vault-border text-vault-text-primary placeholder:text-vault-text-secondary/40 focus:border-vault-accent outline-none font-mono text-lg transition-colors"
                                    />
                                </div>
                                <p className="text-[10px] text-vault-text-secondary leading-relaxed uppercase tracking-widest font-medium">
                                    By affirming this entitlement, you provide attestation of continuous domain stewardship and adherence to the vault infrastructure protocol.
                                </p>
                            </div>
                            <div className="flex justify-end items-center gap-6 mt-12 pt-8 border-t border-vault-border">
                                <button
                                    onClick={() => setShowRenewModal(false)}
                                    className="text-[11px] uppercase tracking-widest font-bold text-vault-text-secondary hover:text-vault-text-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRenew}
                                    disabled={!newLicenseKey || isRenewing}
                                    className="flex items-center gap-3 px-8 py-3 bg-vault-accent hover:bg-vault-text-primary disabled:opacity-30 text-vault-bg transition-colors"
                                >
                                    {isRenewing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-[11px] uppercase tracking-widest font-bold">Validating...</span>
                                        </>
                                    ) : (
                                        <span className="text-[11px] uppercase tracking-widest font-bold">Affirm Registry</span>
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
