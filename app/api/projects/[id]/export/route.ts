import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getProject } from '@/lib/generator';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  const zip = new JSZip();
  const root = zip.folder(project.manifest.slug);
  if (!root) {
    return NextResponse.json({ error: 'No se pudo crear el ZIP' }, { status: 500 });
  }
  for (const file of project.files) {
    root.file(file.path, file.content);
  }

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${project.manifest.slug}.zip"`,
    },
  });
}
