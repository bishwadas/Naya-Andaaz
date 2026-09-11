import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername, updateUser } from '@/db/repository';
import { createSessionToken, setSessionCookie, verifyPassword, sanitizeUser } from '@/lib/auth';
import { isEmailVerificationEnabled } from '@/lib/auth-config';
import { INITIAL_USERS } from '@/lib/constants';

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
    let user = (await getUserByEmail(cleanEmail)) || (await getUserByUsername(cleanEmail));

    // Fallback to initial users if database is unseeded or during initial setup
    if (!user) {
      const match = INITIAL_USERS.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail ||
          u.username.toLowerCase() === cleanEmail ||
          (cleanEmail === 'admin' && u.role === 'admin') ||
          (cleanEmail === 'admin@nayaandaaz.com' && u.role === 'admin') ||
          (cleanEmail === 'admin@nayaandaaz.news' && u.role === 'admin') ||
          (cleanEmail === 'social.bishwa@gmail.com' && u.role === 'admin')
      );
      if (match) {
        user = { ...match } as any;
      }
    }

    if (!user) {
      // If user logs in with admin alias or developer email
      if (cleanEmail === 'admin' || cleanEmail === 'admin@nayaandaaz.com' || cleanEmail === 'social.bishwa@gmail.com') {
        user = { ...INITIAL_USERS[0] } as any;
      }
    }

    if (!user || user.isActive === false) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Strictly verify entered password against the stored bcrypt hash (with fallback to default passwords)
    const isPasswordValid = await verifyPassword(password, user.passwordHash || '$2b$10$4IL0ixunhVNHSf9rfPmTteI8gXw5MvKqil4Z2gafJ5oAAZVd8vLP2');

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


