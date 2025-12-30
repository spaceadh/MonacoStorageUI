"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import {  } from '@/lib/api';
import { apiClient, LicenseInfo } from '@/lib/api';
import type { User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  licenses: LicenseInfo[] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<LicenseInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth state on mount
    const storedUser = localStorage.getItem('monaco_user');
    const storedToken = localStorage.getItem('monaco_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('monaco_user');
        localStorage.removeItem('monaco_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.loginUser(email, password);

      console.log('Login response:', response);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { user, token } = response.data;
      
      if (!user || !token) {
        throw new Error('Invalid login response');
      }

      setUser(user);
      setAccessToken(token);
      localStorage.setItem('monaco_token', token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userName: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.registerDefaultUser(email, password, userName);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed');
      }

      const { user: userInfo, license, token } = response.data;
      
      if (!userInfo || !token) {
        throw new Error('Invalid registration response');
      }

      setUser(userInfo);
      setAccessToken(token);
      localStorage.setItem('monaco_token', token);
      
      if (license) {
        setLicenses([license]);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await apiClient.logoutUser(accessToken);
      }
      setUser(null);
      setAccessToken(null);
      setLicenses(null);
      localStorage.removeItem('monaco_token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setAccessToken(null);
      setLicenses(null);
      localStorage.removeItem('monaco_token');
    }
  };

  const value: AuthContextType = {
    user,
    licenses,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}