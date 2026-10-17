import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/lib/templates/registry';

export function GET() {
  return NextResponse.json({ templates: TEMPLATES });
}
