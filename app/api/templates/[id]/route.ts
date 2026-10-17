import { NextResponse } from 'next/server';
import { getTemplate } from '@/lib/templates/registry';

export function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const template = getTemplate(id);
    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }
    return NextResponse.json(template);
  });
}
