import { NextResponse } from 'next/server';
import { getMostSearchedTerms, recordSearchQuery, isValidSearchTerm } from '@/db/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const terms = await getMostSearchedTerms();
    return NextResponse.json({ terms });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch most searched terms' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body?.query;
    if (query && typeof query === 'string' && isValidSearchTerm(query)) {
      await recordSearchQuery(query);
    }
    const terms = await getMostSearchedTerms();
    return NextResponse.json({ success: true, terms });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record search query' }, { status: 500 });
  }
}
