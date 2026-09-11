'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-client';
import { SiteSettings } from '@/types';
import { AlertCircle, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { OtpVerification } from '@/components/auth/OtpVerification';

export default function SignInPage() {
  const router = useRouter();
  const { login, loginWithGoogle, sendSignInOtp, isLoading: isAuthLoading } = useAuth();

  // Settings & Logo state from centralized CMS configuration
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [logoImgError, setLogoImgError] = useState(false);

  // Form states
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Post-login redirect logic taking into account roles and requested callbacks
  const navigatePostLogin = (userRole?: string) => {
    let destination = '/account/profile';
    const role = String(userRole || '').toUpperCase();

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl =
        searchParams.get('callbackUrl') ||
        searchParams.get('redirect') ||
        searchParams.get('from');

      if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
        destination = callbackUrl;
      } else {
        if (role === 'ADMIN' || role === 'SUPERADMIN') destination = '/admin';
        else if (role === 'EDITOR') destination = '/editor';
        else if (role === 'AUTHOR') destination = '/author';
        else destination = '/account/profile';
      }

      // Check role permissions against destination to prevent 404 / access issues
      if (destination.startsWith('/admin') && role !== 'ADMIN' && role !== 'SUPERADMIN') {
        if (role === 'EDITOR') destination = '/editor';
        else if (role === 'AUTHOR') destination = '/author';
        else destination = '/account/profile';
      } else if (destination.startsWith('/editor') && role !== 'ADMIN' && role !== 'SUPERADMIN' && role !== 'EDITOR') {
        if (role === 'AUTHOR') destination = '/author';
        else destination = '/account/profile';
      } else if (destination.startsWith('/author') && role !== 'ADMIN' && role !== 'SUPERADMIN' && role !== 'EDITOR' && role !== 'AUTHOR') {
        destination = '/account/profile';
      }
    }

    router.push(destination);
    setTimeout(() => {
      if (window.location.pathname === '/sign-in' || window.location.pathname === '/login') {
        window.location.href = destination;
      }
    }, 300);
  };

  // Fetch centralized site settings for header logo synchronization
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setSettings(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load site settings for logo:', err);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Google Identity Services (GIS) One Tap / Account Picker
  useEffect(() => {
    let isMounted = true;
    async function initGisPrompt() {
      try {
        const configRes = await fetch('/api/auth/google/config');
        if (!configRes.ok) return;
        const configData = await configRes.json();
        const clientId = configData?.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || !isMounted) return;

        // Load GIS script if not already present
        if (typeof window !== 'undefined' && !(window as any).google?.accounts?.id) {
          await new Promise<void>((resolve) => {
            const existing = document.getElementById('google-identity-services-script');
            if (existing) {
              if ((window as any).google?.accounts) return resolve();
              existing.addEventListener('load', () => resolve());
              existing.addEventListener('error', () => resolve());
              return;
            }
            const script = document.createElement('script');
            script.id = 'google-identity-services-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => resolve();
            document.head.appendChild(script);
          });
        }

        if (!isMounted || !(window as any).google?.accounts?.id) return;

        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response?.credential) {
              setIsSubmitting(true);
              try {
                const res = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: response.credential }),
                });
                const data = await res.json().catch(() => ({ error: 'Authentication failed' }));
                if (res.ok && data?.success && data?.user) {
                  navigatePostLogin(data.user.role);
                } else {
                  setError(data?.error || 'Failed to authenticate with Google');
                }
              } catch (err: any) {
                setError(err?.message || 'Google authentication failed');
              } finally {
                setIsSubmitting(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
        });

        // Prompt Google Account Picker One Tap
        (window as any).google.accounts.id.prompt();
      } catch (err) {
        console.warn('GIS initialization notice:', err);
      }
    }

    initGisPrompt();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Determine site logo source matching the site header logic
  const logoSrc =
    !logoImgError && settings
      ? settings.logoPrimary ||
        settings.logoMobile ||
        settings.logo_url ||
        (settings.logo && settings.logo !== '/logo.svg' ? settings.logo : '')
      : '';

  const siteTitle = settings?.siteTitle || settings?.siteName || 'NayaAndaaz';

  // Handle Email + Password Sign In submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(cleanEmail, password);

      if (res.success && res.user) {
        navigatePostLogin(res.user.role);
      } else if (res.unverified) {
        setUnverifiedEmail(cleanEmail);
        setError('Your email is not yet verified. Please enter the verification code to activate your account.');
      } else {
        setError(res.error || 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Send Instant OTP Code submission
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendSignInOtp(cleanEmail);
      if (res.success) {
        setIsOtpSent(true);
      } else {
        setError(res.error || 'Failed to send sign-in code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth popup login handler
  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      let destination = '/account/profile';
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl =
          searchParams.get('callbackUrl') ||
          searchParams.get('redirect') ||
          searchParams.get('from');
        if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
          destination = callbackUrl;
        }
      }

      const res = await loginWithGoogle(destination);
      if (res.success && res.user) {
        navigatePostLogin(res.user.role);
      } else if (!res.success && res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-stone-200">
        {/* Header Logo & Title */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4 group" id="login-brand-logo">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={siteTitle}
                onError={() => setLogoImgError(true)}
                className="h-auto max-h-12 sm:max-h-14 lg:max-h-16 w-auto max-w-[240px] sm:max-w-[280px] object-contain hover:opacity-95 transition"
              />
            ) : (
              <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 group-hover:text-pink-600 transition">
                Naya<span className="text-pink-600">Andaaz</span>
              </span>
            )}
          </Link>

          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-sm text-stone-600">
            Or{' '}
            <Link href="/sign-up" className="font-medium text-pink-600 hover:text-pink-500 transition">
              create a new account
            </Link>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-200 animate-in fade-in duration-200" role="alert">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div className="ml-3 flex-1 text-sm text-red-700 font-medium">
                {error}
                {unverifiedEmail && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('otp');
                        setIsOtpSent(false);
                        setEmail(unverifiedEmail);
                        setError(null);
                        setUnverifiedEmail(null);
                      }}
                      className="text-xs font-bold text-pink-700 underline hover:text-pink-800"
                    >
                      Verify email with 6-digit code →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div>
          <button
            type="button"
            id="google-signin-button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || isAuthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-stone-300 rounded-xl shadow-2xs bg-white text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            or with email
          </span>
          <div className="border-t border-stone-200 w-full" />
        </div>

        {/* Authentication Mode Tabs: Password vs Instant OTP */}
        <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setIsOtpSent(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-center transition cursor-pointer ${
              authMode === 'password'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Password Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-center transition cursor-pointer ${
              authMode === 'otp'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Instant OTP Code
          </button>
        </div>

        {/* Auth Mode: Password */}
        {authMode === 'password' && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder:text-stone-400 text-stone-900 bg-white"
                />
              </div>
            </div>

            {/* Password field with Show/Hide toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder:text-stone-400 text-stone-900 bg-white"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 p-0.5 text-stone-400 hover:text-stone-700 focus:outline-none transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-stone-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-stone-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex items-center justify-end text-xs">
              <Link
                href="/forgot-password"
                className="font-medium text-pink-600 hover:text-pink-500 transition"
                id="forgot-password-link"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              id="signin-submit-button"
              disabled={isSubmitting || isAuthLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-md shadow-pink-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo & Admin Login Credentials */}
            <div className="pt-4 border-t border-stone-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Default Credentials
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-800">Admin:</span>{' '}
                    <span className="font-mono text-pink-700">admin@nayaandaaz.com</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@nayaandaaz.com');
                      setPassword('nayaandaaz@168');
                      setError(null);
                    }}
                    className="text-[11px] font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-md transition"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="text-[11px] text-stone-500">
                  Password: <span className="font-mono font-bold text-stone-700">nayaandaaz@168</span> (or <span className="font-mono text-stone-700">AdminPass2026!</span>)
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Auth Mode: Instant OTP Code */}
        {authMode === 'otp' && (
          <div>
            {isOtpSent ? (
              <OtpVerification
                email={email.trim().toLowerCase()}
                purpose="signin"
                onSuccess={() => {
                  navigatePostLogin();
                }}
                onBackToRequest={() => {
                  setIsOtpSent(false);
                  setError(null);
                }}
              />
            ) : (
              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div>
                  <label
                    htmlFor="otp-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                  >
                    ACCOUNT EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                    <input
                      id="otp-email"
                      name="otp-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder:text-stone-400 text-stone-900 bg-white"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-stone-500">
                    We'll email you a secure 6-digit code to sign in instantly without a password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-md shadow-pink-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Login Code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Sign-In Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
