import { NextResponse } from 'next/server';
import { generateFromInput, validateInput } from '@/lib/generator';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const validation = validateInput(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: validation.issues },
      { status: 400 },
    );
  }

  const result = generateFromInput(validation.data);
  return NextResponse.json({
    projectId: result.projectId,
    slug: result.slug,
    files: result.files,
    qualityScore: result.qualityScore,
    quality: result.quality,
  });
}
