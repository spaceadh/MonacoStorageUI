import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  TenantInfo,
  CreateTenantRequest,
  CreateUserWithTenantsRequest,
  AssignUserToTenantRequest
} from "@/lib/api";
import { User,useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Query keys for better cache management
export const adminKeys = {
  all: ["admin"] as const,
  tenants: () => [...adminKeys.all, "tenants"] as const,
  users: () => [...adminKeys.all, "users"] as const,
};

export const userKeys = {
  all: ["user"] as const,
  tenants: () => [...userKeys.all, "tenants"] as const,
};

// Hook to fetch all tenants
export function useTenants(accessToken: string | null) {
  return useQuery({
    queryKey: adminKeys.tenants(),
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      const data = await apiClient.getAllTenants(accessToken);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch all users
export function useUsers(accessToken: string | null) {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      const data = await apiClient.getAllUsers(accessToken);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create a tenant
export function useCreateTenant(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateTenantRequest) => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.createTenant(request, accessToken);
    },
    onSuccess: () => {
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      toast.success("Tenant created successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to create tenant";
      toast.error(message);
    },
  });
}

// Hook to delete a tenant
export function useDeleteTenant(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantId: number) => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.deleteTenant(tenantId, accessToken);
    },
    onSuccess: () => {
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      toast.success("Tenant deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete tenant");
    },
  });
}

// Hook to update a user
export function useUpdateUser(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: number;
      updates: Partial<User>;
    }) => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.updateUser(userId, updates, accessToken);
    },
    onSuccess: (_, variables) => {
      // Optimistically update the users list
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });

      // Show appropriate success message based on what was updated
      if (variables.updates.isActive !== undefined) {
        toast.success(`Personnel ${variables.updates.isActive ? 'authorized' : 'de-authorized'} successfully`);
      } else if (variables.updates.role) {
        toast.success(`Clearance level updated to ${variables.updates.role}`);
      } else {
        toast.success("User updated successfully");
      }
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });
}

// Hook to delete a user
export function useDeleteUser(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.deleteUser(userId, accessToken);
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success("Personnel record expunged");
    },
    onError: () => {
      toast.error("Failed to expunge personnel record");
    },
  });
}

// Hook to fetch tenants belonging to the current user
export function useMyTenants(accessToken: string | null) {
  return useQuery({
    queryKey: userKeys.tenants(),
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.getUserTenants(accessToken); // Adjust based on your actual API method
    },
    enabled: !!accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

type SwitchTenantFn = (tenantId: number) => Promise<void>;

// Hook to switch the active tenant
export function useSwitchActiveTenant(
  accessToken: string | null, 
  switchTenant: SwitchTenantFn // Pass the function here
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantId: number) => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.switchTenant(tenantId, accessToken);
    },
    onSuccess: () => {
      // 1. Invalidate all queries because data is tenant-specific
      queryClient.invalidateQueries();
      
      // 2. Optional: Force a refresh if your app state relies on full reloads for tenant isolation
      // window.location.reload(); 
      
      toast.success("Tenant/Product switched successfully");
    },
    onError: () => {
      toast.error("Failed to switch tenant/product");
    },
  });
}

// Hook to create a user with multi-tenant assignment
export function useCreateUser(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateUserWithTenantsRequest) => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.createUserWithTenants(request, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to create user";
      toast.error(message);
    },
  });
}

// Hook to assign user to a tenant
export function useAssignUserToTenant(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, request }: { userId: number; request: AssignUserToTenantRequest }) => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.assignUserToTenant(userId, request, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success("User assigned to tenant successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to assign user to tenant";
      toast.error(message);
    },
  });
}

// Hook to reset user password
export function useResetUserPassword(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, temporaryPassword }: { userId: number; temporaryPassword: string }) => {
      if (!accessToken) throw new Error("No access token");
      return await apiClient.resetUserPassword(userId, temporaryPassword, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success("Password reset successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to reset password";
      toast.error(message);
    },
  });
}