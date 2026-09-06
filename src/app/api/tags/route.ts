import { NextRequest, NextResponse } from 'next/server';
import { createTag, deleteTag, getTags, validateTagPayload } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const list = await getTags();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const body = await req.json();
    const validation = validateTagPayload(body);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }
    const newTag = await createTag(body);
    return NextResponse.json(newTag, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const res = await deleteTag(id);
      return NextResponse.json(res);
    }

    // Support bulk delete via request JSON body
    const body = await req.json().catch(() => null);
    if (body && Array.isArray(body.ids) && body.ids.length > 0) {
      for (const tagId of body.ids) {
        if (typeof tagId === 'string' && tagId.trim()) {
          await deleteTag(tagId.trim());
        }
      }
      return NextResponse.json({ success: true, count: body.ids.length });
    }

    return NextResponse.json({ error: 'Tag ID or IDs required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

