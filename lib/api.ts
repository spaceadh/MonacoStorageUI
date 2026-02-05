import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { User } from "@/contexts/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9442/api/v1';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for better error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
      }
    );
  }

  private getAuthConfig(token?: string): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) {
      config.headers!['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }

  async get<TResponse>(endpoint: string, token?: string): Promise<TResponse> {
    const response = await this.axiosInstance.get<TResponse>(endpoint, this.getAuthConfig(token));
    return response.data;
  }

  async post<TResponse>(endpoint: string, body?: object, token?: string): Promise<TResponse> {
    const response = await this.axiosInstance.post<TResponse>(endpoint, body, this.getAuthConfig(token));
    return response.data;
  }

  async put<TResponse>(endpoint: string, body?: object, token?: string): Promise<TResponse> {
    const response = await this.axiosInstance.put<TResponse>(endpoint, body, this.getAuthConfig(token));
    return response.data;
  }

  async delete<TResponse>(endpoint: string, token?: string): Promise<TResponse> {
    const response = await this.axiosInstance.delete<TResponse>(endpoint, this.getAuthConfig(token));
    return response.data;
  }

  // User Registration, registration and management
  async checkRegistrationStatus() {
    return this.get<{ registrationAllowed: boolean; message: string }>('/users/registration-status');
  }

  async registerDefaultUser(email: string, password: string, userName: string) {
    return this.post<RegisterResponse>('/users/registerDefaultUser', { email, password, userName });
  }

  async loginUser(email: string, password: string) {
    return this.post<LoginResponse>('/users/login', { email, password });
  }

  async verifyUser(token: string) {
    return this.get<VerifyResponse>('/users/verify', token);
  }

  // log out user
  async logoutUser(token: string) {
    return this.post<LogoutResponse>('/users/logout', {}, token);
  }

  // IP Whitelisting
  async getCurrentIP(token: string) {
    return this.get<{ ipAddress: string }>('/ips/current', token);
  }

  async checkIPWhitelisted(token: string) {
    return this.get<boolean>('/ips/check', token);
  }

  async getWhitelist(token: string) {
    return this.get<getWhitelistResponse>('/ips/whitelist', token);
  }

  async addIPToWhitelist(token: string, ipAddress: string, description?: string) {
    return this.post<addIPToWhitelistResponse>('/ips/whitelist', { ipAddress, description }, token);
  }

  async deleteWhitelistedIP(id: number, token: string) {
    return this.post<deleteWhitelistedIPResponse>(`/ips/delete-whitelist/${id}`, {}, token);
  }

  async lockWhitelistedIP(id: number, token: string) {
    return this.post<lockWhitelistedIPResponse>(`/ips/whitelist/${id}/lock`, {}, token);
  }

  async unLockWhitelistedIP(id: number, token: string) {
    return this.post<unlockWhitelistedIPResponse>(`/ips/whitelist/${id}/unlock`, {}, token);
  }

  // License Management
  async getLicenseInfo(token: string) {
    return this.get<getLicenseInfoResponse>('/license/info', token);
  }

  async renewLicense(licenseKey: string, token: string) {
    return this.post<LicenseInfo>('/license/renew', { licenseKey }, token);
  }

  async validateLicense(token: string) {
    return this.get<LicenseValidation>('/license/validate', token);
  }

  // API Keys
  async getApiKeys(token: string) {
    return this.get<GetAPIKeysResponse>('/apikeys', token);
  }

  async generateApiKey(name: string, token: string, expiresInDays: number, scopes?: string[]) {
    return this.post<GeneratedAPIKeyResponse>('/apikeys/generate', { name, expiresInDays, scopes }, token);
  }

  async revokeApiKey(id: number, token: string) {
    return this.delete<void>(`/apikeys/${id}`, token);
  }

  async getUserQuota(token: string) {
    return this.get<UserQuota>('/users/quota', token);
  }

  // User Management (Admin)
  async getAllUsers(token: string) {
    return this.get<User[]>('/users', token);
  }

  async updateUser(userId: number, updates: Partial<User>, token: string) {
    return this.put<{ success: boolean; message: string }>(`/users/${userId}`, updates, token);
  }

  async deleteUser(userId: number, token: string) {
    return this.delete<{ success: boolean; message: string }>(`/users/${userId}`, token);
  }

  // Tenant Management (Admin)
  async getAllTenants(token: string) {
    return this.get<TenantInfo[]>('/admin/tenants', token);
  }

  async createTenant(request: CreateTenantRequest, token: string) {
    return this.post<CreateTenantResponse>('/admin/tenants', request, token);
  }

  async updateTenant(tenantId: number, updates: Partial<CreateTenantRequest>, token: string) {
    return this.put<{ success: boolean; message: string }>(`/admin/tenants/${tenantId}`, updates, token);
  }

  async deleteTenant(tenantId: number, token: string) {
    return this.delete<{ success: boolean; message: string }>(`/admin/tenants/${tenantId}`, token);
  }

  async createUserWithTenants(request: CreateUserWithTenantsRequest, token: string) {
    return this.post<CreateUserResponse>('/admin/users', request, token);
  }

  async assignUserToTenant(userId: number, request: AssignUserToTenantRequest, token: string) {
    return this.post<{ success: boolean; message: string }>(`/admin/users/${userId}/tenants`, request, token);
  }

  async resetUserPassword(userId: number, temporaryPassword: string, token: string) {
    return this.post<{ success: boolean; message: string }>(`/admin/users/${userId}/password/reset`, { temporaryPassword }, token);
  }

  // File Operations
  async getUserFiles(token: string, category?: string) {
    const endpoint = category ? `/files/metadata/user?category=${category}` : '/files/metadata/user';
    return this.get<GetUserFilesResponse>(endpoint, token);
  }

  async getFileAccessUrl(fileId: string, token: string, ttlHours: number = 24) {
    return this.get<FileAccessUrlResponse>(`/files/access/${fileId}?ttl=${ttlHours}`, token);
  }

  async shareFile(fileId: string, token: string, expiryHours: number = 24) {
    return this.post<ShareFileResponse>(`/files/share/${fileId}?expiryHours=${expiryHours}`, {}, token);
  }

  async deleteFile(fileId: string, token: string) {
    return this.delete<void>(`/files/${fileId}`, token);
  }

  // Audit & Search (Phase 5)
  async getAuditLogs(token: string, page: number = 0, pageSize: number = 50) {
    const endpoint = `/audit/logs?page=${page}&pageSize=${pageSize}`;
    return this.get<AuditLogsPageResponse>(endpoint, token);
  }

  async semanticSearch(query: string, token: string) {
    return this.post<SemanticSearchResponse>('/files/search/semantic', { query }, token);
  }

  // Multi-Scope Search (Phase 6)
  async multiScopeSearch(request: MultiScopeSearchRequest, token: string) {
    return this.post<MultiScopeSearchResponse>('/query/multi-scope', request, token);
  }

  async getUserScopes(token: string) {
    return this.get<UserScopes>('/query/user-scopes', token);
  }

  // Search History (Phase 6)
  async getSearchHistory(token: string, page: number = 0, size: number = 20) {
    const endpoint = `/search-history?page=${page}&size=${size}`;
    return this.get<SearchHistoryPageResponse>(endpoint, token);
  }

  async deleteSearchHistoryEntry(id: number, token: string) {
    return this.delete<SearchHistoryResponse>(`/search-history/${id}`, token);
  }

  async clearAllSearchHistory(token: string) {
    return this.post<SearchHistoryResponse>('/search-history/clear-all', {}, token);
  }

  async getSearchAnalytics(token: string) {
    return this.get<SearchAnalytics>('/search-history/analytics', token);
  }

  // Multi-Tenant Management
  async switchTenant(tenantId: number, token: string) {
    return this.post<SwitchTenantResponse>('/users/switch-tenant', { tenantId }, token);
  }

  async getUserTenants(token: string) {
    return this.get<UserTenantInfo[]>('/users/me/tenants', token);
  }

  // File upload with optional inference configuration
  async uploadFile(
    file: File,
    category: string,
    isPublic: boolean,
    token: string,
    inferenceConfig?: InferenceConfigDto,
    onUploadProgress?: (progress: number) => void
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('isPublic', String(isPublic));
    formData.append('inference', String(!!inferenceConfig?.enabled));

    if (inferenceConfig?.enabled) {
      formData.append('inferenceConfig', JSON.stringify(inferenceConfig));
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      }
    };

    const response = await this.axiosInstance.post<UploadFileResponse>(
      '/files/upload',
      formData,
      config
    );
    return response.data;
  }
}

