import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.CLIENT_ID;

    const { searchParams } = new URL(req.url);
    const redirectParam = searchParams.get('redirect') || '/';

    if (!clientId) {
      return NextResponse.json({
        configured: false,
        error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment variables.',
      });
    }

    // Determine the base origin
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = `${proto}://${host}`;

    // Standard callback URL
    const redirectUri = `${origin}/api/auth/google/callback`;

    const state = JSON.stringify({ redirect: redirectParam });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state: Buffer.from(state).toString('base64'),
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.json({
      configured: true,
      url: googleAuthUrl,
      redirectUri,
    });
  } catch (error: any) {
    return NextResponse.json(
      { configured: false, error: error.message || 'Failed to generate Google OAuth URL' },
      { status: 500 }
    );
  }
}
