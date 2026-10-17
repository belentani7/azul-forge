# Guía de AZUL FORGE

## Arquitectura del generador

| Módulo               | Responsabilidad                                                    |
| -------------------- | ------------------------------------------------------------------ |
| **Studio UI**        | Formulario, estado, borradores, pestañas, acciones                  |
| **Template Registry**| Catálogo de plantillas con estructura y highlights                  |
| **Composer**         | Entrada → manifest determinista (seed = hash(slug:tema:plantilla))  |
| **File Renderer**    | Construye el set de archivos + preview.html autocontenido           |
| **Quality Engine**   | Checklist 0–100: docs (30) + código (20) + tests (15) + CI (10) + SEO (15) + a11y (10) |
| **Exporter**         | JSZip en cliente y `POST /api/projects/:id/export` en servidor      |

## Generación determinista

- `slug = slugify(nombre)`
- `seed = hashSeed(slug:templateId:themeId)`
- `mulberry32(seed)` para cualquier valor procedimental
- Mismo formulario ⇒ mismos archivos byte a byte

## Persistencia (MVP)

Sin base de datos: los proyectos viven en un `Map` en memoria del proceso Next.js y como
copia en `localStorage` (`azul-forge:last-result`) para sobrevivir recargas. Para producción
multi-instancia, sustituir el store por una base de datos (la interfaz `storeProject/getProject`
es el punto de sustitución).

## Estados del estudio

`idle → validating → generating → generated | error | incomplete | low-quality | zip-ready`

## Atajos

- `Ctrl/Cmd + K` — buscar archivos en el árbol

## Accesibilidad

- Skip-link «Saltar al contenido» en layout generado y app.
- `prefers-reduced-motion` desactiva el fondo Blue Field y las animaciones.
- Semántica: landmarks, `aria-live` en estados, roles tablist/tabpanel, switch con `aria-checked`.
