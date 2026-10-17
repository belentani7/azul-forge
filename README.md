# AZUL FORGE

**Generador de proyectos web con calidad de producción.**

AZUL FORGE transforma una descripción en una aplicación Next.js real: TypeScript estricto,
tests, CI de GitHub Actions, documentación, calidad verificada (0–100) y un `.zip` listo para
GitHub y Vercel. Sin plantillas vacías: el código generado es el producto.

---

## Propósito

Llevar un proyecto desde la idea hasta un repositorio publicable en cuatro pasos:

1. **Describe** tu proyecto (nombre, descripción, autor, plantilla, tema).
2. **Genera** el código con estructura profesional de estudio.
3. **Verifica** la calidad con el informe 0–100 (documentación, tests, CI, SEO, accesibilidad).
4. **Exporta** el `.zip`, súbelo a GitHub y despliega en Vercel.

## Características

- **3 plantillas reales**: Portfolio artístico, Galería visual, Dashboard creativo.
- **5 temas curados**: Deep Blue (identidad AZUL FORGE), Obsidian, Aurora, Ember, Paper.
- **Generación determinista**: mismo slug ⇒ mismo seed ⇒ mismos archivos.
- **Código generado real**: Next.js App Router, Route Handlers, Vitest, CI, docs/.
- **Motor de calidad**: checklist con puntuación 0–100 y recomendaciones accionables.
- **Exportación .zip** por cliente (JSZip) y por API (`POST /api/projects/:id/export`).
- **Estudio (studio)**: formulario con borradores locales, árbol de archivos, visor de
  código con resaltado y búsqueda, vista previa en vivo, panel de calidad e instrucciones
  de publicación en GitHub/Vercel.

## Instalación y ejecución

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Script              | Descripción                                      |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo                           |
| `npm run build`     | Build de producción                              |
| `npm start`         | Arranca el build de producción                   |
| `npm run lint`      | ESLint                                           |
| `npm run type-check`| TypeScript sin emitir                            |
| `npm test`          | Vitest (motor + UI)                              |
| `npm run ci`        | lint + type-check + test + build                 |

## API

| Método | Ruta                       | Descripción                                   |
| ------ | -------------------------- | --------------------------------------------- |
| GET    | `/api/health`              | Estado, versión y nº de plantillas            |
| GET    | `/api/templates`           | Catálogo de plantillas                        |
| GET    | `/api/templates/:id`       | Detalle de una plantilla                      |
| POST   | `/api/projects/generate`   | Genera proyecto → id, archivos, qualityScore  |
| POST   | `/api/projects/validate`   | Valida la entrada sin generar                 |
| GET    | `/api/projects/:id`        | Recupera un proyecto generado                 |
| POST   | `/api/projects/:id/export` | Descarga el proyecto como `.zip`              |

## Estructura

```
app/                  # Landing + estudio + rutas API (App Router)
components/           # landing · studio · ui
lib/
  generator/          # composer · renderer (preview.html) · archivos base
  templates/          # registro + constructores por plantilla
  quality/            # motor de calidad 0–100
  zip/                # exportador JSZip
  validations.ts      # esquemas Zod
  themes.ts           # 5 temas curados
tests/                # Vitest (motor de generación + UI)
docs/                 # guías del proyecto
```

## Despliegue (Vercel)

1. Sube este repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repo.
3. Framework **Next.js** detectado automáticamente → **Deploy**.

El workflow `.github/workflows/ci.yml` ejecuta lint, type-check, tests y build en cada push.

## Licencia

MIT — ver [LICENSE](./LICENSE).
