'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-client';
import { Mail, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  purpose: 'signup' | 'signin' | 'reset_password';
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
        }, 1200);
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
        setSuccess('A new 6-digit code has been sent.');
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
        <div className="mx-auto w-12 h-12 bg-pink-50 border border-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-sm">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 tracking-tight">
          Enter 6-Digit Code
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
          We sent a verification code to <br />
          <strong className="text-stone-900 font-semibold">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
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
            className="w-11 h-14 sm:w-13 sm:h-16 bg-white border-2 border-stone-200 focus:border-pink-600 focus:ring-4 focus:ring-pink-100 text-center font-mono font-bold text-2xl text-stone-900 rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:bg-stone-50"
          />
        ))}
      </div>

      {/* Countdown and Timer Details */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-mono px-1">
        <div>
          {expirySeconds > 0 ? (
            <span className="text-stone-500">
              Expires in:{' '}
              <strong className="text-pink-600 font-bold">
                {formatTime(expirySeconds)}
              </strong>
            </span>
          ) : (
            <span className="text-red-600 font-bold">Code expired</span>
          )}
        </div>

        <div>
          {cooldownSeconds > 0 ? (
            <span className="text-stone-400">Resend in {cooldownSeconds}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-pink-600 hover:text-pink-700 font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying code...</span>
            </>
          ) : (
            <span>Verify & Continue</span>
          )}
        </button>
      </div>

      {onBackToRequest && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onBackToRequest}
            className="text-stone-500 hover:text-stone-700 text-xs font-medium underline cursor-pointer"
          >
            Use a different email address
          </button>
        </div>
      )}
    </div>
  );
}
