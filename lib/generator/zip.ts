import JSZip from "jszip";
import type { GeneratedFile } from "./types";

const safeSegment = /^[a-zA-Z0-9._-]+$/;
const safeSlug = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/;
// Zip archives are commonly unpacked on Windows and macOS. Reject names that
// collide on case-insensitive filesystems or cannot be extracted on Windows.
const reservedDevice = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
function portableSegment(segment: string): boolean {
  return safeSegment.test(segment) && segment !== "." && segment !== ".." &&
    !segment.endsWith(".") && !reservedDevice.test(segment);
}

export async function buildZip(files: GeneratedFile[], slug: string): Promise<Buffer> {
  if (!safeSlug.test(slug) || reservedDevice.test(slug)) throw new Error("Nombre de proyecto no válido para exportar.");
  if (files.length > 80) throw new Error("Demasiados archivos para exportar.");
  const zip = new JSZip();
  let bytes = 0;
  const paths = new Set<string>();
  const directories = new Set<string>();
  for (const file of files) {
    const segments = file.path.split("/");
    const normalizedSegments = segments.map((segment) => segment.toLowerCase());
    const normalizedPath = normalizedSegments.join("/");
    if (!segments.every(portableSegment) || paths.has(normalizedPath) || directories.has(normalizedPath)) {
      throw new Error("Ruta de archivo no válida, incompatible o repetida.");
    }
    // A file must not also be a directory, even on case-insensitive filesystems.
    for (let depth = 1; depth < normalizedSegments.length; depth++) {
      const directory = normalizedSegments.slice(0, depth).join("/");
      if (paths.has(directory)) {
        throw new Error("Ruta de archivo incompatible con un directorio.");
      }
      directories.add(directory);
    }
    paths.add(normalizedPath);
    bytes += Buffer.byteLength(file.content, "utf8");
    if (bytes > 2_000_000) throw new Error("Proyecto demasiado grande para exportar.");
    zip.file(`${slug}/${file.path}`, file.content, { date: new Date("2026-01-01T00:00:00Z") });
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
}
