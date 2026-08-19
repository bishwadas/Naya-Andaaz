import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUsers, updateUser, deleteUser, validateUserPayload } from '@/db/repository';
import { authorizeRequest, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const list = await getUsers();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('ADMIN');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const validation = validateUserPayload(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 });
    }

    const hashedPassword = body.password ? await hashPassword(body.password) : await hashPassword('sereia2026!');
    const newUser = await createUser({
      ...body,
      passwordHash: hashedPassword,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user in API:', error);
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 400 });
  }
}
