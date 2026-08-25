import { NextRequest, NextResponse } from 'next/server';
import { deleteNewsletter } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteNewsletter(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting newsletter subscriber:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
