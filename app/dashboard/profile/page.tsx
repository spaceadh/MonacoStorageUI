"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
    User,
    Mail,
    Shield,
    Key,
    Clock,
    Fingerprint,
    BadgeCheck,
    Lock,
    ExternalLink,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { user, authLoading } = useAuth();

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-vault-accent" strokeWidth={1} />
                </div>
            </DashboardLayout>
        );
    }

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-12 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vault-border pb-8">
                    <div className="flex items-center gap-8">
                        <div className="h-24 w-24 bg-vault-accent flex items-center justify-center border border-vault-border group relative overflow-hidden">
                            <User className="h-10 w-10 text-vault-bg relative z-10" strokeWidth={1} />
                            <div className="absolute inset-0 bg-vault-text-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif text-vault-text-primary uppercase tracking-tight italic">
                                {user.userName}
                            </h1>
                            <p className="text-[11px] uppercase tracking-[0.3em] text-vault-accent font-bold mt-2">
                                Identity Stewardship • Clearance Level {user.role === 'admin' ? 'IV' : 'I'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-5 py-2.5 border border-vault-border hover:border-vault-accent text-vault-text-secondary hover:text-vault-accent transition-colors">
                            <Lock className="h-3 w-3" strokeWidth={1.5} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Modify Credentials</span>
                        </button>
                    </div>
                </div>

                {/* Identity Ledger */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-vault-border border border-vault-border">
                    <div className="bg-vault-surface p-10 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-vault-text-secondary opacity-60">
                            <Mail className="h-3.5 w-3.5" strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Communique Routing</span>
                        </div>
                        <p className="text-xl font-serif text-vault-text-primary lowercase">{user.email}</p>
                    </div>

                    <div className="bg-vault-surface p-10 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-vault-text-secondary opacity-60">
                            <Shield className="h-3.5 w-3.5" strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Protocol Assignment</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-serif text-vault-text-primary capitalize">{user.role}</span>
                            <span className="px-2 py-0.5 bg-vault-accent/10 border border-vault-accent/20 text-vault-accent text-[9px] uppercase tracking-widest font-bold">Verified</span>
                        </div>
                    </div>

                    <div className="bg-vault-surface p-10 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-vault-text-secondary opacity-60">
                            <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Account Standing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-700 shadow-[0_0_8px_rgba(21,128,61,0.4)]" />
                            <p className="text-xl font-serif text-vault-text-primary uppercase tracking-wider">Active State</p>
                        </div>
                    </div>

                    <div className="bg-vault-surface p-10 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-vault-text-secondary opacity-60">
                            <Clock className="h-3.5 w-3.5" strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Session Presence</span>
                        </div>
                        <p className="text-xl font-serif text-vault-text-primary">{new Date().toLocaleDateString(undefined, {
                            month: 'long',
                            year: 'numeric'
                        })}</p>
                    </div>
                </div>

                {/* Secure Attributes */}
                <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-vault-text-secondary font-bold border-b border-vault-border pb-3">Secured Identity Attributes</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <AttributeCard
                            icon={<Fingerprint className="h-4 w-4" />}
                            label="Neural Signature"
                            value="VERIFIED_BIOMETRIC"
                        />
                        <AttributeCard
                            icon={<Key className="h-4 w-4" />}
                            label="Secret Entropy"
                            value="AES-256-GCM"
                        />
                        <AttributeCard
                            icon={<Shield className="h-4 w-4" />}
                            label="MFA Protocol"
                            value="LEGACY_ENABLED"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-8 border-t border-vault-border flex justify-between items-center opacity-70">
                    <p className="text-[9px] uppercase tracking-widest text-vault-text-secondary font-medium">
                        Identity Registry Hash: 0x{Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}
                    </p>
                    <button className="flex items-center gap-2 text-vault-text-secondary hover:text-vault-accent transition-colors">
                        <span className="text-[10px] uppercase tracking-widest font-bold">View Identity Audit</span>
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

function AttributeCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="border border-vault-border p-6 hover:bg-vault-surface transition-colors flex flex-col gap-4">
            <div className="text-vault-accent opacity-50">{icon}</div>
            <div>
                <p className="text-[9px] uppercase tracking-widest text-vault-text-secondary font-bold mb-1">{label}</p>
                <p className="text-sm font-mono text-vault-text-primary font-bold">{value}</p>
            </div>
        </div>
    );
}
