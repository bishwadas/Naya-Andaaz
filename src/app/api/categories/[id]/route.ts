import { NextRequest, NextResponse } from 'next/server';
import { deleteCategory, updateCategory } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateCategory(id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating category:', error);
    const isClientError =
      error.message?.includes('already exists') ||
      error.message?.includes('Validation') ||
      error.message?.includes('parent') ||
      error.message?.includes('not found');
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: isClientError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
