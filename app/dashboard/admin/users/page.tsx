"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users,Search, Trash2,Loader2,UserX,UserCheck,Fingerprint,Plus,Key,UserPlus,AlertTriangle,Building2,X } from "lucide-react";
import { User } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CreateUserWithTenantsRequest, AssignUserToTenantRequest } from "@/lib/api";
// Import your custom hooks
import { useUsers, useUpdateUser, useDeleteUser, useTenants, useCreateUser, useAssignUserToTenant, useResetUserPassword } from "@/hooks/useAdmin";

export default function UserManagementPage() {
    const { accessToken, isLoading: authLoading } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isAssignTenantModalOpen, setIsAssignTenantModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // 1. Fetch users and tenants using your custom hooks
    const { data: users = [], isLoading: usersLoading } = useUsers(accessToken);
    const { data: tenants = [], isLoading: tenantsLoading } = useTenants(accessToken);

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

    const handleOpenResetPassword = (user: User) => {
        setSelectedUser(user);
        setIsResetPasswordModalOpen(true);
    };

    const handleOpenAssignTenant = (user: User) => {
        setSelectedUser(user);
        setIsAssignTenantModalOpen(true);
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
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-vault-text-secondary">Registry Index</p>
                            <p className="text-vault-text-primary text-xs font-bold uppercase tracking-tighter">
                                {users.length} Active Records
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-vault-accent text-vault-bg hover:opacity-90 transition-opacity flex items-center gap-2 text-[11px] uppercase tracking-widest font-medium whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" />
                            New Personnel
                        </button>
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
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenAssignTenant(user)}
                                                    className="p-2 text-vault-text-secondary hover:text-vault-accent transition-colors"
                                                    title="Assign to Tenant"
                                                >
                                                    <Building2 className="h-4 w-4" strokeWidth={1.25} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenResetPassword(user)}
                                                    className="p-2 text-vault-text-secondary hover:text-vault-accent transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <Key className="h-4 w-4" strokeWidth={1.25} />
                                                </button>
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

                {/* Modals */}
                <CreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    tenants={tenants}
                />
                <ResetPasswordModal
                    isOpen={isResetPasswordModalOpen}
                    onClose={() => {
                        setIsResetPasswordModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />
                <AssignTenantModal
                    isOpen={isAssignTenantModalOpen}
                    onClose={() => {
                        setIsAssignTenantModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                    tenants={tenants}
                />
            </div>
        </DashboardLayout>
    );
}

// Create User Modal Component
function CreateUserModal({
    isOpen,
    onClose,
    tenants
}: {
    isOpen: boolean;
    onClose: () => void;
    tenants: any[];
}) {
    const { accessToken } = useAuth();
    const createMutation = useCreateUser(accessToken);
    const [formData, setFormData] = useState<CreateUserWithTenantsRequest>({
        email: "",
        userName: "",
        firstName: "",
        lastName: "",
        temporaryPassword: "",
        tenants: [],
        sourceSystem: "ADMIN_PORTAL"
    });
    const [selectedTenantId, setSelectedTenantId] = useState<number | "">("");
    const [selectedRole, setSelectedRole] = useState<string>("USER");

    const handleAddTenant = () => {
        if (selectedTenantId === "") return;

        // Check if already added
        if (formData.tenants.some(t => t.tenantId === selectedTenantId)) {
            return;
        }

        setFormData({
            ...formData,
            tenants: [...formData.tenants, { tenantId: selectedTenantId as number, role: selectedRole }]
        });
        setSelectedTenantId("");
        setSelectedRole("USER");
    };

    const handleRemoveTenant = (tenantId: number) => {
        setFormData({
            ...formData,
            tenants: formData.tenants.filter(t => t.tenantId !== tenantId)
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.tenants.length === 0) {
            alert("Please assign at least one tenant");
            return;
        }

        createMutation.mutate(formData, {
            onSuccess: () => {
                onClose();
                setFormData({
                    email: "",
                    userName: "",
                    firstName: "",
                    lastName: "",
                    temporaryPassword: "",
                    tenants: [],
                    sourceSystem: "ADMIN_PORTAL"
                });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-vault-surface border border-vault-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b border-vault-border flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif text-vault-text-primary">Create New Personnel</h2>
                        <p className="text-[10px] uppercase tracking-wider text-vault-text-secondary mt-1">
                            Register New User Account
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-vault-text-secondary hover:text-vault-text-primary transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
                            placeholder="user@example.com"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
                            Username *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                            className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
                            placeholder="username"
                        />
                    </div>

                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    {/* Temporary Password */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
                            Temporary Password * (User must change on first login)
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.temporaryPassword}
                            onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent font-mono"
                            placeholder="Temp123!@#"
                        />
                    </div>

                    {/* Tenant Assignment */}
                    <div className="border-t border-vault-border pt-6">
                        <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-4">
                            Tenant Assignment *
                        </label>

                        <div className="flex gap-2 mb-4">
                            <select
                                value={selectedTenantId}
                                onChange={(e) => setSelectedTenantId(e.target.value ? Number(e.target.value) : "")}
                                className="flex-1 px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
                            >
                                <option value="">Select Tenant...</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.displayName} ({tenant.tenantKey})
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
                            >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="MODERATOR">MODERATOR</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleAddTenant}
                                disabled={selectedTenantId === ""}
                                className="px-4 py-3 bg-vault-accent text-vault-bg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-medium"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Assigned Tenants List */}
                        {formData.tenants.length > 0 && (
                            <div className="space-y-2">
                                {formData.tenants.map((assignment) => {
                                    const tenant = tenants.find(t => t.id === assignment.tenantId);
                                    return (
                                        <div
                                            key={assignment.tenantId}
                                            className="flex items-center justify-between px-4 py-2 bg-vault-bg border border-vault-border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-4 w-4 text-vault-accent" strokeWidth={1.5} />
                                                <span className="text-sm text-vault-text-primary">
                                                    {tenant?.displayName || "Unknown"}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wider text-vault-text-secondary px-2 py-0.5 border border-vault-border">
                                                    {assignment.role}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTenant(assignment.tenantId)}
                                                className="p-1 text-vault-text-secondary hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-vault-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={createMutation.isPending}
                            className="flex-1 px-4 py-3 border border-vault-border hover:bg-vault-bg text-vault-text-primary transition-colors text-[11px] uppercase tracking-wider font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 px-4 py-3 bg-vault-accent text-vault-bg hover:opacity-90 transition-opacity text-[11px] uppercase tracking-wider font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create User"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// Reset Password Modal Component
function ResetPasswordModal({
    isOpen,
    onClose,
    user
}: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}) {
    const { accessToken } = useAuth();
    const resetMutation = useResetUserPassword(accessToken);
    const [temporaryPassword, setTemporaryPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        resetMutation.mutate(
            { userId: user.id, temporaryPassword },
            {
                onSuccess: () => {
                    onClose();
                    setTemporaryPassword("");
                }
            }
        );
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-vault-surface border border-vault-border max-w-md w-full"
            >
                <div className="p-6 border-b border-vault-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-vault-text-primary">Reset Password</h2>
                        <p className="text-[10px] uppercase tracking-wider text-vault-text-secondary mt-1">
                            {user.userName} • {user.email}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-vault-text-secondary hover:text-vault-text-primary transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div className="text-xs text-vault-text-secondary">
                            <p className="font-medium text-amber-500 mb-1">Temporary Password Reset</p>
                            <p>User will be required to change this password upon next login. Password expires in 7 days.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
                            New Temporary Password *
                        </label>
                        <input
                            type="text"
                            required
                            value={temporaryPassword}
                            onChange={(e) => setTemporaryPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent font-mono"
                            placeholder="Temp123!@#"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-vault-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={resetMutation.isPending}
                            className="flex-1 px-4 py-3 border border-vault-border hover:bg-vault-bg text-vault-text-primary transition-colors text-[11px] uppercase tracking-wider font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={resetMutation.isPending}
                            className="flex-1 px-4 py-3 bg-vault-accent text-vault-bg hover:opacity-90 transition-opacity text-[11px] uppercase tracking-wider font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {resetMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// Assign Tenant Modal Component
function AssignTenantModal({
    isOpen,
    onClose,
    user,
    tenants
}: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    tenants: any[];
}) {
    const { accessToken } = useAuth();
    const assignMutation = useAssignUserToTenant(accessToken);
    const [selectedTenantId, setSelectedTenantId] = useState<number | "">("");
    const [selectedRole, setSelectedRole] = useState<string>("USER");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || selectedTenantId === "") return;

        assignMutation.mutate(
            {
                userId: user.id,
                request: {
                    tenantId: selectedTenantId as number,
                    role: selectedRole
                }
            },
            {
                onSuccess: () => {
                    onClose();
                    setSelectedTenantId("");
                    setSelectedRole("USER");
                }
            }
        );
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-vault-surface border border-vault-border max-w-md w-full"
            >
                <div className="p-6 border-b border-vault-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-vault-text-primary">Assign to Tenant</h2>
                        <p className="text-[10px] uppercase tracking-wider text-vault-text-secondary mt-1">
                            {user.userName} • {user.email}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-vault-text-secondary hover:text-vault-text-primary transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
                            Select Tenant *
                        </label>
                        <select
                            required
                            value={selectedTenantId}
                            onChange={(e) => setSelectedTenantId(e.target.value ? Number(e.target.value) : "")}
                            className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
                        >
                            <option value="">Select Tenant...</option>
                            {tenants.map((tenant) => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.displayName} ({tenant.tenantKey})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-vault-text-secondary mb-2">
                            Clearance Level *
                        </label>
                        <select
                            required
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-4 py-3 bg-vault-bg border border-vault-border text-vault-text-primary text-sm focus:outline-none focus:border-vault-accent"
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MODERATOR">MODERATOR</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-vault-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={assignMutation.isPending}
                            className="flex-1 px-4 py-3 border border-vault-border hover:bg-vault-bg text-vault-text-primary transition-colors text-[11px] uppercase tracking-wider font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={assignMutation.isPending}
                            className="flex-1 px-4 py-3 bg-vault-accent text-vault-bg hover:opacity-90 transition-opacity text-[11px] uppercase tracking-wider font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {assignMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Assign User"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}