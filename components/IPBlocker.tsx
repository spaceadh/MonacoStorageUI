"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { IconShieldLock, IconPlus, IconLoader2 } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { a } from "framer-motion/m";

interface IPBlockerProps {
    children: React.ReactNode;
    enabled?: boolean;
}

export function IPBlocker({ children, enabled = true }: IPBlockerProps) {
    const { accessToken } = useAuth();
    const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
    const [currentIP, setCurrentIP] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setIsWhitelisted(true);
            setIsLoading(false);
            return;
        }
        checkIPStatus();
    }, [enabled]);

    const checkIPStatus = async () => {
        try {
            setIsLoading(true);
            const [ipResult, checkResult] = await Promise.all([
                apiClient.getCurrentIP(accessToken!),
                apiClient.checkIPWhitelisted(accessToken!),
            ]);

            if (ipResult) {
                setCurrentIP(ipResult.ipAddress);
            }

            if (checkResult) {
                setIsWhitelisted(checkResult ?? false);
            } else {
                // If check fails, assume not whitelisted
                setIsWhitelisted(false);
            }
        } catch (err) {
            console.error("Error checking IP status:", err);
            setError("Failed to verify IP status");
            setIsWhitelisted(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMyIP = async () => {
        try {
            setIsAdding(true);
            setError(null);
            const result = await apiClient.addIPToWhitelist(accessToken!, currentIP, "Added via IP Blocker");
            if (result) {
                setIsWhitelisted(true);
            } else {
                setError("Failed to add IP");
            }
        } catch (err) {
            setError("Failed to add IP to whitelist");
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-neutral-900 flex items-center justify-center z-50">
                <div className="text-center">
                    <IconLoader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-neutral-300 text-lg">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isWhitelisted) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center z-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700 rounded-2xl p-8 shadow-2xl">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-amber-500/10 rounded-full">
                                <IconShieldLock className="h-12 w-12 text-amber-500" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white text-center mb-2">
                            Access Restricted
                        </h2>
                        <p className="text-neutral-400 text-center mb-6">
                            Your IP address is not whitelisted. Please add your IP to continue.
                        </p>

                        <div className="bg-neutral-700/30 rounded-lg p-4 mb-6">
                            <p className="text-sm text-neutral-400 mb-1">Your Current IP</p>
                            <p className="text-lg font-mono text-white">{currentIP || "Unknown"}</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleAddMyIP}
                            disabled={isAdding || !currentIP}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-neutral-600 disabled:to-neutral-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                        >
                            {isAdding ? (
                                <>
                                    <IconLoader2 className="h-5 w-5 animate-spin" />
                                    Adding IP...
                                </>
                            ) : (
                                <>
                                    <IconPlus className="h-5 w-5" />
                                    Add My IP to Whitelist
                                </>
                            )}
                        </button>

                        <p className="text-xs text-neutral-500 text-center mt-4">
                            Contact your administrator if you need assistance.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
