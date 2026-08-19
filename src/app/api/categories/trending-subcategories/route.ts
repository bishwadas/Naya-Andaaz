import { NextResponse } from 'next/server';
import { getTrendingSubcategories } from '@/db/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getTrendingSubcategories();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending subcategories' },
      { status: 500 }
    );
  }
}
