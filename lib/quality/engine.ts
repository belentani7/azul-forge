import type { QualityCheck, QualityReport, GeneratedProject } from '@/lib/types';

/**
 * Quality Engine (Fase 5): evalúa el proyecto generado y devuelve un informe
 * 0–100 con checklist. Puntuación: 30 documentación + 20 código de calidad +
 * 15 tests + 10 CI + 15 SEO + 10 accesibilidad = 100.
 */
export function evaluateProject(project: GeneratedProject): QualityReport {
  const { files, fileMap, manifest } = project;
  const paths = files.map((file) => file.path);
  const checks: QualityCheck[] = [];

  const add = (id: string, label: string, passed: boolean, detail: string) => {
    checks.push({ id, label, passed, detail });
    return passed;
  };

  // Documentación (30)
  const readme = fileMap['README.md'] ?? '';
  const scoreDoc =
    (add('readme', 'README profesional', readme.length > 500, `${readme.length} caracteres de documentación`)
      ? 10
      : 0) +
    (add('license', 'Licencia incluida', paths.includes('LICENSE'), 'LICENSE (MIT)')
      ? 10
      : 0) +
    (add('docs', 'Guías de docs/', paths.includes('docs/ARQUITECTURA.md') && paths.includes('docs/DESPLIEGUE.md'), 'docs/ARQUITECTURA.md + docs/DESPLIEGUE.md')
      ? 10
      : 0);

  // Código de calidad (20)
  const appFiles = paths.filter((path) => path.startsWith('app/'));
  const componentFiles = paths.filter((path) => path.startsWith('components/'));
  const hasTypes = paths.includes('lib/types.ts') && paths.includes('lib/utils.ts');
  const noAny = !files.some((file) => /\.tsx?$/.test(file.path) && /: any\b/.test(file.content));
  const scoreCode =
    (add(
      'structure',
      'Estructura modular',
      appFiles.length > 0 && componentFiles.length >= 3,
      `${appFiles.length} rutas · ${componentFiles.length} componentes`,
    )
      ? 10
      : 0) +
    (add('typescript', 'TypeScript sin any', hasTypes && noAny, hasTypes && noAny ? 'tipos y utilidades compartidas' : 'revisa tipos')
      ? 10
      : 0);

  // Tests (15)
  const testFiles = paths.filter((path) => path.includes('.test.') || path.includes('__tests__/'));
  const scoreTests = add(
    'tests',
    'Tests automatizados',
    manifest.features.tests && testFiles.length >= 2,
    `${testFiles.length} archivos de test`,
  )
    ? 15
    : 0;

  // CI (10)
  const scoreCi = add(
    'ci',
    'CI de GitHub Actions',
    manifest.features.ci && paths.includes('.github/workflows/ci.yml'),
    'lint · type-check · test · build',
  )
    ? 10
    : 0;

  // SEO (15)
  const layout = fileMap['app/layout.tsx'] ?? '';
  const hasMeta = layout.includes('export const metadata') && layout.includes('openGraph');
  const hasRobots = layout.includes('robots');
  const scoreSeo =
    (add('seo-meta', 'Metadata SEO (title, description, OG)', hasMeta, 'metadata + openGraph en layout')
      ? 8
      : 0) + (add('seo-robots', 'robots.txt', hasRobots, 'index, follow') ? 7 : 0);

  // Accesibilidad (10)
  const hasSkipLink = layout.includes('skip-link');
  const hasLang = layout.includes('lang="es"') || layout.includes("lang='es'");
  const hasLabels = componentFiles.every((path) => {
    const content = fileMap[path] ?? '';
    return !content.includes('<img ') || content.includes('alt=');
  });
  const scoreA11y =
    (add('a11y-skip', 'Skip-link y landmark principal', hasSkipLink, 'enlace "Saltar al contenido"')
      ? 4
      : 0) +
    (add('a11y-lang', 'Idioma declarado', hasLang, 'lang="es"') ? 3 : 0) +
    (add('a11y-alt', 'Imágenes con texto alternativo', hasLabels, hasLabels ? 'sin img sin alt' : 'falta alt') ? 3 : 0);

  const total = scoreDoc + scoreCode + scoreTests + scoreCi + scoreSeo + scoreA11y;

  const recommendations: string[] = [];
  for (const check of checks) {
    if (!check.passed) recommendations.push(`Mejora: ${check.label} — ${check.detail}`);
  }
  if (total === 100) recommendations.push('Proyecto en estado de entrega: publicable tal cual.');

  return {
    score: total,
    checks,
    recommendations,
  };
}
