import type {
  ComposedProject,
  GeneratedFile,
  GeneratedProject,
  ProjectManifest,
  ThemeDef,
} from '@/lib/types';
import { languageFromPath } from '@/lib/utils';

/**
 * Renderer (Fase 4): convierte un proyecto compuesto en su representación final:
 * lista de archivos + vista previa HTML autocontenida.
 */
export function renderProject(composed: ComposedProject): GeneratedProject {
  const preview = buildPreviewHtml(composed.manifest, composed.theme);
  const files: GeneratedFile[] = [
    ...composed.files,
    {
      path: 'preview.html',
      content: preview,
      language: languageFromPath('preview.html'),
    },
  ];

  const fileMap: Record<string, string> = {};
  for (const file of files) {
    fileMap[file.path] = file.content;
  }

  return {
    manifest: composed.manifest,
    files,
    fileMap,
    previewHtml: preview,
  };
}

/**
 * preview.html — página autocontenida (sin dependencias) que se inyecta en el
 * iframe del estudio y viaja dentro del ZIP.
 */
export function buildPreviewHtml(manifest: ProjectManifest, theme: ThemeDef): string {
  const fontStack =
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  return `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(manifest.name)} — vista previa</title>
  <style>
    :root {
      --bg: ${theme.bg};
      --ink: ${theme.fg};
      --muted: ${theme.muted};
      --accent: ${theme.accent};
      --accent-alt: ${theme.accentAlt};
      --card: ${theme.card};
      --border: ${theme.border};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ${fontStack};
      background: var(--bg);
      color: var(--ink);
      line-height: 1.6;
    }
    .bg {
      position: fixed;
      inset: 0;
      z-index: -1;
      background:
        radial-gradient(600px 400px at 12% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%),
        radial-gradient(700px 500px at 110% 20%, color-mix(in srgb, var(--accent-alt) 14%, transparent), transparent 70%),
        var(--bg);
    }
    .grid {
      position: fixed;
      inset: 0;
      z-index: -1;
      background-image:
        linear-gradient(color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%);
    }
    header { padding: 4.5rem 8vw 3.5rem; }
    .eyebrow {
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-size: 0.72rem;
      color: var(--accent-alt);
    }
    h1 {
      font-size: clamp(2.2rem, 6vw, 4.2rem);
      line-height: 1.05;
      margin: 0.75rem 0;
      max-width: 18ch;
    }
    .lead { color: var(--muted); font-size: 1.15rem; max-width: 56ch; }
    .chip {
      display: inline-flex;
      gap: 0.5rem;
      align-items: center;
      border: 1px solid var(--border);
      background: color-mix(in srgb, var(--card) 80%, transparent);
      border-radius: 999px;
      padding: 0.35rem 0.95rem;
      font-size: 0.82rem;
      color: var(--muted);
    }
    .chip b { color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.25rem;
      padding: 1rem 8vw 4rem;
    }
    .card {
      background: color-mix(in srgb, var(--card) 88%, transparent);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 1.35rem 1.4rem;
    }
    .card h2 { font-size: 1.02rem; margin: 0 0 0.45rem; }
    .card p { color: var(--muted); font-size: 0.92rem; margin: 0; }
    .swatches { display: flex; gap: 0.55rem; padding: 0 8vw 3.5rem; }
    .swatch {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid var(--border);
      display: grid;
      place-items: center;
      font-size: 0.62rem;
      color: transparent;
    }
    .swatch:hover { color: var(--ink); }
    footer {
      border-top: 1px solid var(--border);
      padding: 1.5rem 8vw 2.5rem;
      color: var(--muted);
      font-size: 0.85rem;
    }
    a.button {
      display: inline-block;
      margin-top: 1.6rem;
      background: var(--accent);
      color: ${theme.btnFg};
      text-decoration: none;
      padding: 0.78rem 1.55rem;
      border-radius: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="bg" aria-hidden="true"></div>
  <div class="grid" aria-hidden="true"></div>
  <header>
    <p class="eyebrow">${escapeHtml(theme.name)} · plantilla ${escapeHtml(manifest.templateId)}</p>
    <h1>${escapeHtml(manifest.name)}</h1>
    <p class="lead">${escapeHtml(manifest.description)}</p>
    <p class="chip">slug <b>${escapeHtml(manifest.slug)}</b> · seed <b>${manifest.seed}</b></p>
    <a class="button" href="#contenido">Explorar</a>
  </header>
  <main id="contenido">
    <div class="cards">
      <article class="card"><h2>Motor determinista</h2><p>El mismo formulario siempre produce los mismos archivos: seed derivada del slug.</p></article>
      <article class="card"><h2>Calidad verificable</h2><p>README, licencia, tests, CI y accesibilidad se evalúan en el panel de calidad.</p></article>
      <article class="card"><h2>Exportación real</h2><p>Descarga el .zip con estructura de proyecto lista para git push y Vercel.</p></article>
      <article class="card"><h2>Tema ${escapeHtml(theme.name)}</h2><p>Paleta completa con tokens CSS: fondo, tinta, acento y estados.</p></article>
    </div>
    <div class="swatches" aria-label="Paleta del proyecto">
      <div class="swatch" style="background:${theme.bg}">bg</div>
      <div class="swatch" style="background:${theme.fg}">ink</div>
      <div class="swatch" style="background:${theme.accent}">accent</div>
      <div class="swatch" style="background:${theme.accentAlt}">alt</div>
      <div class="swatch" style="background:${theme.card}">card</div>
    </div>
  </main>
  <footer>
    ${escapeHtml(manifest.author)} · generado con AZUL FORGE · ${escapeHtml(manifest.createdAt.slice(0, 10))}
  </footer>
</body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
