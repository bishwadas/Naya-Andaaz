import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, updateUser } from '@/db/repository';
import { createSessionToken, setSessionCookie, sanitizeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { credential, accessToken, code, redirectUri: clientRedirectUri } = body;

    if (!credential && !accessToken && !code) {
      return NextResponse.json(
        { error: 'Missing Google credential, authorization code, or access token' },
        { status: 400 }
      );
    }

    let email = '';
    let name = '';
    let picture = '';

    if (credential) {
      // Verify Google ID Token via Google's tokeninfo API
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      const tokenInfo = await verifyRes.json();

      if (!verifyRes.ok || !tokenInfo.email) {
        return NextResponse.json(
          { error: tokenInfo.error_description || 'Invalid Google ID token' },
          { status: 401 }
        );
      }

      email = tokenInfo.email;
      name = tokenInfo.name || tokenInfo.email.split('@')[0];
      picture = tokenInfo.picture || '';
    } else if (code) {
      // Exchange authorization code for token
      const clientId =
        process.env.GOOGLE_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.json(
          { error: 'Google OAuth is not fully configured (missing Client ID or Client Secret)' },
          { status: 500 }
        );
      }

      const redirectUri = clientRedirectUri || 'postmessage';

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
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

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || (!tokenData.id_token && !tokenData.access_token)) {
        return NextResponse.json(
          { error: tokenData.error_description || tokenData.error || 'Failed to exchange Google authorization code' },
          { status: 401 }
        );
      }

      if (tokenData.id_token) {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`
        );
        const tokenInfo = await verifyRes.json();
        if (verifyRes.ok && tokenInfo.email) {
          email = tokenInfo.email;
          name = tokenInfo.name || tokenInfo.email.split('@')[0];
          picture = tokenInfo.picture || '';
        }
      }

      if (!email && tokenData.access_token) {
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userinfo = await userinfoRes.json();
        if (userinfoRes.ok && userinfo.email) {
          email = userinfo.email;
          name = userinfo.name || userinfo.email.split('@')[0];
          picture = userinfo.picture || '';
        }
      }
    } else if (accessToken) {
      // Fetch user profile using access token
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userinfo = await userinfoRes.json();

      if (!userinfoRes.ok || !userinfo.email) {
        return NextResponse.json(
          { error: 'Failed to retrieve user profile from Google' },
          { status: 401 }
        );
      }

      email = userinfo.email;
      name = userinfo.name || userinfo.email.split('@')[0];
      picture = userinfo.picture || '';
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Could not retrieve verified email from Google account' },
        { status: 401 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let user: any = await getUserByEmail(cleanEmail);

    if (user) {
      if (user.isActive === false) {
        return NextResponse.json(
          { error: 'This account is inactive. Please contact the administrator.' },
          { status: 403 }
        );
      }

      const updates: any = {};
      if (!user.emailVerified) updates.emailVerified = true;
      if (!user.avatar && picture) updates.avatar = picture;
      if (Object.keys(updates).length > 0) {
        try {
          await updateUser(user.id, updates);
          user = { ...user, ...updates };
        } catch (e) {
          console.warn('User update error on Google token login:', e);
        }
      }
    } else {
      const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '') || `user_${Date.now()}`;
      user = await createUser({
        name: name || cleanEmail.split('@')[0],
        username,
        email: cleanEmail,
        avatar: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        role: 'SUBSCRIBER',
        isActive: true,
        emailVerified: true,
      });
    }

    // Generate JWT Session Token
    const sessionToken = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error('Google verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authenticate with Google' },
      { status: 500 }
    );
  }
}
