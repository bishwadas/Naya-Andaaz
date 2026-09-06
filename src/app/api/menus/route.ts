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
    const { id, location, items } = await req.json();
    const menuIdOrLoc = id || location || 'primary';
    await updateMenu(menuIdOrLoc, items || []);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: error.message || 'Unable to update menu' }, { status: 500 });
  }
}
