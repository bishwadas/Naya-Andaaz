import { NextRequest, NextResponse } from 'next/server';
import { createCategory, getCategories, validateCategoryPayload } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const list = await getCategories();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const body = await req.json();
    const validation = validateCategoryPayload(body);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }
    const newCategory = await createCategory(body);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    const isClientError =
      error.message?.includes('already exists') ||
      error.message?.includes('Validation') ||
      error.message?.includes('parent');
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: isClientError ? 400 : 500 }
    );
  }
}

