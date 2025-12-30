import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9442/api/v1';

export interface User {
  email: string;
  userName: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getAuthConfig(token?: string): AxiosRequestConfig {
    const config: AxiosRequestConfig = {};
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
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
  async registerDefaultUser(email: string, password: string, userName: string) {
    return this.post<RegisterResponse>('/users/registerDefaultUser', { email, password, userName });
  }

  async loginUser(email: string, password: string) {
    return this.post<LoginResponse>('/users/login', { email, password });
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
    return this.get<WhitelistedIP[]>('/ips/whitelist', token);
  }

  async addIPToWhitelist(token: string,ipAddress: string, description?: string) {
    return this.post<WhitelistedIP>('/ips/whitelist', { ipAddress, description }, token);
  }

  async deleteWhitelistedIP(id: number, token: string) {
    return this.delete<void>(`/ips/whitelist/${id}`, token);
  }

  async lockWhitelistedIP(id: number, token: string) {
    return this.post<WhitelistedIP>(`/ips/whitelist/${id}/lock`, {}, token);
  }

  // License Management
  async getLicenseInfo(token: string) {
    return this.get<LicenseInfo>('/license/info', token);
  }

  async renewLicense(licenseKey: string, token: string) {
    return this.post<LicenseInfo>('/license/renew', { licenseKey }, token);
  }

  async validateLicense(token: string) {
    return this.get<LicenseValidation>('/license/validate', token);
  }

  // API Keys
  async getApiKeys(token: string) {
    return this.get<ApiKey[]>('/apikeys', token);
  }

  async generateApiKey(name: string, token: string, expiresInDays: number, scopes?: string[]) {
    return this.post<GeneratedApiKey>('/apikeys/generate', { name, expiresInDays, scopes }, token);
  }

  async revokeApiKey(id: number, token: string) {
    return this.delete<void>(`/apikeys/${id}`, token);
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

export const apiClient = new ApiClient();
