import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/db/repository';
import { createOtpForEmail } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, purpose } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!purpose || (purpose !== 'signup' && purpose !== 'signin' && purpose !== 'reset_password')) {
      return NextResponse.json(
        { success: false, error: 'Invalid purpose parameter' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(cleanEmail);

    // If purpose is reset_password, we MUST return a generic success response even if user doesn't exist
    if (purpose === 'reset_password' && !user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, a new code has been sent.',
      });
    }

    // For signup/signin purpose, if no user exists, return an error
    if ((purpose === 'signup' || purpose === 'signin') && !user) {
      return NextResponse.json(
        { success: false, error: 'No account found for this email address. Please sign up first.' },
        { status: 404 }
      );
    }

    // Call createOtpForEmail (which enforces the 60s cooldown)
    const otpResult = await createOtpForEmail(cleanEmail, purpose);

    if (!otpResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: otpResult.error,
          cooldownRemaining: otpResult.cooldownRemaining,
        },
        { status: 429 } // Too many requests
      );
    }

    // Send email using our sendOtpEmail
    const emailResult = await sendOtpEmail({
      to: cleanEmail,
      name: user?.name || 'Reader',
      otp: otpResult.otp!,
      purpose,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to dispatch verification code. Please try again.' },
        { status: 500 }
      );
    }

    // Return different messages based on purpose
    if (purpose === 'reset_password') {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, a new code has been sent.',
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'A new 6-digit verification code has been sent to your email address.',
      });
    }
  } catch (error: any) {
    console.error('OTP delivery error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
