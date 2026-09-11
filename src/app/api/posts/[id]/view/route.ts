import { NextRequest, NextResponse } from 'next/server';
import { incrementPostViews } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await incrementPostViews(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking post view:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
