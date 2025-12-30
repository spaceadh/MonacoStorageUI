"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
    IconUsers,
    IconSearch,
    IconEdit,
    IconTrash,
    IconLoader2,
    IconShieldCheck,
    IconUserOff,
    IconUserCheck,
    IconExternalLink
} from "@tabler/icons-react";
import { apiClient, User } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UserManagementPage() {
    const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            loadUsers();
        }
    }, [isAuthenticated, accessToken]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await apiClient.getAllUsers(accessToken!);
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const handleToggleStatus = async (user: User) => {
        try {
            const res = await apiClient.updateUser(user.id, { isActive: !user.isActive }, accessToken!);
            if (res.success) {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
                toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (error) {
            toast.error("Failed to update user status");
        }
    };

    const handleUpdateRole = async (user: User, newRole: string) => {
        try {
            const res = await apiClient.updateUser(user.id, { role: newRole }, accessToken!);
            if (res.success) {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                toast.success(`User role updated to ${newRole}`);
            }
        } catch (error) {
            toast.error("Failed to update user role");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const res = await apiClient.deleteUser(userId, accessToken!);
            if (res.success) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                toast.success("User deleted successfully");
            }
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    if (authLoading || (isLoading && !users.length)) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <IconLoader2 className="animate-spin h-10 w-10 text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
                        <IconUsers className="h-8 w-8 text-blue-500" /> User Management
                    </h1>
                    <p className="text-neutral-500 mt-1">Manage system users, roles, and access controls</p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700/50">
                    <div className="relative flex-1 min-w-[300px]">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        Total Users: <span className="font-bold text-neutral-800 dark:text-neutral-200">{users.length}</span>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-neutral-800/30 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/10">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.userName} className="h-full w-full rounded-full object-cover" />
                                                    ) : (
                                                        user.userName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{user.userName}</p>
                                                    <p className="text-xs text-neutral-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all",
                                                user.isActive
                                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                                            )}>
                                                {user.isActive ? <IconUserCheck className="h-3 w-3" /> : <IconUserOff className="h-3 w-3" />}
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user, e.target.value)}
                                                className="bg-neutral-100 dark:bg-neutral-900 border-none rounded-lg text-xs font-bold py-1 px-3 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="MODERATOR">MODERATOR</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={cn(
                                                        "p-2 rounded-xl transition-all border",
                                                        user.isActive
                                                            ? "text-red-500 hover:bg-red-500/10 border-transparent hover:border-red-500/20"
                                                            : "text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20"
                                                    )}
                                                    title={user.isActive ? "Deactivate User" : "Activate User"}
                                                >
                                                    {user.isActive ? <IconUserOff className="h-5 w-5" /> : <IconUserCheck className="h-5 w-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                                    title="Delete User"
                                                >
                                                    <IconTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="p-20 text-center">
                            <IconUsers className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-500 font-medium">No users found matching your search</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
