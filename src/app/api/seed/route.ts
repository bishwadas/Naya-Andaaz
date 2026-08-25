import { NextResponse } from 'next/server';
import { seedDatabase } from '@/db/seed';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST() {
  try {
    const auth = await authorizeRequest('ADMIN');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database successfully populated with luxury editorial content & schema' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Seed failed' }, { status: 500 });
  }
}

