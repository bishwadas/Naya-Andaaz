import { NextRequest, NextResponse } from 'next/server';
import { duplicatePost } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.statusCode || 403 }
      );
    }

    const { id } = await params;
    const duplicated = await duplicatePost(id, auth.user.userId);
    if (!duplicated) {
      return NextResponse.json({ error: 'Original article not found' }, { status: 404 });
    }

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error: any) {
    console.error('Error duplicating post:', error);
    const detail = error?.cause?.message || error?.detail || error?.message || 'Failed to duplicate post';
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
