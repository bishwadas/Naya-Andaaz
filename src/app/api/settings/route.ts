import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authorizeRequest('ADMIN');
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const body = await req.json();
    const updated = await updateSiteSettings(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
