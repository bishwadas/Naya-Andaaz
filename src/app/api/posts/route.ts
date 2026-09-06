import { NextRequest, NextResponse } from 'next/server';
import { createPost, getPosts, getPostsPaginated, validatePostPayload } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const subCategoryId = searchParams.get('subCategoryId') || undefined;
    const tagSlug = searchParams.get('tag') || undefined;
    const authorId = searchParams.get('author') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const isFeatured = searchParams.get('featured') === 'true' ? true : undefined;
    const isTrending = searchParams.get('trending') === 'true' ? true : undefined;
    const isEditorPick = searchParams.get('editorPick') === 'true' ? true : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined;
    const sortBy = (searchParams.get('sortBy') as any) || undefined;
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const dateFilter = (searchParams.get('dateFilter') as any) || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const isPaginated =
      searchParams.get('paginate') === 'true' ||
      searchParams.get('meta') === 'true' ||
      searchParams.has('page') ||
      searchParams.get('format') === 'paginated';

    if (isPaginated) {
      const paginatedResult = await getPostsPaginated({
        categorySlug,
        categoryId,
        subCategoryId,
        tagSlug,
        authorId,
        status,
        search,
        isFeatured,
        isTrending,
        isEditorPick,
        limit,
        offset,
        page,
        sortBy,
        sortOrder,
        dateFilter,
        dateFrom,
        dateTo,
      });

      return NextResponse.json(paginatedResult);
    }

    const posts = await getPosts({
      categorySlug,
      categoryId,
      subCategoryId,
      tagSlug,
      authorId,
      status,
      search,
      isFeatured,
      isTrending,
      isEditorPick,
      limit,
      offset,
      sortBy,
      sortOrder,
      dateFilter,
      dateFrom,
      dateTo,
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized || !auth.user) {
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

    const userRole = (auth.user.role || '').toUpperCase();
    const isEditorOrAdmin = userRole === 'EDITOR' || userRole === 'ADMIN';

    if (userRole !== 'ADMIN') {
      delete body.publishedAt;
    }

    // Role-based status & author restrictions
    let targetStatus = body.status || 'draft';
    let targetAuthorId = isEditorOrAdmin && body.authorId ? body.authorId : auth.user.userId;
    let targetAuthorName = isEditorOrAdmin && body.authorName ? body.authorName : auth.user.name;

    // Authors CANNOT publish directly. Allowed statuses: 'draft' or 'pending' (submit for review)
    if (!isEditorOrAdmin) {
      if (targetStatus === 'published') {
        targetStatus = 'pending';
      } else if (targetStatus !== 'pending' && targetStatus !== 'draft') {
        targetStatus = 'draft';
      }
      targetAuthorId = auth.user.userId;
      targetAuthorName = auth.user.name;
    }

    const newPost = await createPost({
      ...body,
      status: targetStatus,
      authorId: targetAuthorId,
      authorName: targetAuthorName,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    const detail = error?.cause?.message || error?.detail || error?.message || 'Failed to create post';
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
