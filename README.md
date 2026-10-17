# AZUL FORGE

Un estudio local-first que convierte una configuración creativa en **código Next.js exportable**. Parte de [`aaa.txt`](./aaa.txt), la especificación original; el ZIP inicial en Drive contenía solo ese archivo, no una aplicación previa.

## Qué funciona

- Tres bases distintas: **portfolio artístico**, **galería visual** y **tablero creativo**.
- Configuración de identidad, paleta, modo claro/oscuro y módulos opcionales de tests, CI y documentación.
- Generación y validación en el servidor; explorador de archivos, vista de diseño aislada y exportación ZIP.
- Cada ZIP incluye `package-lock.json`, rutas `/api/health` y `/api/content`, instrucciones y un proyecto instalable con `npm ci`. El tablero permite crear, completar y borrar tareas guardadas en **localStorage**, sin pretender que exista persistencia remota.
- Las colecciones comienzan vacías. No se atribuyen obras, clientes ni estadísticas ficticias.

## Desarrollo

Requiere Node.js 22.13+ y npm.

```bash
npm ci
npm run dev
```

Abre `http://localhost:3000`. Para verificar el estudio:

```bash
npm run verify
```

`verify` ejecuta ESLint, TypeScript, Vitest y el build de producción. Las pruebas HTTP, los ZIP exportados y las tres apps generadas también se comprobaron mediante instalación, tests y compilación independientes. Para actualizar las dependencias fijadas de los proyectos exportados tras cambiar `lib/generator/versions.ts`:

```bash
node --experimental-strip-types scripts/refresh-lockfiles.mjs
```

## API

| Ruta | Método | Función |
| --- | --- | --- |
| `/api/health` | GET | Salud del estudio |
| `/api/templates` | GET | Catálogo de bases |
| `/api/templates/:slug` | GET | Detalle de una base |
| `/api/projects/generate` | POST | Manifiesto, archivos, vista y controles |
| `/api/projects/validate` | POST | Controles de la configuración |
| `/api/projects/export` | POST | ZIP de la configuración |

Los tres POST aceptan `application/json` con este contrato (máximo 16 KB):

```json
{
  "name": "Museo Azul",
  "description": "Un archivo de obras originales con contexto editorial.",
  "author": "Equipo Museo Azul",
  "template": "visual-gallery",
  "theme": "nocturne",
  "features": {
    "darkMode": true,
    "generative": true,
    "tests": true,
    "ci": true,
    "docs": true
  }
}
```

`theme` admite `nocturne`, `cerulean` y `paper`. `template` admite `art-portfolio`, `visual-gallery` y `creative-dashboard`. Las peticiones inválidas devuelven errores por campo; la exportación nunca evalúa código suministrado por el cliente.

## Arquitectura y límites

App Router, TypeScript, Zod, JSZip y Vitest. La fuente generadora está en `lib/generator/`, la UI en `components/forge-studio.tsx`, y los Route Handlers en `app/api/`. El borrador del estudio permanece en el navegador. La vista previa es un iframe **sin scripts ni acceso al origen**: representa el diseño, no ejecuta el proyecto generado. El índice de calidad verifica estructura y contraste principal, **no certifica** accesibilidad, seguridad ni comportamiento con contenido añadido después.

Vercel u otro hosting compatible con Next.js puede ejecutar estudio y aplicaciones exportadas. **GitHub Pages no ejecuta Route Handlers**; publicar solo estáticos allí eliminaría el backend. Consulta [`docs/PRODUCTO.md`](./docs/PRODUCTO.md) para el alcance y criterios de aceptación.
