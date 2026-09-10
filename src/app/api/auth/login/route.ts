import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername, updateUser } from '@/db/repository';
import { createSessionToken, setSessionCookie, verifyPassword, sanitizeUser } from '@/lib/auth';
import { isEmailVerificationEnabled } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = (await getUserByEmail(cleanEmail)) || (await getUserByUsername(cleanEmail));

    if (!user || user.isActive === false || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Strictly verify entered password against the stored bcrypt hash
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check email verification status only when verification is active
    const emailVerificationEnabled = isEmailVerificationEnabled();
    if (emailVerificationEnabled && user.emailVerified === false && String(user.role).toLowerCase() === 'subscriber') {
      return NextResponse.json(
        {
          success: false,
          unverified: true,
          email: user.email,
          error: 'Please verify your email address before signing in. Check your inbox for the confirmation link.',
        },
        { status: 403 }
      );
    }

    // If verification is disabled and a legacy unverified account signs in, mark them verified
    if (!emailVerificationEnabled && user.emailVerified === false) {
      try {
        await updateUser(user.id, { emailVerified: true });
        user.emailVerified = true;
      } catch (e) {
        console.warn('Could not auto-verify legacy unverified user during login:', e);
      }
    }

    // Create session token signed with SESSION_SECRET
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set secure HTTP-only cookie
    await setSessionCookie(token);

    // Return sanitized user ONLY (never expose password fields)
    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
}


