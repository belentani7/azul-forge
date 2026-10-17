import withTestsLock from "./lockfiles/with-tests.json";
import withoutTestsLock from "./lockfiles/without-tests.json";
import { generatedBoard, generatedCss, generatedPage } from "./source";
import { generatedPackage } from "./versions";
import type { GeneratedFile, ProjectManifest } from "./types";

function file(path: string, content: string): GeneratedFile {
  const extension = path.split(".").pop() ?? "";
  const language = ({ tsx: "tsx", ts: "typescript", css: "css", json: "json", md: "markdown", yml: "yaml", mjs: "javascript", svg: "markup" } as Record<string, string>)[extension] ?? "text";
  return { path, content, language };
}

function packageLock(slug: string, tests: boolean): string {
  const template = tests ? withTestsLock : withoutTestsLock;
  const lock = structuredClone(template) as { name: string; packages: Record<string, { name?: string }> };
  lock.name = slug;
  lock.packages[""].name = slug;
  return JSON.stringify(lock, null, 2) + "\n";
}

function contentModule(manifest: ProjectManifest): string {
  const data = {
    name: manifest.name, slug: manifest.slug, description: manifest.description,
    author: manifest.author || `Contribuyentes de ${manifest.name}`,
    template: manifest.template, theme: manifest.theme
  };
  const safe = JSON.stringify(data, null, 2).replace(/[<>&\u2028\u2029]/g, (character) => {
    return `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
  });
  return `// Edita este archivo para incorporar contenido real. No se generan obras ficticias.\nexport const site = ${safe} as const;\n\nexport type Work = { id: string; title: string; description: string; year: string; image?: string; alt?: string };\nexport const works: Work[] = [];\n`;
}

function readme(manifest: ProjectManifest): string {
  return `# ${manifest.name}

${manifest.description}

Base web generada con **AZUL FORGE** · ${manifest.templateName}. Código editable, sin pagos ni servicios externos obligatorios.

## Empezar

Requiere Node.js 22.13+ y npm.

\`\`\`bash
npm ci
npm run dev
\`\`\`

Abre http://localhost:3000. Para verificar:

\`\`\`bash
npm run lint
npm run typecheck
${manifest.features.tests ? "npm test\n" : ""}npm run build
\`\`\`

## Publicar contenido real

- Edita \`lib/content.ts\` para cambiar los textos. La colección \`works\` empieza vacía: añade piezas con \`id\`, \`title\`, \`description\` y \`year\`. Para mostrar imágenes propias, guarda archivos en \`public/\` y añade \`image: "/mi-obra.jpg"\` y una descripción \`alt\` significativa. Nunca se muestran ejemplos como si fueran trabajo publicado.
- \`app/page.tsx\` define la vista ${manifest.template === "creative-dashboard" ? "del tablero" : "del sitio"}; \`app/globals.css\` contiene sus tokens y estilos.
- \`GET /api/health\` devuelve el estado del servidor; \`GET /api/content\` devuelve el contenido público. Ambas rutas funcionan en Next.js y no simulan persistencia.
${manifest.template === "creative-dashboard" ? "- El tablero permite añadir, completar y borrar tareas. Sus datos se guardan solo en el navegador mediante localStorage, no en el servidor.\n" : ""}
## Desplegar

Vercel detecta Next.js automáticamente. También puedes usar cualquier hosting compatible con Node.js: \`npm ci && npm run build && npm start\`. No requiere variables de entorno (ver \`.env.example\`). **GitHub Pages no ejecuta las rutas /api de Next.js**: no despliegues esta app full-stack allí sin adaptar la arquitectura.

Para subirlo a tu propio repositorio, crea primero un repositorio vacío en GitHub y ejecuta:

\`\`\`bash
git init
git add .
git commit -m "feat: iniciar ${manifest.slug}"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/${manifest.slug}.git
git push -u origin main
\`\`\`

Revisa la autoría en \`LICENSE\` antes de publicarlo. Licencia MIT. ${manifest.features.docs ? "Hay detalles adicionales en `docs/`." : ""}
`;
}

function generatedCi(tests: boolean): string {
  return `name: CI
on:
  push:
  pull_request:
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
${tests ? "      - run: npm test\n" : ""}      - run: npm run build
`;
}

export function renderProjectFiles(manifest: ProjectManifest): GeneratedFile[] {
  const { tests, ci, docs } = manifest.features;
  const pkg = generatedPackage(tests, manifest.slug);
  const copyright = manifest.author || `Contribuyentes de ${manifest.name}`;
  const files: GeneratedFile[] = [
    file("package.json", JSON.stringify(pkg, null, 2) + "\n"),
    file("package-lock.json", packageLock(manifest.slug, tests)),
    file("tsconfig.json", JSON.stringify({ compilerOptions: { target: "ES2017", lib: ["dom", "dom.iterable", "esnext"], allowJs: false, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "react-jsx", incremental: true, plugins: [{ name: "next" }], paths: { "@/*": ["./*"] } }, include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"], exclude: ["node_modules"] }, null, 2) + "\n"),
    file("next.config.ts", `import type { NextConfig } from "next";\nconst config: NextConfig = { reactStrictMode: true, turbopack: { root: process.cwd() }, allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"] };\nexport default config;\n`),
    file("eslint.config.mjs", `import { defineConfig, globalIgnores } from "eslint/config";\nimport js from "@eslint/js";\nimport tseslint from "typescript-eslint";\nimport reactHooks from "eslint-plugin-react-hooks";\nimport globals from "globals";\nexport default defineConfig([\n  globalIgnores([".next/**", "next-env.d.ts"]),\n  js.configs.recommended,\n  ...tseslint.configs.recommended,\n  reactHooks.configs.flat.recommended,\n  { languageOptions: { globals: { ...globals.browser, ...globals.node } } }\n]);\n`),
    file("next-env.d.ts", `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// Generated by Next.js.\n`),
    file(".gitignore", "node_modules/\n.next/\nout/\n.vercel/\n.env*\n!.env.example\n*.tsbuildinfo\n.DS_Store\n"),
    file(".env.example", "# No se necesitan credenciales ni variables de entorno para este proyecto.\n"),
    file("README.md", readme(manifest)),
    file("LICENSE", `MIT License\n\nCopyright (c) 2026 ${copyright}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n`),
    file("lib/content.ts", contentModule(manifest)),
    file("app/layout.tsx", `import type { Metadata } from "next";\nimport { site } from "@/lib/content";\nimport "./globals.css";\n\nexport const metadata: Metadata = { title: site.name, description: site.description, icons: { icon: "/favicon.svg" } };\nexport default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {\n  return <html lang="es"><body>{children}</body></html>;\n}\n`),
    file("app/page.tsx", generatedPage(manifest)),
    file("app/globals.css", generatedCss(manifest)),
    file("app/api/health/route.ts", `import { NextResponse } from "next/server";\nimport { site } from "@/lib/content";\nexport const dynamic = "force-dynamic";\nexport function GET() {\n  return NextResponse.json({ status: "ok", service: site.slug, version: "0.1.0" }, { headers: { "Cache-Control": "no-store" } });\n}\n`),
    file("app/api/content/route.ts", `import { NextResponse } from "next/server";\nimport { site, works } from "@/lib/content";\nexport const dynamic = "force-dynamic";\nexport function GET() {\n  return NextResponse.json({ site, works }, { headers: { "Cache-Control": "no-store" } });\n}\n`),
    file("public/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#071523"/><circle cx="32" cy="32" r="18" fill="none" stroke="#79ddf7" stroke-width="2"/><circle cx="32" cy="32" r="6" fill="#79ddf7"/></svg>\n`)
  ];

  if (manifest.template === "creative-dashboard") files.push(file("components/creative-board.tsx", generatedBoard));
  if (tests) files.push(file("tests/content.test.ts", `import { describe, expect, it } from "vitest";\nimport { site, works } from "../lib/content";\n\ndescribe("contenido publicado", () => {\n  it("conserva la identidad y una colección explícita", () => {\n    expect(site.name.trim().length).toBeGreaterThan(2);\n    expect(site.description.trim().length).toBeGreaterThan(11);\n    expect(Array.isArray(works)).toBe(true);\n    expect(works.every((work) => !!work.id && !!work.title)).toBe(true);\n  });\n});\n`));
  if (ci) files.push(file(".github/workflows/ci.yml", generatedCi(tests)));
  if (docs) {
    files.push(file("docs/ARQUITECTURA.md", `# Arquitectura · ${manifest.name}\n\nNext.js App Router sirve la interfaz y dos endpoints de lectura. \`lib/content.ts\` es la fuente de contenido; no hay una base de datos ni escrituras remotas. ${manifest.template === "creative-dashboard" ? "Las tareas del tablero se guardan en localStorage del navegador con la clave versionada `azul-board:v1:`; exporta tus datos antes de borrar el navegador." : "La colección de obras comienza vacía para no atribuir piezas ficticias."}\n\nFlujo: edición de \`lib/content.ts\` → renderizado de \`app/page.tsx\` → \`GET /api/content\` reutiliza los mismos datos. \`GET /api/health\` permite comprobar disponibilidad. No hay secretos de servidor.\n`));
    files.push(file("docs/ACCESIBILIDAD.md", `# Accesibilidad\n\nSe incluyen regiones semánticas, enlace para saltar contenido, etiquetas de formulario, estados de foco visibles y \`prefers-reduced-motion\`. Se comprobó programáticamente el contraste de texto principal al generar el ZIP; **no** es una certificación WCAG. Antes de publicar tus obras, verifica textos alternativos, contraste de imágenes, zoom al 200 %, teclado y lector de pantalla con el contenido real.\n`));
    files.push(file("docs/DESPLIEGUE.md", `# Despliegue\n\n1. Instala Node.js 22.13+ y ejecuta \`npm ci\`.\n2. Ejecuta \`npm run lint && npm run typecheck${tests ? " && npm test" : ""} && npm run build\`.\n3. Para Vercel, importa este repositorio como proyecto Next.js (sin variables). Para Node, ejecuta \`npm start\` tras el build.\n4. Comprueba \`/api/health\` y \`/api/content\` en la URL publicada.\n\nGitHub Pages solo sirve estáticos, **no** ejecuta estas rutas. No marques la aplicación full-stack como desplegada allí.\n`));
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}
