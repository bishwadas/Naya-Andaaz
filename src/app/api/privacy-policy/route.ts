import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';
import { DEFAULT_PRIVACY_POLICY_CONFIG } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getSettings();
    const privacyPolicy = settings.privacy_policy_page || DEFAULT_PRIVACY_POLICY_CONFIG;
    return NextResponse.json(privacyPolicy);
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
    const updated = await updateSettings({ privacy_policy_page: body });
    return NextResponse.json(updated.privacy_policy_page || body);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
