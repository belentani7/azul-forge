import { NextResponse } from 'next/server';
import { getProject } from '@/lib/generator';

export function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const project = getProject(id);
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({
      projectId: project.manifest.id,
      manifest: project.manifest,
      files: project.files,
      previewHtml: project.previewHtml,
    });
  });
}
