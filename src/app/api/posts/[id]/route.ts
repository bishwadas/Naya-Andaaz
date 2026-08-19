import { NextRequest, NextResponse } from 'next/server';
import { deletePost, getPostBySlug, updatePost } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getPostBySlug(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error fetching post:', error);
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
    const updated = await updatePost(id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';
    await deletePost(id, permanent);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
