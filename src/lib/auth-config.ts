/**
 * Registration email verification is enabled by default for safety.
 * Set EMAIL_VERIFICATION_ENABLED=false for local development when a custom
 * sending domain is not available. Verification routes remain available so
 * the feature can be enabled again without a code change.
 */
export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED !== 'false';
}