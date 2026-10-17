import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/lib/templates/registry';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    templatesAvailable: TEMPLATES.length,
  });
}
