# AZUL FORGE · alcance de producto

Fuente de intención: [`aaa.txt`](../aaa.txt), commit inicial `0fe2a2c`. Ese archivo es una especificación, no código ejecutable.

## Entregable

Estudio web local-first para crear **tres bases distintas**: portfolio artístico, galería digital y tablero creativo. Un formulario configura identidad y dirección visual; el servidor valida y genera archivos reales, calcula controles automáticos y entrega un ZIP. El explorador permite leer, buscar, copiar y descargar cada archivo; una vista aislada muestra el diseño derivado de la misma configuración. El borrador se guarda únicamente en este navegador.

## Contrato funcional

- `GET /api/health`, `GET /api/templates`, `GET /api/templates/[slug]`.
- `POST /api/projects/generate` devuelve manifiesto, código, vista y comprobaciones; `POST /api/projects/validate` recalcula controles; `POST /api/projects/export` crea el ZIP del mismo input. Ningún endpoint afirma guardar proyectos en servidor.
- Los ZIP incluyen una aplicación Next.js con páginas reales y endpoints de lectura, instalación reproducible, metadatos, licencia, documentación y, cuando se seleccionen, tests y CI. El tablero guarda tareas en el navegador, **no** en una base de datos remota.
- Las plantillas no inventan obras, clientes ni métricas: comienzan vacías y enseñan cómo aportar contenido. El indicador de calidad mide presencia de archivos y propiedades comprobables; no certifica seguridad o accesibilidad.

## Límites conscientes

Sin cuentas, pagos, publicación automática a GitHub, IA externa, persistencia remota, conectores en tiempo de ejecución ni base de datos: nada de ello es necesario para generar y exportar código. Un deploy en GitHub Pages no ejecuta Route Handlers de Next.js; para la aplicación completa se usa Vercel u otro hosting Node.js. La vista de estudio no ejecuta el código generado: usa un iframe sin scripts ni acceso al origen.

## Criterios de aceptación

1. Entradas inválidas devuelven errores útiles sin generar archivos ni ejecutar código del usuario.
2. Cada plantilla produce código diferente, instalación reproducible, backend de lectura real y ZIP seguro; el tablero permite crear, completar y eliminar tareas locales.
3. Las opciones tests/CI/docs cambian realmente los archivos entregados; la puntuación se deriva de comprobaciones visibles.
4. El flujo principal funciona con teclado, focus visible y movimiento reducido; los datos visibles no son ejemplos presentados como reales.
5. Lint, TypeScript, tests, build y pruebas HTTP/ZIP pasan antes de publicar o subir una copia versionada a Drive.
