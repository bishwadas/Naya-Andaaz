import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername } from '@/db/repository';
import { createOtpForEmail } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import { INITIAL_USERS } from '@/lib/constants';

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

    // Check if user exists
    let user = (await getUserByEmail(cleanEmail)) || (await getUserByUsername(cleanEmail));
    if (!user) {
      const match = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanEmail
      );
      if (match) {
        user = match as any;
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address. Please sign up first.' },
        { status: 404 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, error: 'This account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP for signin
    const otpResult = await createOtpForEmail(cleanEmail, 'signin');
    if (!otpResult.success || !otpResult.otp) {
      return NextResponse.json(
        { success: false, error: otpResult.error || 'Failed to generate verification code.' },
        { status: 429 }
      );
    }

    // Send OTP via Brevo
    const emailResult = await sendOtpEmail({
      to: cleanEmail,
      name: user.name || 'Reader',
      otp: otpResult.otp,
      purpose: 'signin',
    });

    if (!emailResult.success) {
      console.error('[Sign-In OTP Dispatch Error]:', emailResult.error);
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email: cleanEmail,
      message: 'A 6-digit verification code has been sent to your email.',
    });
  } catch (error: any) {
    console.error('[Sign-In OTP Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process sign in request.' },
      { status: 500 }
    );
  }
}
