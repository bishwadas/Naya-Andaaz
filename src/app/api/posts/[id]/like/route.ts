import { NextRequest, NextResponse } from 'next/server';
import { incrementPostLikes } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await incrementPostLikes(id);
    return NextResponse.json({ success: true, likes: post?.likes || 0 });
  } catch (error: any) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
