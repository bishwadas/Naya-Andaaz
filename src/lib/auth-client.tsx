'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; unverified?: boolean; email?: string; user?: User }>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; message?: string; error?: string; requiresVerification?: boolean }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string; error?: string; expired?: boolean }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOtp: (email: string, otp: string, purpose: 'signup' | 'reset_password') => Promise<{ success: boolean; message?: string; error?: string; resetToken?: string; expired?: boolean; maxAttemptsReached?: boolean; remainingAttempts?: number }>;
  resendOtp: (email: string, purpose: 'signup' | 'reset_password') => Promise<{ success: boolean; message?: string; error?: string; cooldownRemaining?: number }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchUserRole: (role: string) => Promise<boolean>;
  can: (action: string, authorId?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; unverified?: boolean; email?: string; user?: User }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed',
          unverified: data.unverified,
          email: data.email,
        };
      }

      setCurrentUser(data.user);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login request failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message?: string; error?: string; requiresVerification?: boolean }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      return { success: true, message: result.message, requiresVerification: result.requiresVerification };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration request failed' };
    }
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Password reset request failed' };
      }

      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Request failed' };
    }
  };

  const resetPassword = async (
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const result = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Password reset failed' };
      }

      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Reset request failed' };
    }
  };

  const verifyEmail = async (
    token: string
  ): Promise<{ success: boolean; message?: string; error?: string; expired?: boolean }> => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const result = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Verification failed',
          expired: result.expired,
        };
      }

      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification request failed' };
    }
  };

  const resendVerification = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to resend verification' };
      }

      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Resend request failed' };
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string,
    purpose: 'signup' | 'reset_password'
  ): Promise<{ success: boolean; message?: string; error?: string; resetToken?: string; expired?: boolean; maxAttemptsReached?: boolean; remainingAttempts?: number }> => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), purpose }),
      });

      const result = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Verification failed',
          expired: result.expired,
          maxAttemptsReached: result.maxAttemptsReached,
          remainingAttempts: result.remainingAttempts,
        };
      }

      return { success: true, message: result.message, resetToken: result.resetToken };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification request failed' };
    }
  };

  const resendOtp = async (
    email: string,
    purpose: 'signup' | 'reset_password'
  ): Promise<{ success: boolean; message?: string; error?: string; cooldownRemaining?: number }> => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose }),
      });

      const result = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Failed to resend verification code',
          cooldownRemaining: result.cooldownRemaining,
        };
      }

      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Resend request failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const switchUserRole = async (role: string): Promise<boolean> => {
    const roleMap: Record<string, string> = {
      admin: 'admin@sereia.news',
      editor: 'editor@sereia.news',
      author: 'author@sereia.news',
      subscriber: 'user@sereia.news',
    };
    const email = roleMap[role.toLowerCase()] || 'admin@sereia.news';
    const res = await login(email, 'AdminPass2026!');
    return res.success;
  };

  const can = (action: string, authorId?: string): boolean => {
    if (!currentUser || !currentUser.isActive) return false;
    const roleUpper = (currentUser.role || '').toUpperCase();

    if (roleUpper === 'ADMIN') return true;

    switch (action) {
      case 'manage_settings':
      case 'manage_users':
      case 'seed_database':
        return roleUpper === 'ADMIN';

      case 'manage_categories':
      case 'manage_tags':
      case 'manage_pages':
      case 'manage_menus':
      case 'manage_ads':
      case 'manage_videos':
      case 'manage_comments':
      case 'view_analytics':
        return roleUpper === 'ADMIN' || roleUpper === 'EDITOR';

      case 'edit_all_posts':
      case 'delete_posts':
        return roleUpper === 'ADMIN' || roleUpper === 'EDITOR';

      case 'manage_media':
      case 'create_posts':
      case 'publish_posts':
        return roleUpper === 'ADMIN' || roleUpper === 'EDITOR' || roleUpper === 'AUTHOR';

      case 'edit_own_post':
        if (roleUpper === 'ADMIN' || roleUpper === 'EDITOR') return true;
        if (roleUpper === 'AUTHOR' && authorId && authorId === currentUser.id) return true;
        return false;

      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        verifyOtp,
        resendOtp,
        logout,
        refreshSession,
        refreshUser: refreshSession,
        switchUserRole,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
