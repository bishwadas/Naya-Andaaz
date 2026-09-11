/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Handles email delivery for OTP verification, password resets, and account activations.
 */

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

const getBrevoConfig = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL ||
    process.env.BREVO_FROM_EMAIL ||
    'hello@nayaandaaz.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Naya Andaaz';

  const isConfigured = Boolean(apiKey && apiKey.trim() && apiKey !== 'xkeysib-xxxxxxxx');

  return {
    apiKey: apiKey?.trim() || '',
    senderEmail: senderEmail.trim(),
    senderName: senderName.trim(),
    isConfigured,
  };
};

interface SendEmailParams {
  to: string;
  name?: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Low-level Brevo REST API dispatcher
 * Endpoint: POST https://api.brevo.com/v3/smtp/email
 */
async function sendBrevoEmail({
  to,
  name,
  subject,
  html,
  text,
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const { apiKey, senderEmail, senderName, isConfigured } = getBrevoConfig();

  // If no Brevo API key is configured, log to console in development mode
  if (!isConfigured) {
    console.log('\n======================================================');
    console.log('[BREVO EMAIL DEV MODE] BREVO_API_KEY not configured.');
    console.log(`[EMAIL DISPATCH] To: ${to} (${name || 'Reader'})`);
    console.log(`[SUBJECT] ${subject}`);
    console.log(`[PREVIEW TEXT] ${text.slice(0, 150)}...`);
    console.log('======================================================\n');
    return { success: true, id: `dev_mock_${Date.now()}` };
  }

  try {
    const payload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: to.trim().toLowerCase(),
          name: name?.trim() || 'Reader',
        },
      ],
      subject,
      htmlContent: html,
      textContent: text,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const rawErrorMsg =
        responseData?.message ||
        responseData?.error ||
        `HTTP ${response.status}: ${response.statusText}`;
      
      console.error('[Brevo API Error Detail]:', {
        status: response.status,
        statusText: response.statusText,
        rawMessage: rawErrorMsg,
        responseData,
      });

      // Detect IP authorization / whitelist issues on Brevo API key
      const isIpRestrictionError =
        typeof rawErrorMsg === 'string' &&
        (rawErrorMsg.toLowerCase().includes('unrecognised ip') ||
          rawErrorMsg.toLowerCase().includes('unrecognized ip') ||
          rawErrorMsg.toLowerCase().includes('ip address'));

      if (isIpRestrictionError) {
        console.error(
          '\n⚠️ [BREVO CONFIGURATION NOTICE]: Brevo rejected the email request due to "Authorized IP addresses" restrictions on your API key.\n' +
          'In serverless/cloud container environments (e.g. Vercel, Cloud Run, AWS), outbound IP addresses are dynamic and change across instances.\n' +
          'To resolve this in Brevo:\n' +
          '1. Go to your Brevo Dashboard -> SMTP & API Keys -> API Keys (or Settings -> Security -> Authorized IP Addresses).\n' +
          '2. Edit or regenerate the API Key and leave "Authorized IP addresses" EMPTY (unrestricted) so serverless containers can connect securely.\n' +
          '3. Ensure your BREVO_API_KEY is stored securely in your server environment variables.\n'
        );
      }

      // Return a clean, user-friendly error message without exposing internal IPs or vendor URLs
      const userSafeMessage = isIpRestrictionError
        ? 'Email service is temporarily unavailable due to email security settings. Please try again shortly or contact support.'
        : 'Unable to deliver verification email at this moment. Please try again in a few moments.';

      return {
        success: false,
        error: userSafeMessage,
      };
    }

    return {
      success: true,
      id: responseData?.messageId || `brevo_${Date.now()}`,
    };
  } catch (err: any) {
    console.error('[Brevo API Network/Exception]:', err);
    return {
      success: false,
      error: 'Unable to connect to email delivery service. Please try again shortly.',
    };
  }
}

interface OtpEmailOptions {
  to: string;
  name?: string;
  otp: string;
  purpose: 'signup' | 'signin' | 'reset_password';
}

/**
 * Send 6-digit OTP verification code via Brevo
 */
