"use client";
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, LicenseInfo } from '@/lib/api';
import type { User } from '@/lib/api';
import { toast } from 'sonner';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyingRef = useRef(false);
  const router = useRouter();

  // Verify session on mount and refresh token
  useEffect(() => {
    const verifySession = async () => {
      // Prevent multiple simultaneous verify calls using ref
      if (verifyingRef.current) {
        console.log('[AuthContext] Verify already in progress, skipping...');
        return;
      }
      
      const storedToken = localStorage.getItem('monaco_token');
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        verifyingRef.current = true;
        setIsVerifying(true);
        console.log('[AuthContext] Verifying session with token:', storedToken.substring(0, 20) + '...');
        const response = await apiClient.verifyUser(storedToken);
        
        if (response.success && response.data) {
          const { user: verifiedUser, token: refreshedToken } = response.data;
          console.log('[AuthContext] Session verified. New token:', refreshedToken.substring(0, 20) + '...');
          setUser(verifiedUser);
          setAccessToken(refreshedToken);
          localStorage.setItem('monaco_user', JSON.stringify(verifiedUser));
          localStorage.setItem('monaco_token', refreshedToken);
        } else {
          // Invalid session - clear storage
          console.log('[AuthContext] Session verification failed - clearing state');
          clearAuthState();
        }
      } catch (error: any) {
        console.error('Session verification failed:', error);
        
        // Check if backend sent redirect flag
        if (error?.response?.data?.redirect || error?.response?.status === 401) {
          clearAuthState();
          router.push('/login');
          toast.error('Session expired. Please login again.');
        }
      } finally {
        verifyingRef.current = false;
        setIsVerifying(false);
        setIsLoading(false);
      }
    };

    verifySession();
  }, [router]);

  const clearAuthState = () => {
    setUser(null);
    setAccessToken(null);
    setLicenses(null);
    localStorage.removeItem('monaco_user');
    localStorage.removeItem('monaco_token');
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.loginUser(email, password);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { user, token } = response.data;
      
      if (!user || !token) {
        throw new Error('Invalid login response');
      }

      setUser(user);
      setAccessToken(token);
      localStorage.setItem('monaco_user', JSON.stringify(user));
      localStorage.setItem('monaco_token', token);
      
      toast.success(`Welcome back, ${user.userName}`);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
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
      localStorage.setItem('monaco_user', JSON.stringify(userInfo));
      localStorage.setItem('monaco_token', token);
      
      if (license) {
        setLicenses([license]);
      }

      toast.success(`Account created successfully! Welcome, ${userInfo.userName}`);
    } catch (error: any) {
      console.error('Signup error:', error);
      const message = error?.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
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
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
      toast.success('Logged out successfully');
      router.push('/login');
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