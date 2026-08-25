import { NextRequest, NextResponse } from 'next/server';
import { deletePost, getPostById, getPostBySlug, updatePost } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let post = await getPostById(id);
    if (!post) {
      post = await getPostBySlug(id);
    }
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
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.statusCode || 403 }
      );
    }

    const { id } = await params;
    let existingPost = await getPostById(id);
    if (!existingPost) {
      existingPost = await getPostBySlug(id);
    }

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const userRole = (auth.user.role || '').toUpperCase();
    const isEditorOrAdmin = userRole === 'EDITOR' || userRole === 'ADMIN';

    // Author role boundary check: Authors can ONLY edit their own posts
    if (!isEditorOrAdmin && existingPost.authorId !== auth.user.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own posts.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Prepare update payload
    const updatePayload: any = { ...body };

    if (userRole !== 'ADMIN') {
      delete updatePayload.publishedAt;
    }

    // Author workflow enforcement
    if (!isEditorOrAdmin) {
      delete updatePayload.authorId; // Author cannot change author ownership
      delete updatePayload.authorName;

      // Author cannot set status to 'published'
      if (updatePayload.status === 'published') {
        updatePayload.status = 'pending';
      } else if (updatePayload.status && updatePayload.status !== 'pending' && updatePayload.status !== 'draft') {
        updatePayload.status = existingPost.status === 'published' ? 'pending' : 'draft';
      }
    }

    const updated = await updatePost(existingPost.id, updatePayload);
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
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.statusCode || 403 }
      );
    }

    const { id } = await params;
    let existingPost = await getPostById(id);
    if (!existingPost) {
      existingPost = await getPostBySlug(id);
    }

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const userRole = (auth.user.role || '').toUpperCase();
    const isEditorOrAdmin = userRole === 'EDITOR' || userRole === 'ADMIN';

    // Author boundary check: Authors can ONLY delete their own posts
    if (!isEditorOrAdmin && existingPost.authorId !== auth.user.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const permanent = isEditorOrAdmin && searchParams.get('permanent') === 'true';
    await deletePost(existingPost.id, permanent);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