export async function sendOtpEmail({
  to,
  name,
  otp,
  purpose,
}: OtpEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const brandName = 'Naya Andaaz';
  let subject = `Your 6-Digit Verification Code — ${brandName}`;
  let title = 'Verify Your Email Address';
  let description = `Thank you for registering with ${brandName}. Use the 6-digit verification code below to activate your account:`;

  if (purpose === 'signin') {
    subject = `Your 6-Digit Sign-In Code — ${brandName}`;
    title = 'Sign In to Your Account';
    description = `Use the 6-digit sign-in code below to securely access your ${brandName} account:`;
  } else if (purpose === 'reset_password') {
    subject = `Your 6-Digit Password Reset Code — ${brandName}`;
    title = 'Reset Your Password';
    description = `We received a request to reset your password for your ${brandName} account. Use the 6-digit code below to proceed:`;
  }

  // Format OTP with middle space for visual legibility: "123 456"
  const formattedOtp = otp.length === 6 ? `${otp.slice(0, 3)} ${otp.slice(3)}` : otp;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfbf9; color: #1c1917; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border: 1px solid #f2e8e5; border-radius: 16px; padding: 36px 28px; box-shadow: 0 4px 20px rgba(236, 0, 140, 0.06); }
    .header { text-align: center; margin-bottom: 24px; }
    .brand { font-family: Georgia, serif; font-size: 26px; font-weight: 800; color: #EC008C; letter-spacing: 1px; }
    .subtitle { color: #881337; font-size: 11px; margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin-top: 0; margin-bottom: 14px; text-align: center; }
    p { font-size: 14.5px; line-height: 1.6; color: #44403c; margin: 14px 0; }
    .otp-container { text-align: center; margin: 28px 0; }
    .otp-code { display: inline-block; background-color: #fff1f2; border: 2px solid #EC008C; color: #BE123C; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(236,0,140,0.12); }
    .callout { background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 14px 16px; margin: 24px 0; font-size: 12.5px; color: #831843; line-height: 1.5; }
    .footer { text-align: center; margin-top: 28px; font-size: 11.5px; color: #a8a29e; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">Naya Andaaz</div>
        <div class="subtitle">Lifestyle &bull; Entertainment &bull; Fashion &bull; Wellness</div>
      </div>
      <h1>${title}</h1>
      <p>Hello <strong>${name || 'Reader'}</strong>,</p>
      <p>${description}</p>
      
      <div class="otp-container">
        <div class="otp-code">${formattedOtp}</div>
      </div>

      <div class="callout">
        <strong>Security Notice:</strong> This code is valid for <strong>10 minutes</strong> and can only be used once. Never share this code with anyone. If you did not request this, you can safely ignore this email.
      </div>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Naya Andaaz. All rights reserved.</p>
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

— The ${brandName} Editorial Team
  `.trim();

  return sendBrevoEmail({
    to,
    name,
    subject,
    html,
    text,
  });
}

interface VerificationEmailOptions {
  to: string;
  name: string;
  token: string;
  verifyUrl?: string;
}

/**
 * Send account email verification link via Brevo
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
  verifyUrl,
}: VerificationEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const baseUrl = getBaseUrl();
  const url = verifyUrl || `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const brandName = 'Naya Andaaz';
  const subject = `Verify your email address — ${brandName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfbf9; color: #1c1917; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border: 1px solid #f2e8e5; border-radius: 16px; padding: 36px 28px; box-shadow: 0 4px 20px rgba(236, 0, 140, 0.06); }
    .header { text-align: center; margin-bottom: 24px; }
    .brand { font-family: Georgia, serif; font-size: 26px; font-weight: 800; color: #EC008C; letter-spacing: 1px; }
    .subtitle { color: #881337; font-size: 11px; margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin-top: 0; margin-bottom: 14px; text-align: center; }
    p { font-size: 14.5px; line-height: 1.6; color: #44403c; margin: 14px 0; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #EC008C; color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(236,0,140,0.25); }
    .callout { background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 14px 16px; margin: 24px 0; font-size: 12.5px; color: #831843; }
    .url-box { word-break: break-all; color: #EC008C; font-size: 12px; font-family: monospace; }
    .footer { text-align: center; margin-top: 28px; font-size: 11.5px; color: #a8a29e; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">Naya Andaaz</div>
        <div class="subtitle">Lifestyle &bull; Entertainment &bull; Fashion &bull; Wellness</div>
      </div>
      <h1>Verify your email address</h1>
      <p>Hello <strong>${name || 'Reader'}</strong>,</p>
      <p>Thank you for creating an account with ${brandName}. To complete your registration and activate your account, please confirm your email address by clicking the button below:</p>
      
      <div class="btn-container">
        <a href="${url}" class="btn" target="_blank">Verify Email Address</a>
      </div>

      <div class="callout">
        <strong>Note:</strong> This verification link will expire in <strong>24 hours</strong>. If you did not create an account, please disregard this email.
      </div>

      <p style="font-size: 12.5px; color: #78716c;">If the button above does not work, copy and paste this link into your browser:</p>
      <p class="url-box"><a href="${url}" style="color: #EC008C; text-decoration: underline;">${url}</a></p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Naya Andaaz. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${name || 'Reader'},

Welcome to ${brandName}. Please verify your email address to complete your registration:

${url}

This link is valid for 24 hours.

— The ${brandName} Editorial Team
  `.trim();

  return sendBrevoEmail({
    to,
    name,
    subject,
    html,
    text,
  });
}

interface PasswordResetEmailOptions {
  to: string;
  name: string;
  token: string;
  resetUrl?: string;
}

/**
 * Send password reset link via Brevo
 */
export async function sendPasswordResetEmail({
  to,
  name,
  token,
  resetUrl,
}: PasswordResetEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const baseUrl = getBaseUrl();
  const url = resetUrl || `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const brandName = 'Naya Andaaz';
  const subject = `Reset your password — ${brandName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfbf9; color: #1c1917; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border: 1px solid #f2e8e5; border-radius: 16px; padding: 36px 28px; box-shadow: 0 4px 20px rgba(236, 0, 140, 0.06); }
    .header { text-align: center; margin-bottom: 24px; }
    .brand { font-family: Georgia, serif; font-size: 26px; font-weight: 800; color: #EC008C; letter-spacing: 1px; }
    .subtitle { color: #881337; font-size: 11px; margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin-top: 0; margin-bottom: 14px; text-align: center; }
    p { font-size: 14.5px; line-height: 1.6; color: #44403c; margin: 14px 0; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #EC008C; color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(236,0,140,0.25); }
    .warning { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin: 24px 0; font-size: 12.5px; color: #92400e; }
    .url-box { word-break: break-all; color: #EC008C; font-size: 12px; font-family: monospace; }
    .footer { text-align: center; margin-top: 28px; font-size: 11.5px; color: #a8a29e; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">Naya Andaaz</div>
        <div class="subtitle">Lifestyle &bull; Entertainment &bull; Fashion &bull; Wellness</div>
      </div>
      <h1>Reset your password</h1>
      <p>Hello <strong>${name || 'Reader'}</strong>,</p>
      <p>We received a request to reset the password for your ${brandName} account. Click the button below to establish a new password:</p>
      
      <div class="btn-container">
        <a href="${url}" class="btn" target="_blank">Reset Password</a>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This password reset link will expire in <strong>1 hour</strong> and can only be used once. If you did not make this request, you can safely ignore this email; your current password remains secure.
      </div>

      <p style="font-size: 12.5px; color: #78716c;">If the button above does not work, copy and paste this link into your browser:</p>
      <p class="url-box"><a href="${url}" style="color: #EC008C; text-decoration: underline;">${url}</a></p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Naya Andaaz. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${name || 'Reader'},

We received a request to reset your password on ${brandName}. Use the link below to set a new password:

${url}

This link is valid for 1 hour. If you did not request this, you can safely ignore this email.

— The ${brandName} Editorial Team
  `.trim();

  return sendBrevoEmail({
    to,
    name,
    subject,
    html,
    text,
  });
}
