import type { GeneratedFile, ProjectManifest, ThemeDef } from '@/lib/types';
import { languageFromPath } from '@/lib/utils';

function file(path: string, content: string): GeneratedFile {
  return { path, content: content.trimStart(), language: languageFromPath(path) };
}

export function buildBaseFiles(
  manifest: ProjectManifest,
  theme: ThemeDef,
): GeneratedFile[] {
  const year = new Date(manifest.createdAt).getFullYear();
  const files: GeneratedFile[] = [];

  files.push(
    file(
      'package.json',
      JSON.stringify(
        {
          name: manifest.slug,
          version: '0.1.0',
          private: true,
          description: manifest.description,
          license: 'MIT',
          author: manifest.author,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
            lint: 'next lint',
            'type-check': 'tsc --noEmit',
            test: 'vitest run',
          },
          dependencies: {
            next: '15.5.28',
            react: '19.3.1',
            'react-dom': '19.3.1',
          },
          devDependencies: {
            '@types/node': '^22.10.2',
            '@types/react': '^19.0.2',
            '@types/react-dom': '^19.0.2',
            eslint: '^8.57.1',
            'eslint-config-next': '15.5.28',
            prettier: '^3.4.2',
            typescript: '^5.7.2',
            vitest: '^5.0.5',
          },
        },
        null,
        2,
      ) + '\n',
    ),
  );

  files.push(
    file(
      'tsconfig.json',
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
            paths: { '@/*': ['./*'] },
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules'],
        },
        null,
        2,
      ) + '\n',
    ),
  );

  files.push(
    file(
      'next.config.mjs',
      `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
`,
    ),
  );

  files.push(
    file(
      '.gitignore',
      `node_modules/
.next/
out/
.env
.env.local
coverage/
*.tsbuildinfo
.DS_Store
.vercel
`,
    ),
  );

  files.push(
    file(
      '.env.example',
      `# Variables de entorno de ${manifest.name}
# Copia este archivo a .env.local y ajusta los valores.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`,
    ),
  );

  files.push(
    file(
      'LICENSE',
      `MIT License

Copyright (c) ${year} ${manifest.author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
    ),
  );

  files.push(
    file(
      'README.md',
      buildReadme(manifest, theme),
    ),
  );

  files.push(
    file(
      '.prettierrc',
      JSON.stringify(
        {
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 90,
        },
        null,
        2,
      ) + '\n',
    ),
  );

  files.push(
    file(
      '.eslintrc.json',
      JSON.stringify(
        {
          extends: ['next/core-web-vitals', 'next/typescript'],
          rules: {
            'react/no-unescaped-entities': 'off',
          },
        },
        null,
        2,
      ) + '\n',
    ),
  );

  files.push(
    file(
      'app/globals.css',
      buildGlobalsCss(manifest, theme),
    ),
  );

  files.push(file('app/layout.tsx', buildLayout(manifest)));
  files.push(file('app/api/health/route.ts', buildHealthRoute(manifest)));
  files.push(file('app/api/content/route.ts', buildContentRoute()));
  files.push(file('lib/types.ts', buildLibTypes()));
  files.push(file('lib/utils.ts', buildLibUtils()));
  files.push(file('public/.gitkeep', ''));

  if (manifest.features.tests) {
    files.push(file('tests/lib/utils.test.ts', buildUtilsTest(manifest)));
    files.push(file('tests/lib/content.test.ts', buildContentTest(manifest)));
    files.push(
      file(
        'vitest.config.ts',
        `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
`,
      ),
    );
  }

  if (manifest.features.ci) {
    files.push(file('.github/workflows/ci.yml', buildCiWorkflow(manifest)));
  }

  if (manifest.features.docs) {
    files.push(file('docs/ARQUITECTURA.md', buildDocArquitectura(manifest, theme)));
    files.push(file('docs/ACCESIBILIDAD.md', buildDocAccesibilidad(manifest)));
    files.push(file('docs/DESPLIEGUE.md', buildDocDespliegue(manifest)));
  }

  return files;
}

function buildReadme(manifest: ProjectManifest, theme: ThemeDef): string {
  return `# ${manifest.name}

${manifest.description}

Proyecto generado con **AZUL FORGE** · plantilla \`${manifest.templateId}\` · tema **${theme.name}**.

## Características

- Next.js 15 (App Router) + React 19 + TypeScript estricto.
- Identidad visual consolidada (paleta ${theme.name}: ${theme.bg} / ${theme.accent}).
- Tipografía de display: 'Space Grotesk', system-ui, sans-serif.
- API real: \`GET /api/health\` y \`GET /api/content\`.
${manifest.features.tests ? '- Tests unitarios con Vitest.\n' : ''}${manifest.features.ci ? '- CI con GitHub Actions (lint · type-check · test · build).\n' : ''}${manifest.features.docs ? '- Documentación de arquitectura, accesibilidad y despliegue.\n' : ''}${manifest.features.darkMode ? '- Modo claro/oscuro con persistencia local.\n' : ''}${manifest.features.generativeBackground ? '- Fondo generativo con respeto a `prefers-reduced-motion`.\n' : ''}
## Inicio rápido

\`\`\`bash
npm install
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000).

## Publicar en GitHub

\`\`\`bash
git init
git add .
git commit -m "feat: scaffold inicial generado con AZUL FORGE"
git branch -M main
git remote add origin https://github.com/usuario/${manifest.slug}.git
git push -u origin main
\`\`\`

## Licencia

MIT © ${yearOf(manifest)} ${manifest.author}
`;
}

function yearOf(manifest: ProjectManifest): number {
  return new Date(manifest.createdAt).getFullYear();
}

function buildGlobalsCss(manifest: ProjectManifest, theme: ThemeDef): string {
  const darkBase = `:root {
  --bg: ${theme.bg};
  --surface: ${theme.card};
  --ink: ${theme.fg};
  --muted: ${theme.muted};
  --accent: ${theme.accent};
  --accent-alt: ${theme.accentAlt};
  --border: ${theme.border};
  --glow: color-mix(in srgb, ${theme.accent} 25%, transparent);
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  color-scheme: dark;
}`;

  const lightOverride = manifest.features.darkMode
    ? `

[data-theme='light'] {
  --bg: #F4F1EA;
  --surface: #FFFFFF;
  --ink: #131517;
  --muted: #5C6470;
  --accent: #2D7DFF;
  --accent-alt: #0B8A6E;
  --border: rgba(19, 21, 23, 0.12);
  --glow: rgba(45, 125, 255, 0.16);
  color-scheme: light;
}`
    : '';

  return `${darkBase}${lightOverride}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin: 0 0 0.5em;
}

.container {
  width: min(1120px, 92vw);
  margin-inline: auto;
}

.section {
  padding: 5rem 0;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 1.5rem;
  transition: border-color 240ms ease, transform 240ms ease;
}

.card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: ${theme.bg === '#F4F1EA' ? '#FFFFFF' : '#041225'};
  font-weight: 600;
  padding: 0.85rem 1.6rem;
  cursor: pointer;
  transition: filter 200ms ease;
}

.button:hover {
  filter: brightness(1.1);
}

.button:focus-visible,
a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--accent-alt);
  outline-offset: 3px;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--accent);
  color: #fff;
  padding: 0.6rem 1rem;
  z-index: 100;
}

.skip-link:focus {
  left: 1rem;
  top: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;
}

function buildLayout(manifest: ProjectManifest): string {
  const themeInitScript = `        <script
          dangerouslySetInnerHTML={{
            __html:
              "try { var t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}",
          }}
        />`;

  return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '${escapeSingle(manifest.name)}',
    template: '%s · ${escapeSingle(manifest.name)}',
  },
  description: '${escapeSingle(manifest.description)}',
  authors: [{ name: '${escapeSingle(manifest.author)}' }],
  openGraph: {
    title: '${escapeSingle(manifest.name)}',
    description: '${escapeSingle(manifest.description)}',
    type: 'website',
    locale: 'es_ES',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es"${manifest.features.darkMode ? ' data-theme="dark"' : ''}>
      <head>
${manifest.features.darkMode ? themeInitScript : ''}
      </head>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
`;
}

function buildHealthRoute(manifest: ProjectManifest): string {
  return `export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    status: 'ok',
    project: '${escapeSingle(manifest.slug)}',
    version: '0.1.0',
    generatedBy: 'AZUL FORGE',
    timestamp: new Date().toISOString(),
  });
}
`;
}

function buildContentRoute(): string {
  return `import { site } from '@/lib/data';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(site);
}
`;
}

function buildLibTypes(): string {
  return `export interface NavItem {
  label: string;
  href: string;
}

export interface WorkItem {
  id: string;
  title: string;
  year: number;
  medium: string;
  collection: string;
  summary: string;
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  trend: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  status: 'activo' | 'en revisión' | 'archivado';
  owner: string;
  updated: string;
}

export interface ActivityEvent {
  id: string;
  when: string;
  actor: string;
  action: string;
}
`;
}

function buildLibUtils(): string {
  return `export function slugify(input: string): string {
  return (
    input
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function currentYear(): number {
  return new Date().getFullYear();
}
`;
}

function buildUtilsTest(manifest: ProjectManifest): string {
  return `import { describe, expect, it } from 'vitest';
import { cn, slugify, currentYear } from '../../lib/utils';

describe('utils', () => {
  it('slugifica el nombre del proyecto', () => {
    expect(slugify('${escapeSingle(manifest.name)}')).toBe('${escapeSingle(manifest.slug)}');
  });

  it('combina clases de forma estable', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });

  it('devuelve un año válido', () => {
    expect(currentYear()).toBeGreaterThanOrEqual(2024);
  });
});
`;
}

function buildContentTest(manifest: ProjectManifest): string {
  return `import { describe, expect, it } from 'vitest';
import { site } from '../../lib/data';

describe('contenido del sitio', () => {
  it('expone identidad del proyecto', () => {
    expect(site.name).toBe('${escapeSingle(manifest.name)}');
    expect(site.description.length).toBeGreaterThan(10);
  });

  it('incluye secciones reales', () => {
    expect(site.nav.length).toBeGreaterThanOrEqual(3);
  });
});
`;
}

function buildCiWorkflow(manifest: ProjectManifest): string {
  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: lint · type-check · test · build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run type-check
${manifest.features.tests ? '      - run: npm test\n' : ''}      - run: npm run build
`;
}

function buildDocArquitectura(manifest: ProjectManifest, theme: ThemeDef): string {
  return `# Arquitectura — ${manifest.name}

Generado por AZUL FORGE (plantilla \`${manifest.templateId}\`, tema ${theme.name}).

## Capas

1. **Presentación (app/)** — App Router de Next.js, Server Components por defecto.
2. **Componentes (components/)** — piezas de UI aisladas y reutilizables.
3. **Dominio (lib/)** — tipos, datos semilla y utilidades puras.
4. **API (app/api/)** — Route Handlers con contratos JSON estables.

## Decisiones

- TypeScript estricto sin \`any\` implícito.
- CSS con variables de tema: cambiar la identidad visual no toca componentes.
- Datos en \`lib/data.ts\` como única fuente de verdad del contenido.
`;
}

function buildDocAccesibilidad(manifest: ProjectManifest): string {
  return `# Accesibilidad — ${manifest.name}

- \`lang="es"\` en el documento.
- Enlace "Saltar al contenido" como primer foco.
- Contraste AA sobre la paleta del tema.
- Focos visibles en todos los elementos interactivos.
${manifest.features.generativeBackground ? '- El fondo generativo se detiene con `prefers-reduced-motion`.\n' : ''}${manifest.features.darkMode ? '- El modo claro/oscuro se puede forzar y persiste.\n' : ''}
Objetivo declarado: WCAG 2.2 AA.
`;
}

function buildDocDespliegue(manifest: ProjectManifest): string {
  return `# Despliegue — ${manifest.name}

## Vercel (recomendado)

1. Sube el repositorio a GitHub.
2. Importa el repo en Vercel (framework: Next.js).
3. Variables de entorno: copia \`.env.example\`.
4. Deploy: automático en cada push a \`main\`.

## GitHub Pages

Este proyecto necesita un runtime Node (API routes). Para hosting estático
puro, desactiva las rutas de API y usa \`next export\` / \`output: 'export'\`.

## Local

\`\`\`bash
npm ci
npm run build
npm start
\`\`\`
`;
}

function escapeSingle(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
