import { generatedCss } from "./source";
import type { ProjectManifest } from "./types";

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function renderPreviewHtml(manifest: ProjectManifest): string {
  const name = escapeHtml(manifest.name);
  const description = escapeHtml(manifest.description);
  const css = generatedCss(manifest);
  const isBoard = manifest.template === "creative-dashboard";
  const isGallery = manifest.template === "visual-gallery";
  const collection = isBoard
    ? `<section class="board" id="coleccion" aria-label="Vista del tablero"><div class="board-top"><h2>En curso</h2><small>0 pendientes · 0 en total</small></div><p class="board-note">Tus entradas viven solo en este navegador. No se envían a un servidor.</p><p class="empty"><strong>No hay tareas todavía.</strong>El formulario para añadir tareas estará disponible en el proyecto exportado.</p></section>`
    : `<section id="coleccion"><div class="section-head"><div><p class="overline">01 / ${isGallery ? "EL ARCHIVO" : "SELECCIÓN"}</p><h2>${isGallery ? "La colección" : "Obras"}</h2></div><small>0 ${isGallery ? "piezas" : "obras"} publicadas</small></div><div class="${isGallery ? "gallery-grid" : "work-list"}"><div class="empty"><strong>Sin obras todavía.</strong>Añade piezas reales en <code>lib/content.ts</code> después de exportar.</div></div></section>`;
  const hero = isBoard
    ? `<section class="board-shell"><p class="overline">ESTUDIO / ORGANIZACIÓN PERSONAL</p><h1 class="display">${name}</h1><p class="intro">${description}</p>${collection}</section>`
    : isGallery
      ? `<section class="gallery-heading"><p class="overline">ARCHIVO VISUAL / EDICIÓN ABIERTA</p><h1 class="display">${name}</h1><p class="intro">${description}</p></section>${collection}`
      : `<section class="hero-grid"><div><p class="overline">PORTFOLIO / PRÁCTICA CREATIVA</p><h1 class="display">${name}</h1><p class="intro">${description}</p><a class="text-link" href="#coleccion">Explorar el trabajo <span aria-hidden="true">↗</span></a></div><div class="hero-art" aria-hidden="true"><span class="art-label">Forma · luz · código</span></div></section>${collection}`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${name} · vista de diseño</title><style>${css}</style></head><body><div class="site-shell" id="inicio"><a class="skip-link" href="#contenido">Saltar al contenido</a><header class="site-header"><a class="wordmark" href="#inicio"><span aria-hidden="true"></span>${name}</a><nav aria-label="Navegación principal"><a href="#contenido">Inicio</a><a href="#coleccion">Colección</a></nav></header><main id="contenido">${hero}</main><footer class="site-footer"><span>${name} · ${new Date().getUTCFullYear()}</span><span>Hecho para mostrar trabajo real.</span></footer></div></body></html>`;
}
