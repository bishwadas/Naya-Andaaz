import { NextRequest, NextResponse } from 'next/server';
import {
  restorePost,
  permanentDeletePost,
  restorePage,
  permanentDeletePage,
  restoreCategory,
  permanentDeleteCategory,
  restoreTag,
  permanentDeleteTag,
  restoreUser,
  permanentDeleteUser,
} from '@/db/repository';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    let res: any = null;

    switch (type.toLowerCase()) {
      case 'post':
        res = await restorePost(id);
        break;
      case 'page':
        res = await restorePage(id);
        break;
      case 'category':
        res = await restoreCategory(id);
        break;
      case 'tag':
        res = await restoreTag(id);
        break;
      case 'user':
        res = await restoreUser(id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: res });
  } catch (error: any) {
    console.error('Error restoring trashed item:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    let res: any = null;

    switch (type.toLowerCase()) {
      case 'post':
        res = await permanentDeletePost(id);
        break;
      case 'page':
        res = await permanentDeletePage(id);
        break;
      case 'category':
        res = await permanentDeleteCategory(id);
        break;
      case 'tag':
        res = await permanentDeleteTag(id);
        break;
      case 'user':
        res = await permanentDeleteUser(id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: res });
  } catch (error: any) {
    console.error('Error permanently deleting item:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
