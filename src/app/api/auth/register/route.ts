import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/db/repository';
import { hashPassword, createSessionToken, setSessionCookie, sanitizeUser } from '@/lib/auth';
import { createOtpForEmail } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import { isEmailVerificationEnabled } from '@/lib/auth-config';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const emailVerificationEnabled = isEmailVerificationEnabled();
    const body = await req.json().catch(() => ({}));
    const { name, email, password, confirmPassword } = body;

    // 1. Required fields check
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // 2. Email format validation
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // 3. Password minimum length validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // 4. Password confirmation match validation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // 5. Prevent duplicate email registration or handle unverified duplicate
    let existingUser = null;
    try {
      existingUser = await getUserByEmail(cleanEmail);
    } catch (checkErr: any) {
      console.error('Database connection/query failure checking existing user:', checkErr);
      return NextResponse.json(
        { success: false, error: `Database connection failure checking existing user: ${checkErr.message || checkErr}` },
        { status: 500 }
      );
    }

    if (existingUser) {
      if (existingUser.emailVerified === false) {
        // Safe to clean up the unverified user record to allow retry/re-registration
        try {
          await db.delete(users).where(eq(users.id, existingUser.id));
        } catch (cleanupErr: any) {
          console.warn(`Could not clean up unverified user ${existingUser.id}:`, cleanupErr);
          return NextResponse.json(
            { success: false, error: `Unverified user cleanup failure: ${cleanupErr.message || cleanupErr}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'An account with this email address already exists' },
          { status: 400 }
        );
      }
    }

    // 6. Securely hash password
    let passwordHash;
    try {
      passwordHash = await hashPassword(password);
    } catch (hashErr: any) {
      console.error('Password hashing failure:', hashErr);
      return NextResponse.json(
        { success: false, error: `Password hashing failure: ${hashErr.message || hashErr}` },
        { status: 500 }
      );
    }

    // 7. Generate safe username
    const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9._]/g, '');
    const username = `${baseUsername || 'user'}_${Math.floor(1000 + Math.random() * 9000)}`;

    // 8. Create the user.
    // When verification is disabled: mark emailVerified = true immediately.
    // When verification is enabled: mark emailVerified = false until OTP confirmed.
    let newUser;
    try {
      newUser = await createUser({
        name: name.trim(),
        username,
        email: cleanEmail,
        passwordHash,
        role: 'subscriber',
        isActive: true,
        emailVerified: !emailVerificationEnabled,
      });
    } catch (createErr: any) {
      console.error('User creation failure:', createErr);
      return NextResponse.json(
        { success: false, error: `User creation failure: ${createErr.message || createErr}` },
        { status: 500 }
      );
    }

    if (emailVerificationEnabled) {
      // 9. Generate and send 6-digit OTP only when verification is enabled.
      const otpResult = await createOtpForEmail(cleanEmail, 'signup');
      if (!otpResult.success || !otpResult.otp) {
        return NextResponse.json(
          { success: false, error: otpResult.error || 'OTP generation/storage failure.' },
          { status: 500 }
        );
      }

      // 10. Send verification email via Brevo.
      const emailResult = await sendOtpEmail({
        to: cleanEmail,
        name: name.trim(),
        otp: otpResult.otp,
        purpose: 'signup',
      });

      if (!emailResult.success) {
        return NextResponse.json(
          { success: false, error: emailResult.error || 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'OTP sent successfully. Please check your inbox for the 6-digit code.',
          userId: newUser.id,
          email: cleanEmail,
          requiresVerification: true,
        },
        { status: 201 }
      );
    }

    // When verification is bypassed/disabled:
    // Create authenticated session and set HTTP-only cookie immediately
    const token = await createSessionToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created and verified successfully.',
        user: sanitizeUser(newUser),
        userId: newUser.id,
        email: cleanEmail,
        requiresVerification: false,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error (general catch):', error);
    return NextResponse.json(
      { success: false, error: `Registration failure: ${error?.message || error || 'Unknown server error.'}` },
      { status: 500 }
    );
  }
}
