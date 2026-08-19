import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, verifyUserEmail, setUserPasswordResetToken } from '@/db/repository';
import { verifyOtpCode } from '@/lib/otp';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, otp, purpose } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return NextResponse.json(
        { success: false, error: '6-digit verification code is required' },
        { status: 400 }
      );
    }

    if (!purpose || (purpose !== 'signup' && purpose !== 'reset_password')) {
      return NextResponse.json(
        { success: false, error: 'Invalid purpose parameter' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No user account found for this email address.' },
        { status: 404 }
      );
    }

    // Call our verifyOtpCode logic
    const result = await verifyOtpCode(cleanEmail, otp, purpose);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          expired: result.expired,
          maxAttemptsReached: result.maxAttemptsReached,
          remainingAttempts: result.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // On successful verification:
    if (purpose === 'signup') {
      // Mark user as verified
      await verifyUserEmail(user.id);
      return NextResponse.json({
        success: true,
        message: 'Your email address has been verified successfully. You can now sign in.',
      });
    } else {
      // purpose === 'reset_password'
      // Generate a short-lived reset authorization token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes authorization window

      await setUserPasswordResetToken(cleanEmail, resetToken, resetTokenExpires);

      return NextResponse.json({
        success: true,
        resetToken,
        message: 'Verification successful. Please choose your new password.',
      });
    }
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify verification code.' },
      { status: 500 }
    );
  }
}
