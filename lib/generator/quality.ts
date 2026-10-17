import { contrastRatio, getPalette } from "./palette";
import type { GeneratedFile, ProjectManifest, QualityCheck, QualityReport } from "./types";

export function evaluateQuality(manifest: ProjectManifest, files: GeneratedFile[]): QualityReport {
  const contents = new Map(files.map((file) => [file.path, file.content]));
  const has = (path: string) => contents.has(path);
  const script = (() => {
    try { return JSON.parse(contents.get("package.json") ?? "{}").scripts as Record<string, string> | undefined; }
    catch { return undefined; }
  })();
  const checks: QualityCheck[] = [];
  const add = (id: string, label: string, detail: string, passed: boolean, weight = 1, applicable = true) => {
    checks.push({ id, label, detail, passed: applicable && passed, weight, applicable });
  };

  add("identity", "Identidad definida", "Nombre, descripción y slug presentes.", !!manifest.name && manifest.description.length >= 12 && !!manifest.slug);
  add("source", "Interfaz incluida", "Página, layout y estilos generados.", ["app/page.tsx", "app/layout.tsx", "app/globals.css"].every(has), 2);
  add("backend", "Backend incluido", "Rutas de salud y contenido disponibles.", has("app/api/health/route.ts") && has("app/api/content/route.ts"), 2);
  add("metadata", "Metadatos presentes", "Título y descripción en el layout.", (contents.get("app/layout.tsx") ?? "").includes("metadata") && has("public/favicon.svg"));
  add("readme", "Guía de uso", "README con instrucciones del proyecto.", (contents.get("README.md") ?? "").includes(manifest.name));
  add("license", "Licencia incluida", "Archivo LICENSE incluido; revisa la autoría antes de publicar.", has("LICENSE"));
  add("git", "Archivos protegidos", "Gitignore excluye dependencias y variables locales.", (contents.get(".gitignore") ?? "").includes("node_modules") && (contents.get(".gitignore") ?? "").includes(".env*"));
  add("scripts", "Instalación reproducible", "Scripts de desarrollo y build junto a lockfile.", !!script?.dev && !!script?.build && !!script?.lint && !!script?.typecheck && has("package-lock.json"), 2);
  const palette = getPalette(manifest);
  add("contrast", "Contraste de texto", "Relación calculada entre texto y fondo principal ≥ 4,5:1 (no sustituye auditoría visual).", contrastRatio(palette.foreground, palette.background) >= 4.5);
  add("tests", "Tests incluidos", "Tests y comando de ejecución en el ZIP.", has("tests/content.test.ts") && !!script?.test, 1, manifest.features.tests);
  add("ci", "Integración continua", "Workflow que ejecuta los scripts configurados.", has(".github/workflows/ci.yml"), 1, manifest.features.ci);
  add("docs", "Documentación técnica", "Arquitectura, accesibilidad y despliegue documentados.", ["docs/ARQUITECTURA.md", "docs/ACCESIBILIDAD.md", "docs/DESPLIEGUE.md"].every(has), 1, manifest.features.docs);

  const applicable = checks.filter((check) => check.applicable);
  const totalWeight = applicable.reduce((sum, check) => sum + check.weight, 0);
  const passedWeight = applicable.filter((check) => check.passed).reduce((sum, check) => sum + check.weight, 0);
  return {
    score: totalWeight ? Math.round(100 * passedWeight / totalWeight) : 0,
    passed: applicable.filter((check) => check.passed).length,
    applicable: applicable.length,
    method: "Comprobaciones automáticas de estructura, opciones y contraste principal; no certifican seguridad, accesibilidad ni ejecución del proyecto.",
    checks
  };
}
