import { NextRequest, NextResponse } from 'next/server';
import { deleteMenuItem, updateMenuItem } from '@/db/repository';
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
    await deleteMenuItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Unable to delete menu item. Please try again.' }, { status: 500 });
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
    const updated = await updateMenuItem(id, {
      label: body.label,
      url: body.url,
      categorySlug: body.categorySlug,
      parentId: body.parentId,
      order: body.order,
      target: body.target,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: error.message || 'Unable to update menu item. Please try again.' }, { status: 500 });
  }
}
