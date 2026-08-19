import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('ADMIN');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const body = await req.json();
    const [newItem] = await db
      .insert(menuItems)
      .values({
        id: crypto.randomUUID(),
        menuId: body.menuId || body.location || 'primary',
        label: body.label,
        url: body.url,
        categorySlug: body.categorySlug || null,
        order: body.order ?? 0,
      })
      .returning();

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create menu item' }, { status: 500 });
  }
}
