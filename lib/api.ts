const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9442/api/v1';

interface ApiResponse<T> {
  responseCode: number;
  status: boolean;
  message: string;
  data: T | null;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('monaco_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async post<T>(endpoint: string, body?: object): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  async put<T>(endpoint: string, body?: object): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // IP Whitelisting
  async getCurrentIP() {
    return this.get<{ ipAddress: string }>('/ips/current');
  }

  async checkIPWhitelisted() {
    return this.get<boolean>('/ips/check');
  }

  async getWhitelist() {
    return this.get<WhitelistedIP[]>('/ips/whitelist');
  }

  async addIPToWhitelist(ipAddress: string, description?: string) {
    return this.post<WhitelistedIP>('/ips/whitelist', { ipAddress, description });
  }

  async deleteWhitelistedIP(id: number) {
    return this.delete<void>(`/ips/whitelist/${id}`);
  }

  async lockWhitelistedIP(id: number) {
    return this.post<WhitelistedIP>(`/ips/whitelist/${id}/lock`);
  }

  // License Management
  async getLicenseInfo() {
    return this.get<LicenseInfo>('/license/info');
  }

  async renewLicense(licenseKey: string) {
    return this.post<LicenseInfo>('/license/renew', { licenseKey });
  }

  async validateLicense() {
    return this.get<LicenseValidation>('/license/validate');
  }

  // API Keys
  async getApiKeys() {
    return this.get<ApiKey[]>('/apikeys');
  }

  async generateApiKey(name: string, expiresInDays?: number, scopes?: string[]) {
    return this.post<GeneratedApiKey>('/apikeys/generate', { name, expiresInDays, scopes });
  }

  async revokeApiKey(id: number) {
    return this.delete<void>(`/apikeys/${id}`);
  }
}

// Types
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

export const apiClient = new ApiClient();
