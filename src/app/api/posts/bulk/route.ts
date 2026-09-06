import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdatePosts, duplicatePost } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.statusCode || 403 }
      );
    }

    const body = await req.json();
    const { action, postIds, categoryId, scheduledAt } = body;

    if (!action || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request payload: action and postIds array are required.' },
        { status: 400 }
      );
    }

    const userRole = (auth.user.role || '').toUpperCase();
    const isEditorOrAdmin = userRole === 'EDITOR' || userRole === 'ADMIN';

    // Authors cannot publish directly or permanently delete without admin rights
    if (!isEditorOrAdmin) {
      if (action === 'publish') {
        return NextResponse.json(
          { error: 'Authors cannot publish articles directly. Submit for review instead.' },
          { status: 403 }
        );
      }
      if (action === 'delete') {
        return NextResponse.json(
          { error: 'Only Editors and Administrators can permanently delete articles.' },
          { status: 403 }
        );
      }

      // Check ownership
      const { db } = await import('@/db');
      const { posts } = await import('@/db/schema');
      const { inArray, eq, and } = await import('drizzle-orm');
      
      const unownedQuery = await db.select({ id: posts.id, authorId: posts.authorId })
        .from(posts)
        .where(inArray(posts.id, postIds));
        
      const hasUnowned = unownedQuery.some(p => p.authorId !== auth.user!.userId);
      
      if (hasUnowned) {
        return NextResponse.json(
          { error: 'You do not have permission to modify some of the selected articles.' },
          { status: 403 }
        );
      }
    }

    if (action === 'duplicate') {
      let duplicatedCount = 0;
      for (const id of postIds) {
        const dup = await duplicatePost(id, auth.user.userId);
        if (dup) duplicatedCount++;
      }
      return NextResponse.json({
        success: true,
        count: duplicatedCount,
        message: `Successfully duplicated ${duplicatedCount} article(s).`,
      });
    }

    const result = await bulkUpdatePosts({
      action,
      postIds,
      categoryId,
      scheduledAt,
    });

    let actionLabel = action;
    if (action === 'trash') actionLabel = 'moved to trash';
    else if (action === 'restore') actionLabel = 'restored from trash';
    else if (action === 'delete') actionLabel = 'permanently deleted';
    else if (action === 'publish') actionLabel = 'published';
    else if (action === 'draft') actionLabel = 'converted to drafts';
    else if (action === 'pending') actionLabel = 'marked pending review';
    else if (action === 'scheduled') actionLabel = 'scheduled';
    else if (action === 'category') actionLabel = 'updated category';

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully ${actionLabel} ${result.count} article(s).`,
    });
  } catch (error: any) {
    console.error('Bulk post update error:', error);
    const detail = error?.cause?.message || error?.detail || error?.message || 'Failed to perform bulk action';
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
