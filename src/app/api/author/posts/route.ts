import { NextRequest, NextResponse } from 'next/server';
import { getPostsPaginated } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const sortBy = (searchParams.get('sortBy') as any) || undefined;
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const dateFilter = (searchParams.get('dateFilter') as any) || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const paginatedResult = await getPostsPaginated({
      categoryId,
      authorId: auth.user.userId, // Strictly enforce author ownership
      status,
      search,
      limit,
      page,
      sortBy,
      sortOrder,
      dateFilter,
      dateFrom,
      dateTo,
    });

    return NextResponse.json(paginatedResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch author posts' }, { status: 500 });
  }
}
