'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-client';
import { Mail, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  purpose: 'signup' | 'reset_password';
  onSuccess: (data?: { resetToken?: string }) => void;
  onBackToRequest?: () => void;
}

export function OtpVerification({
  email,
  purpose,
  onSuccess,
  onBackToRequest,
}: OtpVerificationProps) {
  const { verifyOtp, resendOtp } = useAuth();

  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Timers
  const [expirySeconds, setExpirySeconds] = useState(600); // 10 minutes (600 seconds)
  const [cooldownSeconds, setCooldownSeconds] = useState(60); // 60 seconds cooldown for resend

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 10-Minute Expiration Countdown
  useEffect(() => {
    if (expirySeconds <= 0) return;

    const timer = setInterval(() => {
      setExpirySeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [expirySeconds]);

  // 60-Second Cooldown Countdown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, val: string) => {
    // Only allow single numeric character
    const numericVal = val.replace(/[^0-9]/g, '');
    if (!numericVal) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = '';
      setOtpValues(newOtpValues);
      return;
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = numericVal[numericVal.length - 1]; // take last entered character
    setOtpValues(newOtpValues);

    setError(null);

    // Auto focus next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentVal = otpValues[index];

      if (!currentVal && index > 0) {
        // Move focus back if current is empty and press backspace
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      }
      setError(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');

    if (pastedData.length >= 6) {
      const targetOtp = pastedData.slice(0, 6).split('');
      setOtpValues(targetOtp);
      setError(null);

      // Focus the last input box after pasting
      if (inputRefs.current[5]) {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    setError(null);
    setSuccess(null);

    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (expirySeconds <= 0) {
      setError('This verification code has expired. Please request a new one.');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await verifyOtp(email, otpCode, purpose);

      if (res.success) {
        setSuccess(res.message || 'Verification successful!');
        setTimeout(() => {
          onSuccess({ resetToken: res.resetToken });
        }, 1500);
      } else {
        setError(res.error || 'Invalid verification code.');
        if (res.expired || res.maxAttemptsReached) {
          // Clear inputs on full invalidation/expiration
          setOtpValues(Array(6).fill(''));
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldownSeconds > 0) return;

    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      const res = await resendOtp(email, purpose);

      if (res.success) {
        setSuccess('A new 6-digit code has been dispatched.');
        setOtpValues(Array(6).fill(''));
        setExpirySeconds(600); // reset 10-minute expiry
        setCooldownSeconds(60); // reset 60-second cooldown
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      } else {
        setError(res.error || 'Failed to dispatch new verification code.');
        if (res.cooldownRemaining) {
          setCooldownSeconds(res.cooldownRemaining);
        }
      }
    } catch (err) {
      setError('Failed to process resend request.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-400">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif font-bold text-stone-100">
          Enter Verification Code
        </h3>
        <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm mx-auto">
          We sent a secure 6-digit OTP code to <br />
          <strong className="text-amber-400 font-mono tracking-wide">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{success}</span>
        </div>
      )}

      {/* 6-Digit Numeric Boxes */}
      <div className="flex justify-center gap-2 sm:gap-3 my-4">
        {otpValues.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]*"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isVerifying || expirySeconds <= 0}
            className="w-12 h-14 sm:w-14 sm:h-16 bg-stone-950 border border-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-center font-mono font-bold text-2xl text-amber-400 rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-50"
          />
        ))}
      </div>

      {/* Countdown and Timer Details */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-mono px-1">
        <div>
          {expirySeconds > 0 ? (
            <span className="text-stone-400">
              Code expires in:{' '}
              <strong className="text-amber-500 font-bold">
                {formatTime(expirySeconds)}
              </strong>
            </span>
          ) : (
            <span className="text-rose-400 font-bold">Code expired</span>
          )}
        </div>

        <div>
          {cooldownSeconds > 0 ? (
            <span>Resend code in {cooldownSeconds}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isResending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Resend Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Verify Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || otpValues.join('').length !== 6 || expirySeconds <= 0}
          className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-3 px-4 rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying code...</span>
            </>
          ) : (
            <span>Verify & Confirm</span>
          )}
        </button>
      </div>

      {onBackToRequest && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onBackToRequest}
            className="text-stone-400 hover:text-stone-300 text-xs font-semibold underline cursor-pointer"
          >
            Use a different email address
          </button>
        </div>
      )}
    </div>
  );
}
