'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; unverified?: boolean; email?: string; user?: User }>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; message?: string; error?: string; requiresVerification?: boolean; user?: User }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string; error?: string; expired?: boolean }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  sendSignInOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOtp: (email: string, otp: string, purpose: 'signup' | 'signin' | 'reset_password') => Promise<{ success: boolean; message?: string; error?: string; resetToken?: string; user?: User; expired?: boolean; maxAttemptsReached?: boolean; remainingAttempts?: number }>;
  resendOtp: (email: string, purpose: 'signup' | 'signin' | 'reset_password') => Promise<{ success: boolean; message?: string; error?: string; cooldownRemaining?: number }>;
  loginWithGoogle: (redirectUrl?: string) => Promise<{ success: boolean; error?: string; user?: User; configured?: boolean }>;
  logout: (redirectTo?: string) => Promise<void>;
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
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

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

  // Activity tracking and session keep-alive heartbeat for privileged roles (Admin, Editor, Author)
  useEffect(() => {
    if (!currentUser || !isAuthenticated) return;

    const role = (currentUser.role || '').toLowerCase();
    const isPrivileged = ['admin', 'superadmin', 'editor', 'author'].includes(role);
    if (!isPrivileged) return;

    let lastActivityTime = Date.now();
    let isSendingHeartbeat = false;

    const handleUserActivity = () => {
      lastActivityTime = Date.now();
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'input'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Throttled heartbeat check every 60 seconds
    const intervalId = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;

      // If user performed active work in the last 75 seconds, send a keep-alive heartbeat
      if (timeSinceLastActivity < 75000 && !isSendingHeartbeat) {
        isSendingHeartbeat = true;
        try {
          const res = await fetch('/api/auth/me', {
            method: 'POST',
            cache: 'no-store',
          });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (!data?.user) {
              setCurrentUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch {
          // Retry on next active interval
        } finally {
          isSendingHeartbeat = false;
        }
      }
    }, 60000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [currentUser?.id, currentUser?.role, isAuthenticated]);

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
  }): Promise<{ success: boolean; message?: string; error?: string; requiresVerification?: boolean; user?: User }> => {
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

      if (!result.requiresVerification && result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
      }

      return {
        success: true,
        message: result.message,
        requiresVerification: result.requiresVerification,
        user: result.user,
      };
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

  const sendSignInOtp = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/send-signin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to send sign-in code' };
      }

      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Send sign-in code request failed' };
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string,
    purpose: 'signup' | 'signin' | 'reset_password'
  ): Promise<{ success: boolean; message?: string; error?: string; resetToken?: string; user?: User; expired?: boolean; maxAttemptsReached?: boolean; remainingAttempts?: number }> => {
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

      if (result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
      }

      return { success: true, message: result.message, resetToken: result.resetToken, user: result.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification request failed' };
    }
  };

  const resendOtp = async (
    email: string,
    purpose: 'signup' | 'signin' | 'reset_password'
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

  const loginWithGoogle = async (
    redirectUrl: string = '/'
  ): Promise<{ success: boolean; error?: string; user?: User; configured?: boolean }> => {
    try {
      setIsLoading(true);

      // 1. Fetch Google Client ID & Config
      let clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
      if (!clientId) {
        try {
          const configRes = await fetch('/api/auth/google/config');
          if (configRes.ok) {
            const configData = await configRes.json();
            if (configData?.clientId) {
              clientId = configData.clientId;
            }
          }
        } catch {
          // Ignored, will check below
        }
      }

      // 2. Load Google Identity Services (GIS) script
      const loadGis = async (): Promise<boolean> => {
        if (typeof window === 'undefined') return false;
        if ((window as any).google?.accounts?.id || (window as any).google?.accounts?.oauth2) {
          return true;
        }
        return new Promise((resolve) => {
          const existing = document.getElementById('google-identity-services-script');
          if (existing) {
            if ((window as any).google?.accounts) return resolve(true);
            existing.addEventListener('load', () => resolve(true));
            existing.addEventListener('error', () => resolve(false));
            return;
          }
          const script = document.createElement('script');
          script.id = 'google-identity-services-script';
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.head.appendChild(script);
        });
      };

      const gisLoaded = await loadGis();
      const google = typeof window !== 'undefined' ? (window as any).google : null;

      // 3. If GIS is available and we have a clientId, use the official GIS Code/Token Client
      if (gisLoaded && google?.accounts?.oauth2 && clientId) {
        return new Promise((resolve) => {
          let isHandled = false;

          try {
            const client = google.accounts.oauth2.initCodeClient({
              client_id: clientId,
              scope: 'openid email profile',
              ux_mode: 'popup',
              select_account: true,
              callback: async (response: any) => {
                if (isHandled) return;
                isHandled = true;

                if (response?.error) {
                  if (response.error === 'access_denied' || response.error === 'popup_closed_by_user') {
                    resolve({ success: false, error: 'Sign in was cancelled.', configured: true });
                  } else {
                    resolve({ success: false, error: response.error_description || response.error || 'Google authentication failed', configured: true });
                  }
                  return;
                }

                if (response?.code) {
                  try {
                    const authRes = await fetch('/api/auth/google', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code: response.code }),
                    });

                    const authData = await authRes.json().catch(() => ({ error: `Server error (${authRes.status})` }));
                    if (authRes.ok && authData?.success && authData?.user) {
                      setCurrentUser(authData.user);
                      setIsAuthenticated(true);
                      resolve({ success: true, user: authData.user, configured: true });
                    } else {
                      resolve({ success: false, error: authData?.error || 'Failed to authenticate Google user', configured: true });
                    }
                  } catch (postErr: any) {
                    resolve({ success: false, error: postErr?.message || 'Failed to complete Google authentication', configured: true });
                  }
                } else {
                  resolve({ success: false, error: 'No authorization code received from Google', configured: true });
                }
              },
              error_callback: (error: any) => {
                if (isHandled) return;
                isHandled = true;
                if (error?.type === 'popup_closed' || error?.type === 'user_cancel') {
                  resolve({ success: false, error: 'Sign in was cancelled.', configured: true });
                } else {
                  resolve({ success: false, error: error?.message || 'Google Sign-In popup closed or encountered an error', configured: true });
                }
              },
            });

            client.requestCode();
            return;
          } catch (initErr) {
            console.warn('GIS initCodeClient failed, falling back to popup flow:', initErr);
          }
        });
      }

      // 4. Fallback: Direct OAuth URL popup flow with Google Account Chooser (prompt=select_account)
      const urlRes = await fetch(`/api/auth/google/url?redirect=${encodeURIComponent(redirectUrl)}`);
      const urlData = await urlRes.json().catch(() => ({ error: 'Failed to fetch Google login URL' }));

      if (!urlData.configured || !urlData.url) {
        return {
          success: false,
          configured: false,
          error: urlData.error || 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment variables.',
        };
      }

      return new Promise((resolve) => {
        const width = 550;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;

        const popup = window.open(
          urlData.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
        );

        if (!popup) {
          window.location.href = urlData.url;
          resolve({ success: true, configured: true });
          return;
        }

        let isResolved = false;

        const messageListener = async (event: MessageEvent) => {
          if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
            isResolved = true;
            window.removeEventListener('message', messageListener);
            if (event.data.user) {
              setCurrentUser(event.data.user);
              setIsAuthenticated(true);
            } else {
              await refreshSession();
            }
            resolve({ success: true, user: event.data.user, configured: true });
          } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
            isResolved = true;
            window.removeEventListener('message', messageListener);
            resolve({
              success: false,
              error: event.data.message || 'Google authentication failed',
              configured: true,
            });
          }
        };

        window.addEventListener('message', messageListener);

        const checkClosedInterval = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosedInterval);
            setTimeout(() => {
              if (!isResolved) {
                window.removeEventListener('message', messageListener);
                resolve({
                  success: false,
                  error: 'Sign in was cancelled.',
                  configured: true,
                });
              }
            }, 500);
          }
        }, 800);
      });
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in request failed', configured: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (redirectTo: string = '/login') => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    // 1. Immediately wipe client-side authentication state synchronously
    setCurrentUser(null);
    setIsAuthenticated(false);

    try {
      // 2. Perform backend session and cookie clearance
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache' },
      });
    } catch {
      // Ignored - ensure redirection proceeds regardless
    } finally {
      // 3. Atomically replace the window location with the login page
      // window.location.replace replaces the history state to prevent Back-button reentry
      window.location.replace(redirectTo);
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
        isLoggingOut,
        login,
        register,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        sendSignInOtp,
        verifyOtp,
        resendOtp,
        loginWithGoogle,
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
