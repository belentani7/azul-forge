import JSZip from 'jszip';
import type { GeneratedProject } from '@/lib/types';

/**
 * Exporter (Fase 7): empaqueta el proyecto en un .zip con la estructura
 * {slug}/... lista para git init y git push.
 */
export async function buildProjectZip(project: GeneratedProject): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder(project.manifest.slug);
  if (!root) throw new Error('No se pudo crear la carpeta raíz del ZIP');

  for (const file of project.files) {
    root.file(file.path, file.content);
  }

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export async function downloadProjectZip(project: GeneratedProject): Promise<void> {
  const blob = await buildProjectZip(project);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${project.manifest.slug}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
