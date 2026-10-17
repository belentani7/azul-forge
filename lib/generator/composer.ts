import type { ComposedProject, ProjectInput, ThemeDef } from '@/lib/types';
import { hashSeed, slugify, uuid } from '@/lib/utils';
import { DEFAULT_THEME, getTheme } from '@/lib/themes';
import { TEMPLATES, getTemplate } from '@/lib/templates/registry';
import { buildBaseFiles } from '@/lib/generator/files-base';
import { buildArtPortfolioFiles } from '@/lib/templates/art-portfolio';
import { buildVisualGalleryFiles } from '@/lib/templates/visual-gallery';
import { buildCreativeDashboardFiles } from '@/lib/templates/creative-dashboard';
import type { GeneratedFile } from '@/lib/types';

function templateFiles(templateId: string, manifest: ComposedProject['manifest'], theme: ThemeDef): GeneratedFile[] {
  switch (templateId) {
    case 'visual-gallery':
      return buildVisualGalleryFiles(manifest, theme);
    case 'creative-dashboard':
      return buildCreativeDashboardFiles(manifest, theme);
    case 'art-portfolio':
    default:
      return buildArtPortfolioFiles(manifest, theme);
  }
}

/**
 * Composer (Fase 2/3): convierte la entrada del formulario en un proyecto
 * determinista — mismo slug ⇒ mismo seed ⇒ mismos archivos.
 */
export function composeProject(input: ProjectInput): ComposedProject {
  const template = getTemplate(input.templateId) ?? TEMPLATES[0]!;
  const theme: ThemeDef = getTheme(input.themeId) ?? DEFAULT_THEME;

  const slug = slugify(input.name);
  const seed = hashSeed(`${slug}:${template.id}:${theme.id}`);

  const manifest: ComposedProject['manifest'] = {
    id: uuid(),
    slug,
    name: input.name.trim(),
    description: input.description.trim(),
    author: input.author.trim(),
    createdAt: new Date().toISOString(),
    templateId: template.id,
    themeId: theme.id,
    seed,
    features: {
      darkMode: input.features.darkMode,
      tests: input.features.tests,
      ci: input.features.ci,
      docs: input.features.docs,
      generativeBackground: input.features.generativeBackground,
    },
  };

  const files: GeneratedFile[] = [
    ...buildBaseFiles(manifest, theme),
    ...templateFiles(template.id, manifest, theme),
  ];

  return { manifest, theme, files };
}
