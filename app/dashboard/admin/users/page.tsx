"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users,Search, Trash2,Loader2,UserX,UserCheck,Fingerprint } from "lucide-react";
import { User } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
// Import your custom hooks
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/useAdmin";

export default function UserManagementPage() {
    const { accessToken, isLoading: authLoading } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Fetch users using your custom hook
    const { data: users = [], isLoading: usersLoading } = useUsers(accessToken);

    // 2. Setup mutations
    const updateMutation = useUpdateUser(accessToken);
    const deleteMutation = useDeleteUser(accessToken);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const handleToggleStatus = (user: User) => {
        updateMutation.mutate({
            userId: user.id,
            updates: { isActive: !user.isActive }
        });
    };

    const handleUpdateRole = (user: User, newRole: string) => {
        updateMutation.mutate({
            userId: user.id,
            updates: { role: newRole as any }
        });
    };

    const handleDeleteUser = (userId: number) => {
        if (!confirm("Confirm permanent removal of this personnel record? This action cannot be revoked.")) return;
        deleteMutation.mutate(userId);
    };

    // Combine loading states
    if (authLoading || usersLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="animate-spin h-10 w-10 text-vault-accent" strokeWidth={1} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vault-border pb-6">
                    <div>
                        <h1 className="text-4xl font-serif text-vault-text-primary">Personnel Registry</h1>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary mt-2">
                            Access Clearance & Identity Stewardship
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-vault-text-secondary">Registry Index</p>
                            <p className="text-vault-text-primary text-xs font-bold uppercase tracking-tighter">
                                {users.length} Active Records
                            </p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-6 border border-vault-border bg-vault-surface p-4">
                    <div className="relative flex-1 min-w-75">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-vault-text-secondary" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Filter by classification or identifier..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary placeholder:text-vault-text-secondary/40 focus:border-vault-accent outline-none font-serif text-lg transition-colors"
                        />
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="border border-vault-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-vault-border bg-vault-surface">
                                    <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Personnel Identity</th>
                                    <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Authorization</th>
                                    <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em]">Clearance Level</th>
                                    <th className="px-6 py-6 text-[10px] font-medium text-vault-text-secondary uppercase tracking-[0.2em] text-right">Records Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-vault-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-vault-surface transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-6">
                                                <div className="h-12 w-12 border border-vault-border bg-vault-bg flex items-center justify-center grayscale opacity-80 group-hover:opacity-100 transition-opacity overflow-hidden">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Fingerprint className="h-6 w-6 text-vault-text-secondary" strokeWidth={0.75} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-serif text-[17px] text-vault-text-primary">{user.firstName} {user.lastName}</p>
                                                    <p className="text-[10px] uppercase tracking-widest text-vault-text-secondary">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                                                user.isActive
                                                    ? "border border-green-900/20 text-green-700"
                                                    : "border border-red-900/20 text-red-700"
                                            )}>
                                                {user.isActive ? <UserCheck className="h-3 w-3" strokeWidth={3} /> : <UserX className="h-3 w-3" strokeWidth={3} />}
                                                {user.isActive ? "Authorized" : "Revoked"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <select
                                                disabled={updateMutation.isPending}
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user, e.target.value)}
                                                className="bg-vault-bg border border-vault-border text-vault-text-primary text-[10px] font-bold uppercase tracking-widest py-1 px-4 outline-none focus:border-vault-accent cursor-pointer hover:bg-vault-surface transition-colors disabled:opacity-50"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="MODERATOR">MODERATOR</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    disabled={updateMutation.isPending}
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={cn(
                                                        "p-2 transition-colors disabled:opacity-50",
                                                        user.isActive
                                                            ? "text-vault-text-secondary hover:text-red-700"
                                                            : "text-vault-text-secondary hover:text-green-700"
                                                    )}
                                                    title={user.isActive ? "Revoke Access" : "Grant Access"}
                                                >
                                                    {updateMutation.isPending && updateMutation.variables?.userId === user.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : user.isActive ? (
                                                        <UserX className="h-4 w-4" strokeWidth={1.25} />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4" strokeWidth={1.25} />
                                                    )}
                                                </button>
                                                <button
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-vault-text-secondary hover:text-red-700 transition-colors disabled:opacity-50"
                                                    title="Expunge Record"
                                                >
                                                    {deleteMutation.isPending && deleteMutation.variables === user.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="py-24 text-center">
                            <Users className="h-10 w-10 text-vault-text-secondary/20 mx-auto mb-4" strokeWidth={0.5} />
                            <p className="text-[11px] uppercase tracking-[0.2em] text-vault-text-secondary">
                                No records matching identification query
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}