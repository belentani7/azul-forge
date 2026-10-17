import { NextResponse } from 'next/server';
import { validateInput } from '@/lib/generator';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const validation = validateInput(body);
  return NextResponse.json(validation);
}
