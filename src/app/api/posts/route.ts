import { NextRequest, NextResponse } from 'next/server';
import { createPost, getPosts, validatePostPayload } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category') || undefined;
    const tagSlug = searchParams.get('tag') || undefined;
    const authorId = searchParams.get('author') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const isFeatured = searchParams.get('featured') === 'true' ? true : undefined;
    const isTrending = searchParams.get('trending') === 'true' ? true : undefined;
    const isEditorPick = searchParams.get('editorPick') === 'true' ? true : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;

    const posts = await getPosts({
      categorySlug,
      tagSlug,
      authorId,
      status,
      search,
      isFeatured,
      isTrending,
      isEditorPick,
      limit,
      offset,
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.statusCode || 403 }
      );
    }

    const body = await req.json();
    const validation = validatePostPayload(body);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }

    const newPost = await createPost({
      ...body,
      authorId: body.authorId || auth.user?.userId,
      authorName: body.authorName || auth.user?.name,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    const detail = error?.cause?.message || error?.detail || error?.message || 'Failed to create post';
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
