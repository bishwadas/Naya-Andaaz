import crypto from 'crypto';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '@/db';
import { otps } from '@/db/schema';

export type OtpPurpose = 'signup' | 'reset_password';

export interface CreateOtpResult {
  success: boolean;
  otp?: string;
  error?: string;
  cooldownRemaining?: number;
  expiresAt?: Date;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
  expired?: boolean;
  maxAttemptsReached?: boolean;
  remainingAttempts?: number;
}

/**
 * Hash a 6-digit OTP string using SHA-256 for secure storage
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP code (e.g., '384912')
 */
export function generateOtpCode(): string {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString().padStart(6, '0');
}

/**
 * Generate and store a new 6-digit OTP in PostgreSQL with 10-min expiration and 60s cooldown enforcement.
 * Previous active OTPs for the same email + purpose are invalidated.
 */
export async function createOtpForEmail(
  email: string,
  purpose: OtpPurpose,
  expiryMinutes: number = 10
): Promise<CreateOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date();

  try {
    // 1. Cooldown check: 60 seconds from last created OTP
    let latestOtp = null;
    try {
      const latestOtpRows = await db
        .select()
        .from(otps)
        .where(
          and(
            eq(sql`lower(${otps.email})`, cleanEmail),
            eq(otps.purpose, purpose)
          )
        )
        .orderBy(desc(otps.createdAt))
        .limit(1);
      latestOtp = latestOtpRows[0] || null;
    } catch (queryErr: any) {
      console.error('Error during OTP cooldown query:', queryErr);
      return {
        success: false,
        error: `Database connection or query failure: ${queryErr.message || queryErr}`,
      };
    }

    if (latestOtp) {
      const timeSinceLastMs = now.getTime() - new Date(latestOtp.createdAt).getTime();
      const cooldownMs = 60 * 1000;
      if (timeSinceLastMs < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastMs) / 1000);
        return {
          success: false,
          error: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
          cooldownRemaining: remainingSeconds,
        };
      }
    }

    // 2. Invalidate previous active OTPs for this email and purpose
    try {
      await db
        .update(otps)
        .set({ isUsed: true, updatedAt: now })
        .where(
          and(
            eq(sql`lower(${otps.email})`, cleanEmail),
            eq(otps.purpose, purpose),
            eq(otps.isUsed, false)
          )
        );
    } catch (invalidateErr: any) {
      console.error('Error invalidating previous OTPs:', invalidateErr);
      return {
        success: false,
        error: `Failed to invalidate previous active verification codes: ${invalidateErr.message || invalidateErr}`,
      };
    }

    // 3. Generate raw 6-digit code and hash it
    let rawOtp: string;
    try {
      rawOtp = generateOtpCode();
      if (!rawOtp || rawOtp.length !== 6) {
        throw new Error('Generated OTP code was empty or invalid length.');
      }
    } catch (genErr: any) {
      console.error('Error generating secure 6-digit OTP code:', genErr);
      return {
        success: false,
        error: `Secure OTP generation failed: ${genErr.message || genErr}`,
      };
    }

    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);
    const id = `otp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // 4. Insert OTP record
    try {
      await db.insert(otps).values({
        id,
        email: cleanEmail,
        otpHash,
        purpose,
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
        isUsed: false,
        createdAt: now,
        updatedAt: now,
      });
    } catch (insertErr: any) {
      console.error('Error inserting OTP record into database:', insertErr);
      return {
        success: false,
        error: `Failed to store verification code record in database: ${insertErr.message || insertErr}`,
      };
    }

    return {
      success: true,
      otp: rawOtp, // Only for server-side email dispatching!
      expiresAt,
    };
  } catch (error: any) {
    console.error('Error creating OTP record (general catch):', error);
    return {
      success: false,
      error: `Failed to generate verification code: ${error?.message || error || 'Unknown error'}.`,
    };
  }
}

/**
 * Verify a submitted 6-digit OTP code against the latest active OTP record in PostgreSQL.
 */
export async function verifyOtpCode(
  email: string,
  inputOtp: string,
  purpose: OtpPurpose
): Promise<VerifyOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = inputOtp.trim();
  const now = new Date();

  if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return {
      success: false,
      error: 'Please enter a valid 6-digit numeric verification code.',
    };
  }

  try {
    // 1. Fetch latest active OTP record for this email and purpose
    let activeOtp = null;
    try {
      const activeOtpRows = await db
        .select()
        .from(otps)
        .where(
          and(
            eq(sql`lower(${otps.email})`, cleanEmail),
            eq(otps.purpose, purpose),
            eq(otps.isUsed, false)
          )
        )
        .orderBy(desc(otps.createdAt))
        .limit(1);
      activeOtp = activeOtpRows[0] || null;
    } catch (queryErr: any) {
      console.error('Error fetching active OTP record:', queryErr);
      return {
        success: false,
        error: `Database query failure during verification: ${queryErr.message || queryErr}`,
      };
    }

    if (!activeOtp) {
      return {
        success: false,
        error: 'No active verification code found or code was already used. Please request a new code.',
      };
    }

    // 2. Expiration check
    if (new Date(activeOtp.expiresAt).getTime() < now.getTime()) {
      try {
        await db.update(otps).set({ isUsed: true, updatedAt: now }).where(eq(otps.id, activeOtp.id));
      } catch (e) {
        console.error('Error setting used status on expired OTP:', e);
      }
      return {
        success: false,
        error: 'This verification code has expired. Please request a new code.',
        expired: true,
      };
    }

    // 3. Max attempts check
    if (activeOtp.attempts >= activeOtp.maxAttempts) {
      try {
        await db.update(otps).set({ isUsed: true, updatedAt: now }).where(eq(otps.id, activeOtp.id));
      } catch (e) {
        console.error('Error setting used status on max-attempts OTP:', e);
      }
      return {
        success: false,
        error: 'Too many incorrect attempts. This verification code has been invalidated. Please request a new code.',
        maxAttemptsReached: true,
      };
    }

    // 4. Hash comparison
    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== activeOtp.otpHash) {
      const newAttempts = activeOtp.attempts + 1;
      const isNowInvalid = newAttempts >= activeOtp.maxAttempts;

      try {
        await db
          .update(otps)
          .set({
            attempts: newAttempts,
            isUsed: isNowInvalid,
            updatedAt: now,
          })
          .where(eq(otps.id, activeOtp.id));
      } catch (updateAttemptsErr: any) {
        console.error('Error updating attempts count:', updateAttemptsErr);
      }

      if (isNowInvalid) {
        return {
          success: false,
          error: 'Too many incorrect attempts. This verification code has been invalidated. Please request a new code.',
          maxAttemptsReached: true,
        };
      }

      const remaining = activeOtp.maxAttempts - newAttempts;
      return {
        success: false,
        error: `Incorrect verification code. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        remainingAttempts: remaining,
      };
    }

    // 5. Successful match -> mark OTP as single-use (isUsed = true)
    try {
      await db.update(otps).set({ isUsed: true, updatedAt: now }).where(eq(otps.id, activeOtp.id));
    } catch (useErr: any) {
      console.error('Error marking OTP as used:', useErr);
      return {
        success: false,
        error: `Verification succeeded but database update failed: ${useErr.message || useErr}`,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error verifying OTP code:', error);
    return {
      success: false,
      error: `Failed to verify code: ${error?.message || error || 'Unknown error'}.`,
    };
  }
}
