import type { TemplateDef, TemplateSlug } from '@/lib/types';

/**
 * Registro de plantillas (spec §10.2). Cada plantilla aporta estructura,
 * dependencias, scripts y archivos reales vía sus constructores en lib/templates.
 */
export const TEMPLATES: TemplateDef[] = [
  {
    id: 'art-portfolio',
    name: 'Portfolio artístico',
    slug: 'art-portfolio' satisfies TemplateSlug,
    description:
      'Portfolio inmersivo con hero generativo, galería de obra, manifiesto y contacto. Ideal para artistas y estudios.',
    category: 'arte',
    version: '1.0.0',
    tags: ['portfolio', 'arte', 'galería'],
    highlights: ['Hero Blue Field', 'Galería de obra', 'Manifiesto editorial'],
  },
  {
    id: 'visual-gallery',
    name: 'Galería visual',
    slug: 'visual-gallery' satisfies TemplateSlug,
    description:
      'Exposición digital con filtrado por colección, sección de visita y contacto. Para galerías y proyectos culturales.',
    category: 'cultura',
    version: '1.0.0',
    tags: ['galería', 'exposición', 'cultura'],
    highlights: ['Filtrado en cliente', 'Colecciones', 'Planifica tu visita'],
  },
  {
    id: 'creative-dashboard',
    name: 'Dashboard creativo',
    slug: 'creative-dashboard' satisfies TemplateSlug,
    description:
      'Panel operativo con métricas, tabla de proyectos y actividad reciente. Para equipos y estudios creativos.',
    category: 'productividad',
    version: '1.0.0',
    tags: ['dashboard', 'métricas', 'equipo'],
    highlights: ['Métricas del estudio', 'Tabla de proyectos', 'Feed de actividad'],
  },
];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((template) => template.id === id || template.slug === id);
}

export function getTemplateOrDefault(id: string): TemplateDef {
  return getTemplate(id) ?? TEMPLATES[0]!;
}
