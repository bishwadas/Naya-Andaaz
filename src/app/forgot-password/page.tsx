'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-client';
import { SiteSettings } from '@/types';
import { AlertCircle, ArrowRight, Loader2, CheckCircle2, Lock, Mail } from 'lucide-react';
import { OtpVerification } from '@/components/auth/OtpVerification';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();

  // Settings & Logo state from centralized CMS configuration
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [logoImgError, setLogoImgError] = useState(false);

  const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const logoSrc =
    !logoImgError && settings
      ? settings.logoPrimary ||
        settings.logoMobile ||
        settings.logo_url ||
        (settings.logo && settings.logo !== '/logo.svg' ? settings.logo : '')
      : '';

  const siteTitle = settings?.siteTitle || settings?.siteName || 'NayaAndaaz';

  // 1. Submit email to request 6-digit OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword(cleanEmail);
      if (res.success) {
        setStep('otp');
      } else {
        setError(res.error || 'Failed to process password reset request.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle OTP verification success
  const handleOtpVerified = () => {
    setError(null);
    setStep('newPassword');
  };

  // 3. Submit new password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update password');
        setIsLoading(false);
        return;
      }

      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-stone-200">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4 group" id="forgot-password-logo">
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
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Reset your password</h2>
          <p className="mt-2 text-sm text-stone-600">
            {step === 'email' && 'Enter your email to receive a 6-digit verification code.'}
            {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
            {step === 'newPassword' && 'Create a new secure password for your account.'}
            {step === 'success' && 'Password reset complete!'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-200 animate-in fade-in duration-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div className="ml-3 flex-1 text-sm text-red-700 font-medium">{error}</div>
            </div>
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <form className="space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder:text-stone-400 text-stone-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-md shadow-pink-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <Link href="/sign-in" className="text-sm font-medium text-pink-600 hover:text-pink-500 transition">
                Return to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Enter 6-digit OTP */}
        {step === 'otp' && (
          <OtpVerification
            email={email}
            purpose="reset_password"
            onSuccess={() => handleOtpVerified()}
            onBackToRequest={() => {
              setStep('email');
              setError(null);
            }}
          />
        )}

        {/* Step 3: Set New Password */}
        {step === 'newPassword' && (
          <form className="space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder:text-stone-400 text-stone-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder:text-stone-400 text-stone-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-md shadow-pink-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Password Updated Successfully</h3>
            <p className="text-sm text-stone-600">
              Your account password has been updated. You can now sign in using your new credentials.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-md shadow-pink-500/20 transition"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
