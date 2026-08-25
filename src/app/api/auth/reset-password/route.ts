import { NextRequest, NextResponse } from 'next/server';
import { getUserByResetToken, resetUserPassword } from '@/db/repository';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, password, confirmPassword } = body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    const user = await getUserByResetToken(cleanToken);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'This password reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (user.passwordResetTokenExpires && new Date(user.passwordResetTokenExpires) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'This password reset link has expired. Please request a new one.',
          expired: true,
        },
        { status: 400 }
      );
    }

    // Hash new password and update user record (clearing reset token)
    const newPasswordHash = await hashPassword(password);
    await resetUserPassword(user.id, newPasswordHash);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
