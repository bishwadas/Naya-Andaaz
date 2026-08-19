import { NextRequest, NextResponse } from 'next/server';
import { getUserByVerificationToken, verifyUserEmail } from '@/db/repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || req.nextUrl.searchParams.get('token');

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    const user = await getUserByVerificationToken(cleanToken);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'This verification link is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'This verification link has expired. Please request a new verification email.',
          expired: true,
        },
        { status: 400 }
      );
    }

    // Mark as verified & invalidate token
    await verifyUserEmail(user.id);

    return NextResponse.json({
      success: true,
      message: 'Your email address has been verified successfully. You can now sign in.',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
