import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.CLIENT_ID ||
      '';

    return NextResponse.json({
      configured: Boolean(clientId && clientId.trim().length > 0),
      clientId: clientId.trim(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { configured: false, clientId: '', error: error?.message || 'Failed to get Google OAuth configuration' },
      { status: 500 }
    );
  }
}
