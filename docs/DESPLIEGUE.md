# Despliegue

## Vercel

1. `git push` del repositorio a GitHub.
2. [vercel.com/new](https://vercel.com/new) → importar el repo.
3. Framework **Next.js** (autodetectado) → **Deploy**.
4. Variables de entorno: ninguna obligatoria (MVP sin base de datos).

## GitHub Actions

`.github/workflows/ci.yml` ejecuta en cada push a `main` y en cada PR:

- `npm run lint`
- `npm run type-check`
- `npm test`
- `npm run build`

## Estructura generada dentro del ZIP

```
{slug}/
  README.md            # instrucciones de git init + push
  LICENSE              # MIT
  package.json
  tsconfig.json
  next.config.mjs
  .env.example
  app/                 # layout, página, globals.css, api/health, api/content
  components/          # de la plantilla elegida
  lib/                 # types, utils, data
  tests/               # vitest
  .github/workflows/   # ci.yml
  docs/                # ARQUITECTURA, ACCESIBILIDAD, DESPLIEGUE
  preview.html         # vista previa autocontenida
```
