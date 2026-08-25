import { Resend } from 'resend';

// Initialize Resend lazily / safely with server environment variable
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_xxxxxxxxx') {
    return null;
  }
  return new Resend(apiKey);
};

export const getBaseUrl = (): string => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Sereia Gazette <onboarding@resend.dev>';

interface VerificationEmailOptions {
  to: string;
  name: string;
  token: string;
  verifyUrl?: string;
}

interface PasswordResetEmailOptions {
  to: string;
  name: string;
  token: string;
  resetUrl?: string;
}

/**
 * Send account email verification link via Resend API
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
  verifyUrl,
}: VerificationEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const baseUrl = getBaseUrl();
  const url = verifyUrl || `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const resend = getResendClient();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email address</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0a09; color: #f5f5f4; }
    .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #1c1917; border: 1px solid #292524; border-radius: 12px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { font-family: Georgia, serif; font-size: 26px; font-weight: 800; color: #fbbf24; letter-spacing: 2px; text-transform: uppercase; }
    .subtitle { color: #a8a29e; font-size: 13px; margin-top: 4px; letter-spacing: 1px; }
    h1 { font-family: Georgia, serif; font-size: 22px; color: #fafaf9; margin-top: 0; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; color: #d6d3d1; margin: 16px 0; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #f59e0b; color: #0c0a09; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(245,158,11,0.25); }
    .btn:hover { background-color: #fbbf24; }
    .callout { background-color: #292524; border-radius: 8px; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #a8a29e; }
    .url-box { word-break: break-all; color: #fbbf24; font-size: 12px; font-family: monospace; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #78716c; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">SEREIA</div>
        <div class="subtitle">EDITORIAL GAZETTE & PUBLISHING</div>
      </div>
      <h1>Verify your email address</h1>
      <p>Hello <strong>${name || 'Reader'}</strong>,</p>
      <p>Thank you for creating an account with Sereia Gazette. To complete your registration and activate your account, please confirm your email address by clicking the button below:</p>
      
      <div class="btn-container">
        <a href="${url}" class="btn" target="_blank">Verify Email Address</a>
      </div>

      <div class="callout">
        <strong>Note:</strong> This verification link will expire in <strong>24 hours</strong>. If you did not create an account on Sereia, please disregard this email.
      </div>

      <p style="font-size: 13px; color: #a8a29e;">If the button above does not work, copy and paste this link into your browser:</p>
      <p class="url-box"><a href="${url}" style="color: #fbbf24; text-decoration: underline;">${url}</a></p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Sereia News Publishing. All rights reserved.<br />Independent Journalism, Cultural Essays & Global Discourse.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${name || 'Reader'},

Welcome to Sereia Gazette. Please verify your email address to complete your registration:

${url}

This link is valid for 24 hours. If you did not create an account, you can safely ignore this message.

— The Sereia Gazette Editorial Board
  `.trim();

  // If no Resend API key configured or demo key, log to console for development testing
  if (!resend) {
    console.log('\n======================================================');
    console.log('[DEV EMAIL SERVICE] Resend API key not configured or demo placeholder.');
    console.log(`[VERIFICATION EMAIL] To: ${to}`);
    console.log(`[VERIFICATION URL] ${url}`);
    console.log('======================================================\n');
    return { success: true, id: `mock_${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Verify your email address — Sereia Gazette',
      html,
      text,
    });

    if (error) {
      console.error('[Resend Error - Verification Email]:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Exception - Verification Email]:', err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}

/**
 * Send password reset link via Resend API
 */
interface OtpEmailOptions {
  to: string;
  name?: string;
  otp: string;
  purpose: 'signup' | 'reset_password';
}

/**
 * Send 6-digit OTP verification code via Resend API
 */