// Types
export interface RegisterResponse {
  message: string;
  token: string;
  success: boolean;
  data: {
    message: string;
    token: string;
    success: boolean;
    license: LicenseInfo;
    user: User;
  };
}

export interface LoginResponse {
  message: string;
  token: string;
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface VerifyResponse {
  message: string;
  token: string;
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

export interface WhitelistedIP {
  id: number;
  ipAddress: string;
  description: string | null;
  isActive: boolean;
  isLocked: boolean;
  addedByEmail: string | null;
  addedAt: string;
  lastUpdated: string;
}

export interface LicenseInfo {
  licenseKey: string;
  expiryDate: string;
  ipAddress: string;
  isValid: boolean;
  daysRemaining: number;
  lastUpdated: string;
}

export interface LicenseValidation {
  isValid: boolean;
  message: string;
  daysRemaining: number;
}

export interface ApiKey {
  id: number;
  keyPrefix: string;
  name: string;
  scopes: string[];
  expiresAt: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface GeneratedApiKey {
  id: number;
  apiKey: string;
  keyPrefix: string;
  name: string;
  scopes: string[];
  expiresAt: string | null;
}

export interface GetAPIKeysResponse {
  message: string;
  data: ApiKey[];
}

export interface GeneratedAPIKeyResponse {
  message: string;
  response: GeneratedApiKey;
}

export interface getLicenseInfoResponse {
  status: boolean;
  message: string;
  data: LicenseInfo;
}

export interface getWhitelistResponse {
  status: boolean;
  message: string;
  data: WhitelistedIP[];
}

// addIPToWhitelist
export interface addIPToWhitelistResponse {
  status: boolean;
  message: string;
  data: WhitelistedIP;
}

// deleteWhitelistedIP
export interface deleteWhitelistedIPResponse {
  status: boolean;
  message: string;
}
// lockWhitelistedIP
export interface lockWhitelistedIPResponse {
  status: boolean;
  message: string;
}
// unlockWhitelistedIP
export interface unlockWhitelistedIPResponse {
  status: boolean;
  message: string;
}

// Member Quota
export interface UserQuota {
  id: number;
  userId: number;
  usedStorage: number;
}

// File Meta
export interface FileMeta {
  id: string;
  fileName: string;
  category: string;
  sizeInBytes: number;
  contentType: string;
  userId: number;
  storageUrl: string;
  bucketName: string;
  objectKey: string;
  isPublic: boolean;
  uploadedAt: string;
  expiryDate: string;
  isDeleted: boolean;
  presignedUrl: string | null;
}

export interface GetUserFilesResponse {
  files: FileMeta[];
  totalFiles: number;
  category: string;
}

export interface FileAccessUrlResponse {
  fileId: string;
  accessUrl: string;
  expiresInHours: number;
}

export interface ShareFileResponse {
  fileId: string;
  shareUrl: string;
  expiryHours: number;
}

export interface AuditLog {
  id: number;
  email: string;
  action: string;
  type: 'SUCCESS' | 'FAILURE';
  timestamp: string;
  additionalData?: string;
}

export interface AuditLogsPageResponse {
  logs: AuditLog[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Legacy interface for backward compatibility
export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  operation: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: string;
}

export interface AuditLogResponse {
  logs: AuditEntry[];
  total: number;
}

export interface SemanticSearchResult {
  file: FileMeta;
  relevanceScore: number;
  reason: string;
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
}

// Inference Configuration
export interface InferenceConfigDto {
  enabled: boolean;
  visibility?: string;  // PRIVATE, PUBLIC, TEAM
  scope?: string;        // DOCUMENT, COLLECTION, GLOBAL
}

export type InferencePreset = 'private' | 'public' | 'team' | 'disabled';

export const inferencePresets: Record<InferencePreset, { label: string; description: string; config?: InferenceConfigDto }> = {
  disabled: {
    label: 'No Processing',
    description: 'File stored without AI analysis'
  },
  private: {
    label: 'Private Document',
    description: 'Indexed for personal retrieval only',
    config: {
      enabled: true,
      visibility: 'PRIVATE',
      scope: 'DOCUMENT'
    }
  },
  public: {
    label: 'Public Document',
    description: 'Searchable externally and indexed',
    config: {
      enabled: true,
      visibility: 'PUBLIC',
      scope: 'DOCUMENT'
    }
  },
  team: {
    label: 'Team Collection',
    description: 'Indexed with team scope for collaboration',
    config: {
      enabled: true,
      visibility: 'TEAM',
      scope: 'COLLECTION'
    }
  }
};

export interface UploadFileResponse {
  message: string;
  storageUrl: string;
  presignedUrl: string;
  fileId: string;
  status: number;
  success: boolean;
}

// Multi-Scope Search Types
export interface MultiScopeSearchRequest {
  query: string;
  nResults?: number;
  scopes?: string[]; // VisibilityLevel[]
  departmentFilter?: string;
  organizationFilter?: string;
}

export interface SearchResultItem {
  text: string;
  distance: number;
  sourceDocument: string;
  fileId?: string;
  collectionName?: string;
}

export interface MultiScopeSearchResponse {
  results: SearchResultItem[];
  scopeBreakdown: Record<string, number>;
  success: boolean;
  message: string;
  executionTimeMs?: number;
}

export interface UserScopes {
  userId: number;
  department?: string;
  organization?: string;
  roleLevel?: string;
}

// Search History Types
export interface SearchHistoryEntry {
  id: number;
  userId: number;
  query: string;
  resultCount: number;
  timestamp: string;
  searchedScopesJson?: string;
  userDepartment?: string;
  userOrganization?: string;
  filtersJson?: string;
  executionTimeMs?: number;
  errorMessage?: string;
  wasSuccessful: boolean;
}

export interface SearchHistoryPageResponse {
  content: SearchHistoryEntry[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  message: string;
  success: boolean;
}

export interface SearchHistoryResponse {
  message: string;
  success: boolean;
  data?: SearchHistoryEntry;
}

export interface SearchAnalytics {
  totalSearches: number;
  scopeUsageDistribution: Record<string, number>;
  averageResultsPerSearch: number;
  averageExecutionTimeMs?: number;
  resultCountDistribution: Record<string, number>;
  topQueries: string[];
  searchesByDay?: Record<string, number>;
}

// Multi-Tenant Types
export interface UserTenantInfo {
  tenantId: number;
  tenantKey: string;
  tenantDisplayName: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
}

export interface SwitchTenantResponse {
  success: boolean;
  message: string;
  token: string;
  activeTenantId: number;
}

// Admin Management Types
export interface TenantInfo {
  id: number;
  tenantKey: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  subscriptionTier: string;
  maxStorageQuota?: number;
  maxUsers?: number;
  maxFileSize?: number;
  enableInference: boolean;
  enableSearch: boolean;
  enablePublicSharing: boolean;
  billingEmail?: string;
  createdAt: string;
  updatedAt: string;
  currentUserCount?: number;
  currentStorageUsed?: number;
}

export interface CreateTenantRequest {
  tenantKey: string;
  displayName: string;
  description?: string;
  subscriptionTier?: string;
  maxStorageQuota?: number;
  maxUsers?: number;
  maxFileSize?: number;
  enableInference?: boolean;
  enableSearch?: boolean;
  enablePublicSharing?: boolean;
  billingEmail?: string;
}

export interface CreateTenantResponse {
  success: boolean;
  tenant: TenantInfo;
  message: string;
}

export interface TenantAssignment {
  tenantId: number;
  role: string;
}

export interface CreateUserWithTenantsRequest {
  email: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  temporaryPassword: string;
  tenants: TenantAssignment[];
  sourceSystem?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    mustChangePassword: boolean;
    sourceSystem?: string;
    tenants: UserTenantInfo[];
  };
  temporaryPassword: string;
  message: string;
}

export interface AssignUserToTenantRequest {
  tenantId: number;
  role: string;
}

export const apiClient = new ApiClient();
