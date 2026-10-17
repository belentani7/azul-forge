import JSZip from "jszip";
import type { GeneratedFile } from "./types";

const safeSegment = /^[a-zA-Z0-9._-]+$/;
const safeSlug = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/;

export async function buildZip(files: GeneratedFile[], slug: string): Promise<Buffer> {
  if (!safeSlug.test(slug)) throw new Error("Nombre de proyecto no válido para exportar.");
  if (files.length > 80) throw new Error("Demasiados archivos para exportar.");
  const zip = new JSZip();
  let bytes = 0;
  const paths = new Set<string>();
  for (const file of files) {
    const segments = file.path.split("/");
    if (!segments.every((segment) => safeSegment.test(segment) && segment !== "." && segment !== "..") || paths.has(file.path)) {
      throw new Error("Ruta de archivo no válida o repetida.");
    }
    paths.add(file.path);
    bytes += Buffer.byteLength(file.content, "utf8");
    if (bytes > 2_000_000) throw new Error("Proyecto demasiado grande para exportar.");
    zip.file(`${slug}/${file.path}`, file.content, { date: new Date("2026-01-01T00:00:00Z") });
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
}
