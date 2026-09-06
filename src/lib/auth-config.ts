/**
 * Registration & Sign-In email verification toggle.
 *
 * EMAIL_VERIFICATION_ENABLED:
 * Set to `true` to enforce 6-digit OTP verification via Brevo.
 * Set to `false` to temporarily pause OTP email verification.
 */
export const EMAIL_VERIFICATION_ENABLED: boolean = true;

/**
 * Helper to check whether email OTP verification is currently active.
 */
export function isEmailVerificationEnabled(): boolean {
  return EMAIL_VERIFICATION_ENABLED;
}
