import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, updateUser } from '@/db/repository';
import { createSessionToken, setSessionCookie, sanitizeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function renderCallbackHtml(success: boolean, message: string, user: any = null, redirectUrl: string = '/') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Status</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background-color: #fafaf9;
      color: #1c1917;
    }
    .card {
      background: white;
      border: 1px solid #e7e5e4;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      max-width: 360px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .icon-success { background: #dcfce7; color: #15803d; }
    .icon-error { background: #fee2e2; color: #b91c1c; }
    .title { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
    .text { font-size: 14px; color: #78716c; margin: 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon ${success ? 'icon-success' : 'icon-error'}">
      ${success ? '✓' : '✕'}
    </div>
    <h2 class="title">${success ? 'Signed in successfully' : 'Authentication failed'}</h2>
    <p class="text">${message}</p>
  </div>
  <script>
    (function() {
      const payload = {
        type: ${JSON.stringify(success ? 'OAUTH_AUTH_SUCCESS' : 'OAUTH_AUTH_ERROR')},
        success: ${success},
        message: ${JSON.stringify(message)},
        user: ${JSON.stringify(user)},
        redirectUrl: ${JSON.stringify(redirectUrl)}
      };

      try {
        if (window.opener) {
          window.opener.postMessage(payload, '*');
          setTimeout(function() { window.close(); }, 600);
        } else {
          setTimeout(function() { window.location.href = ${JSON.stringify(redirectUrl)}; }, 1000);
        }
      } catch (err) {
        window.location.href = ${JSON.stringify(redirectUrl)};
      }
    })();
  </script>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const stateParam = searchParams.get('state');

  let redirectUrl = '/';
  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8'));
      if (decoded.redirect) redirectUrl = decoded.redirect;
    } catch {
      redirectUrl = '/';
    }
  }

  if (errorParam) {
    const errorDescription = searchParams.get('error_description') || errorParam;
    return new NextResponse(
      renderCallbackHtml(false, `Google authentication was cancelled or failed: ${errorDescription}`, null, redirectUrl),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  if (!code) {
    return new NextResponse(
      renderCallbackHtml(false, 'Missing authorization code from Google.', null, redirectUrl),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      renderCallbackHtml(false, 'Google OAuth is not fully configured (missing Client ID or Client Secret).', null, redirectUrl),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Determine current origin for matching redirect_uri
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      const errMsg = tokenData.error_description || tokenData.error || 'Failed to exchange authorization code';
      return new NextResponse(
        renderCallbackHtml(false, `Google token error: ${errMsg}`, null, redirectUrl),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // 2. Retrieve user info from Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userinfo = await userinfoResponse.json();

    if (!userinfoResponse.ok || !userinfo.email) {
      return new NextResponse(
        renderCallbackHtml(false, 'Failed to fetch user profile information from Google.', null, redirectUrl),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const cleanEmail = userinfo.email.toLowerCase().trim();
    let user: any = await getUserByEmail(cleanEmail);

    if (user) {
      if (user.isActive === false) {
        return new NextResponse(
          renderCallbackHtml(false, 'This account is inactive or disabled. Please contact the administrator.', null, redirectUrl),
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      // Update avatar or emailVerified if needed
      const updates: any = {};
      if (!user.emailVerified) updates.emailVerified = true;
      if (!user.avatar && userinfo.picture) updates.avatar = userinfo.picture;
      if (Object.keys(updates).length > 0) {
        try {
          await updateUser(user.id, updates);
          user = { ...user, ...updates };
        } catch (updateErr) {
          console.warn('Non-fatal user update error on Google login:', updateErr);
        }
      }
    } else {
      // 3. Create new user account for first-time Google sign-in
      const name = userinfo.name || cleanEmail.split('@')[0] || 'Subscriber';
      const avatar = userinfo.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`;
      const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '') || `user_${Date.now()}`;

      user = await createUser({
        name,
        username,
        email: cleanEmail,
        avatar,
        role: 'SUBSCRIBER',
        isActive: true,
        emailVerified: true,
      });
    }

    // 4. Create and set session JWT token in HTTP-only cookie
    const sessionToken = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    await setSessionCookie(sessionToken);

    const safeUser = sanitizeUser(user);

    // Compute appropriate redirect based on role if no explicit redirect specified
    let finalRedirect = redirectUrl;
    if (finalRedirect === '/' || finalRedirect === '/sign-in') {
      const roleUpper = String(user.role).toUpperCase();
      if (roleUpper === 'ADMIN' || roleUpper === 'SUPERADMIN') {
        finalRedirect = '/admin/dashboard';
      } else if (roleUpper === 'EDITOR') {
        finalRedirect = '/editor';
      } else if (roleUpper === 'AUTHOR') {
        finalRedirect = '/author';
      } else {
        finalRedirect = '/';
      }
    }

    return new NextResponse(
      renderCallbackHtml(true, 'Google authentication successful. Redirecting...', safeUser, finalRedirect),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return new NextResponse(
      renderCallbackHtml(false, error.message || 'An unexpected error occurred during Google sign-in.', null, redirectUrl),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
