import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 403 });
    }

    const { id } = await params;
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const [updated] = await db
      .update(menuItems)
      .set({
        label: body.label,
        url: body.url,
        categorySlug: body.categorySlug,
        order: body.order,
      })
      .where(eq(menuItems.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
