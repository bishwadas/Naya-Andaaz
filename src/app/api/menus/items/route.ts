import { NextRequest, NextResponse } from 'next/server';
import { createMenuItem } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Editor access required' }, { status: auth.statusCode || 403 });
    }

    const body = await req.json();
    if (!body || !body.label || !body.url) {
      return NextResponse.json({ error: 'Label and URL are required' }, { status: 400 });
    }

    const menuIdOrLocation = body.menuId || body.location || 'primary';
    const newItem = await createMenuItem({
      menuIdOrLocation,
      label: body.label,
      url: body.url,
      categorySlug: body.categorySlug || null,
      parentId: body.parentId || null,
      order: body.order,
      target: body.target || '_self',
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating menu item in API:', error);

    // If it's a known validation/duplicate error, return its friendly message
    const isFriendly =
      error.statusCode === 409 ||
      error.message?.includes('already added to the menu') ||
      error.message?.includes('required');

    if (isFriendly) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 400 }
      );
    }

    // Otherwise return safe admin error and hide raw internal SQL strings
    return NextResponse.json(
      { error: 'Unable to add this menu item. Please try again.' },
      { status: 500 }
    );
  }
}
