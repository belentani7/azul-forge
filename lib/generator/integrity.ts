import { createHash } from "node:crypto";
import type { GeneratedFile } from "./types";

// This script runs inside the ZIP without npm install or network.
const verifierScript = [
  'import { createHash } from "node:crypto";',
  'import { lstatSync, readFileSync } from "node:fs";',
  'import { dirname, resolve, sep } from "node:path";',
  'import { fileURLToPath } from "node:url";',
  '',
  'const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");',
  'const manifest = JSON.parse(readFileSync(resolve(root, "forge-integrity.json"), "utf8"));',
  'if (manifest.schema !== "azul-forge-integrity-v1" || !Array.isArray(manifest.files)) {',
  '  throw new Error("Unsupported project integrity manifest");',
  '}',
  'const checked = new Set();',
  'for (const item of manifest.files) {',
  '  if (typeof item.path !== "string" || !item.path.split("/").every(segment =>',
  '    segment !== "." && segment !== ".." && /^[a-zA-Z0-9._-]+$/.test(segment))) {',
  '    throw new Error("Unsafe integrity-manifest path");',
  '  }',
  '  if (checked.has(item.path)) throw new Error("Duplicate manifest path");',
  '  checked.add(item.path);',
  '  const target = resolve(root, ...item.path.split("/"));',
  '  if (!target.startsWith(root + sep)) throw new Error("Path escapes exported project");',
  '  const stat = lstatSync(target);',
  '  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Not a regular file: " + item.path);',
  '  const data = readFileSync(target);',
  '  const digest = createHash("sha256").update(data).digest("hex");',
  '  if (data.byteLength !== item.bytes || digest !== item.sha256) {',
  '    throw new Error("Integrity mismatch: " + item.path);',
  '  }',
  '}',
  'process.stdout.write("Verified " + checked.size + " original files (SHA-256).\\n");',
].join("\n") + "\n";

/**
 * Creates deterministic SHA-256 provenance for all generated files.
 * It detects accidental modifications, not authorship: the manifest is unsigned.
 */
export function attachIntegrityFiles(files: GeneratedFile[]): GeneratedFile[] {
  const metadataPaths = new Set(["forge-integrity.json", "tools/verify-integrity.mjs", "docs/integrity.md"]);
  if (files.some((file) => metadataPaths.has(file.path))) {
    throw new Error("Generated file collides with integrity metadata");
  }
  const extras: GeneratedFile[] = [
    { path: "tools/verify-integrity.mjs", content: verifierScript, language: "javascript" },
    {
      path: "docs/integrity.md",
      content: "# Comprobar el ZIP de AZUL FORGE\n\n" +
        "Tras extraerlo, ejecuta node tools/verify-integrity.mjs antes de editar el proyecto. " +
        "Compara SHA-256 y tamaño de los archivos originales, sin instalación ni red.\n\n" +
        "El manifiesto forge-integrity.json no está firmado: permite detectar cambios " +
        "accidentales, pero no demuestra autoría ni evita que un atacante sustituya también el manifiesto. " +
        "Tras modificar código o contenido, la verificación señalará esos archivos como cambiados.\n",
      language: "markdown",
    },
  ];
  const source = [...files, ...extras].sort((a, b) => a.path.localeCompare(b.path));
  const manifest = {
    schema: "azul-forge-integrity-v1",
    algorithm: "sha256",
    signed: false,
    files: source.map((file) => ({
      path: file.path,
      bytes: Buffer.byteLength(file.content, "utf8"),
      sha256: createHash("sha256").update(file.content, "utf8").digest("hex"),
    })),
  };
  return [
    ...source,
    { path: "forge-integrity.json", content: JSON.stringify(manifest, null, 2) + "\n", language: "json" },
  ].sort((a, b) => a.path.localeCompare(b.path));
}
