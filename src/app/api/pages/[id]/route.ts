import { NextRequest, NextResponse } from 'next/server';
import { deletePage, getPageById, getPageBySlug, updatePage } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let page = await getPageBySlug(id);
    if (!page) {
      page = await getPageById(id);
    }
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error: any) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updatePage(id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePage(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
