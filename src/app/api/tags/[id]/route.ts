import { NextRequest, NextResponse } from 'next/server';
import { deleteTag, updateTag } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateTag(id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTag(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
