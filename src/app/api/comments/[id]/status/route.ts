import { NextRequest, NextResponse } from 'next/server';
import { updateCommentStatus } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateCommentStatus(id, body.status);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating comment status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