export async function sendOtpEmail({
  to,
  name,
  otp,
  purpose,
}: OtpEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();
  const isSignup = purpose === 'signup';
  const subject = isSignup
    ? 'Your 6-Digit Verification Code — Sereia Gazette'
    : 'Your 6-Digit Password Reset Code — Sereia Gazette';

  const title = isSignup ? 'Verify Your Email Address' : 'Reset Your Password';
  const description = isSignup
    ? 'Thank you for registering with Sereia Gazette. Use the 6-digit verification code below to activate your account:'
    : 'We received a request to reset your password for your Sereia Gazette account. Use the 6-digit code below to proceed with setting a new password:';

  // Format OTP with a middle space for visual legibility: "123 456"
  const formattedOtp = otp.length === 6 ? `${otp.slice(0, 3)} ${otp.slice(3)}` : otp;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0a09; color: #f5f5f4; }
    .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #1c1917; border: 1px solid #292524; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { font-family: Georgia, serif; font-size: 26px; font-weight: 800; color: #fbbf24; letter-spacing: 2px; text-transform: uppercase; }
    .subtitle { color: #a8a29e; font-size: 13px; margin-top: 4px; letter-spacing: 1px; }
    h1 { font-family: Georgia, serif; font-size: 22px; color: #fafaf9; margin-top: 0; margin-bottom: 16px; text-align: center; }
    p { font-size: 15px; line-height: 1.6; color: #d6d3d1; margin: 16px 0; }
    .otp-container { text-align: center; margin: 32px 0; }
    .otp-code { display: inline-block; background-color: #292524; border: 2px solid #f59e0b; color: #fbbf24; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; padding: 18px 36px; border-radius: 12px; box-shadow: 0 4px 20px rgba(245,158,11,0.2); }
    .callout { background-color: #292524; border-radius: 8px; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #a8a29e; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #78716c; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">SEREIA</div>
        <div class="subtitle">EDITORIAL GAZETTE & PUBLISHING</div>
      </div>
      <h1>${title}</h1>
      <p>Hello <strong>${name || 'Reader'}</strong>,</p>
      <p>${description}</p>
      
      <div class="otp-container">
        <div class="otp-code">${formattedOtp}</div>
      </div>

      <div class="callout">
        <strong>Security Notice:</strong> This code will expire in <strong>10 minutes</strong> and can only be used once. Never share this code with anyone. If you did not request this, you can safely ignore this email.
      </div>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Sereia News Publishing. All rights reserved.<br />Independent Journalism, Cultural Essays & Global Discourse.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${name || 'Reader'},

${description}

Your 6-digit verification code: ${otp}

This code is valid for 10 minutes and can only be used once. Never share this code with anyone.

— The Sereia Gazette Editorial Board
  `.trim();

  // If no Resend API key configured or demo key, log to console for development testing
  if (!resend) {
    console.log('\n======================================================');
    console.log('[DEV EMAIL SERVICE] Resend API key not configured or demo placeholder.');
    console.log(`[OTP EMAIL] To: ${to}`);
    console.log(`[OTP PURPOSE] ${purpose}`);
    console.log(`[OTP CODE] ${otp}`);
    console.log('======================================================\n');
    return { success: true, id: `mock_${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('[Resend Error - OTP Email]:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Exception - OTP Email]:', err);
    return { success: false, error: err.message || 'Failed to send OTP email' };
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  token,
  resetUrl,
}: PasswordResetEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const baseUrl = getBaseUrl();
  const url = resetUrl || `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const resend = getResendClient();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0a09; color: #f5f5f4; }
    .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #1c1917; border: 1px solid #292524; border-radius: 12px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { font-family: Georgia, serif; font-size: 26px; font-weight: 800; color: #fbbf24; letter-spacing: 2px; text-transform: uppercase; }
    .subtitle { color: #a8a29e; font-size: 13px; margin-top: 4px; letter-spacing: 1px; }
    h1 { font-family: Georgia, serif; font-size: 22px; color: #fafaf9; margin-top: 0; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; color: #d6d3d1; margin: 16px 0; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #f59e0b; color: #0c0a09; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(245,158,11,0.25); }
    .btn:hover { background-color: #fbbf24; }
    .warning { background-color: #451a03; border: 1px solid #78350f; border-radius: 8px; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #fde68a; }
    .url-box { word-break: break-all; color: #fbbf24; font-size: 12px; font-family: monospace; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #78716c; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">SEREIA</div>
        <div class="subtitle">EDITORIAL GAZETTE & PUBLISHING</div>
      </div>
      <h1>Reset your password</h1>
      <p>Hello <strong>${name || 'Reader'}</strong>,</p>
      <p>We received a request to reset the password for your Sereia account. Click the button below to establish a new password:</p>
      
      <div class="btn-container">
        <a href="${url}" class="btn" target="_blank">Reset Password</a>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This password reset link will expire in <strong>1 hour</strong> and can only be used once. If you did not make this request, you can safely ignore this email; your current password remains secure.
      </div>

      <p style="font-size: 13px; color: #a8a29e;">If the button above does not work, copy and paste this link into your browser:</p>
      <p class="url-box"><a href="${url}" style="color: #fbbf24; text-decoration: underline;">${url}</a></p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Sereia News Publishing. All rights reserved.<br />Independent Journalism, Cultural Essays & Global Discourse.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${name || 'Reader'},

We received a request to reset your password on Sereia Gazette. Use the link below to set a new password:

${url}

This link is valid for 1 hour. If you did not request this, you can safely ignore this email.

— The Sereia Gazette Editorial Board
  `.trim();

  // If no Resend API key configured or demo key, log to console for development testing
  if (!resend) {
    console.log('\n======================================================');
    console.log('[DEV EMAIL SERVICE] Resend API key not configured or demo placeholder.');
    console.log(`[PASSWORD RESET EMAIL] To: ${to}`);
    console.log(`[RESET PASSWORD URL] ${url}`);
    console.log('======================================================\n');
    return { success: true, id: `mock_${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your password — Sereia Gazette',
      html,
      text,
    });

    if (error) {
      console.error('[Resend Error - Reset Email]:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Exception - Reset Email]:', err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}
