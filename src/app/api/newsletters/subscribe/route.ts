import { NextRequest, NextResponse } from 'next/server';
import { subscribeNewsletter } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const { email, name, source } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    const res = await subscribeNewsletter(email, name, source);
    return NextResponse.json(res, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
