'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-client';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('from') || '';
  const messageParam = searchParams.get('message') || '';

  const { login, resendVerification, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(messageParam);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setUnverifiedEmail(null);
    setResendStatus(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        if (result.unverified) {
          setUnverifiedEmail(result.email || email.trim());
          setError(result.error || 'Your email address is not verified yet.');
        } else {
          setError(result.error || 'Invalid email or password.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success - use window.location.href to guarantee cookie header is included on full page request
      const roleUpper = result.user?.role?.toUpperCase();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (roleUpper === 'ADMIN' || roleUpper === 'SUPERADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (roleUpper === 'EDITOR') {
        window.location.href = '/editor';
      } else if (roleUpper === 'AUTHOR') {
        window.location.href = '/author';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendingEmail(true);
    setResendStatus(null);

    try {
      const res = await resendVerification(unverifiedEmail);
      if (res.success) {
        setResendStatus('Verification email sent! Please check your inbox.');
      } else {
        setResendStatus(res.error || 'Could not resend email at this time.');
      }
    } catch {
      setResendStatus('Failed to send verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  const setDemoCredentials = (role: 'admin' | 'editor' | 'author' | 'subscriber') => {
    const credentials = {
      admin: { email: 'admin@sereia.news', pass: 'AdminPass2026!' },
      editor: { email: 'editor@sereia.news', pass: 'AdminPass2026!' },
      author: { email: 'author@sereia.news', pass: 'AdminPass2026!' },
      subscriber: { email: 'user@sereia.news', pass: 'AdminPass2026!' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Background Decorative Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="font-serif text-3xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              SEREIA
            </span>
            <span className="text-[10px] uppercase tracking-widest bg-stone-900 border border-stone-800 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
              Gazette
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-serif font-bold text-stone-100">
            Sign In to Sereia
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-400">
            Access your publication workspace and member discussions
          </p>
        </div>

        {/* Card Box */}
        <div className="mt-8 bg-stone-900/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                {unverifiedEmail && (
                  <div className="mt-3 pt-3 border-t border-rose-900/50">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 underline transition"
                    >
                      {resendingEmail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Sending verification email...
                        </>
                      ) : (
                        'Resend verification email'
                      )}
                    </button>
                    {resendStatus && (
                      <p className="mt-1.5 text-xs text-amber-200/90 font-medium">
                        {resendStatus}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-stone-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  suppressHydrationWarning
                  className="w-full bg-stone-950 border border-stone-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-stone-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  suppressHydrationWarning
                  className="w-full bg-stone-950 border border-stone-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  suppressHydrationWarning
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                suppressHydrationWarning
                className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-3 px-4 rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Login Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-stone-800/80">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Sign-In</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="text-left px-3 py-2 rounded-lg bg-stone-950/80 border border-amber-500/40 hover:border-amber-400 text-xs font-medium text-amber-300 transition flex items-center justify-between"
              >
                <span>👑 Admin</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('editor')}
                className="text-left px-3 py-2 rounded-lg bg-stone-950/80 border border-stone-800 hover:border-stone-700 text-xs font-medium text-stone-300 transition"
              >
                ✏️ Editor
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('author')}
                className="text-left px-3 py-2 rounded-lg bg-stone-950/80 border border-stone-800 hover:border-stone-700 text-xs font-medium text-stone-300 transition"
              >
                🖋️ Author
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('subscriber')}
                className="text-left px-3 py-2 rounded-lg bg-stone-950/80 border border-stone-800 hover:border-stone-700 text-xs font-medium text-stone-300 transition"
              >
                👤 Subscriber
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-stone-400">
          Don&apos;t have an account yet?{' '}
          <Link href="/sign-up" className="font-semibold text-amber-400 hover:text-amber-300 transition">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
