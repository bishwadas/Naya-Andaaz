import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/db/repository';
import { createOtpForEmail } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import { isEmailVerificationEnabled } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(cleanEmail);

    if (user && user.isActive) {
      // Generate OTP
      const otpResult = await createOtpForEmail(cleanEmail, 'reset_password');
      if (otpResult.success && otpResult.otp) {
        // Send via Brevo only when email verification is actively enabled
        if (isEmailVerificationEnabled()) {
          await sendOtpEmail({
            to: cleanEmail,
            name: user.name,
            otp: otpResult.otp,
            purpose: 'reset_password',
          });
        } else {
          console.log(`[Forgot Password] Brevo delivery paused. Generated OTP for ${cleanEmail}: ${otpResult.otp}`);
        }
      } else if (!otpResult.success) {
        // If cooldown applies or generate fails, we can handle it.
        // For rate limit cooldown, we can return the exact message to prevent flooding:
        if (otpResult.cooldownRemaining) {
          return NextResponse.json(
            { success: false, error: otpResult.error },
            { status: 429 }
          );
        }
      }
    }

    // Always return generic response to prevent account enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a 6-digit verification code has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}
