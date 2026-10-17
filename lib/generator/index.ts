import type {
  GeneratedProject,
  ProjectInput,
  QualityReport,
  ValidationResponse,
} from '@/lib/types';
import { validateProjectInput } from '@/lib/validations';
import { composeProject } from '@/lib/generator/composer';
import { renderProject } from '@/lib/generator/renderer';
import { evaluateProject } from '@/lib/quality/engine';

/**
 * Persistencia en memoria para el MVP (sin base de datos). Cada proceso de
 * Next.js mantiene su propio Map; el estudio además persiste copias en
 * localStorage. Ver nota en docs/GUIA.md.
 */
const store = new Map<string, GeneratedProject>();

export interface GenerationResult {
  projectId: string;
  slug: string;
  files: { path: string; content: string }[];
  qualityScore: number;
  quality: QualityReport;
  manifest: GeneratedProject['manifest'];
  previewHtml: string;
}

export function generateFromInput(input: ProjectInput): GenerationResult {
  const composed = composeProject(input);
  const project = renderProject(composed);
  const quality = evaluateProject(project);
  store.set(project.manifest.id, project);

  return {
    projectId: project.manifest.id,
    slug: project.manifest.slug,
    files: project.files.map((file) => ({ path: file.path, content: file.content })),
    qualityScore: quality.score,
    quality,
    manifest: project.manifest,
    previewHtml: project.previewHtml,
  };
}

export function validateInput(input: unknown): ValidationResponse {
  return validateProjectInput(input);
}

export function getProject(id: string): GeneratedProject | undefined {
  return store.get(id);
}

export function storeProject(project: GeneratedProject): void {
  store.set(project.manifest.id, project);
}

export function projectCount(): number {
  return store.size;
}
