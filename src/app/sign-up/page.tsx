'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { OtpVerification } from '@/components/auth/OtpVerification';

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      if (!result.success) {
        setError(result.error || 'Failed to create account.');
        setIsSubmitting(false);
        return;
      }

      if (!result.requiresVerification) {
        router.push('/');
        router.refresh();
        return;
      }

      setRegisteredEmail(email.trim());
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Background Decorative Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
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
            Create your account
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-400">
            Join Sereia to save stories, join discussions, and write articles
          </p>
        </div>

        {/* Card Box */}
        <div className="mt-8 bg-stone-900/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {isSuccess ? (
            /* Success State - OTP Verification */
            <OtpVerification
              email={registeredEmail}
              purpose="signup"
              onSuccess={() => {
                router.push('/sign-in?verified=true');
              }}
              onBackToRequest={() => {
                setIsSuccess(false);
              }}
            />
          ) : (
            /* Registration Form */
            <>
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-stone-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      suppressHydrationWarning
                      className="w-full bg-stone-950 border border-stone-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
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

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-stone-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
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
                  <p className="mt-1 text-[11px] text-stone-500">
                    Must be at least 8 characters long.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-wider text-stone-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      suppressHydrationWarning
                      className="w-full bg-stone-950 border border-stone-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      suppressHydrationWarning
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-3 px-4 rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-stone-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-semibold text-amber-400 hover:text-amber-300 transition">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
