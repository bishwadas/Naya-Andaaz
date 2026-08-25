/**
 * Registration email verification toggle.
 *
 * EMAIL_VERIFICATION_ENABLED:
 * Set to `false` to temporarily pause Resend-based email verification during account registration
 * for development and testing.
 *
 * When `false`:
 * - Skip Resend completely during registration (no API calls made).
 * - Automatically mark newly created accounts as verified (emailVerified = true).
 * - Automatically establish an authenticated session cookie and log the user in immediately.
 * - Redirect directly to the normal home page.
 *
 * When set to `true`:
 * - Full verification workflow is restored.
 * - 6-digit OTP verification email is dispatched via Resend.
 * - User must confirm their email before account is fully activated.
 */
export const EMAIL_VERIFICATION_ENABLED: boolean = false;

export function isEmailVerificationEnabled(): boolean {
  if (process.env.EMAIL_VERIFICATION_ENABLED !== undefined) {
    return process.env.EMAIL_VERIFICATION_ENABLED === 'true';
  }
  return EMAIL_VERIFICATION_ENABLED;
}
