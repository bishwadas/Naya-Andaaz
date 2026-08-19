import { NextRequest, NextResponse } from 'next/server';
import { getMenus, updateMenu } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const menus = await getMenus();
    return NextResponse.json(menus);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Editor access required' }, { status: 403 });
    }
    const { id, items } = await req.json();
    const updated = await updateMenu(id, items);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
