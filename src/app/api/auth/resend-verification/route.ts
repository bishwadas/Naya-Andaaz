import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, setUserVerificationToken } from '@/db/repository';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

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
    const user = await getUserByEmail(cleanEmail);

    if (user && !user.emailVerified) {
      const newToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await setUserVerificationToken(user.id, newToken, expires);

      await sendVerificationEmail({
        to: cleanEmail,
        name: user.name,
        token: newToken,
      });
    }

    // Always respond with generic message to prevent account enumeration
    return NextResponse.json({
      success: true,
      message:
        'If an unverified account exists with this email address, a new verification link has been sent.',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process verification request.' },
      { status: 500 }
    );
  }
}
