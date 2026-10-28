import { createHash } from "node:crypto";
import type { GeneratedFile } from "./types";

// This script runs inside the ZIP without npm install or network.
const verifierScript = [
  'import { createHash } from "node:crypto";',
  'import { lstatSync, readFileSync, readdirSync } from "node:fs";',
  'import { dirname, resolve, sep } from "node:path";',
  'import { fileURLToPath } from "node:url";',
  '',
  'const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");',
  'const manifest = JSON.parse(readFileSync(resolve(root, "forge-integrity.json"), "utf8"));',
  'if (!manifest || typeof manifest !== "object" || Array.isArray(manifest) ||',
  '    manifest.schema !== "azul-forge-integrity-v1" || manifest.algorithm !== "sha256" ||',
  '    manifest.signed !== false || !Array.isArray(manifest.files) || manifest.files.length < 2) {',
  '  throw new Error("Unsupported project integrity manifest");',
  '}',
  'const requiredPaths = new Set(["tools/verify-integrity.mjs", "integrity.md"]);',
  'const checked = new Set();',
  'const portablePaths = new Set();',
  'for (const item of manifest.files) {',
  '  if (!item || typeof item !== "object" || Array.isArray(item) ||',
  '      typeof item.path !== "string" || !item.path.split("/").every(segment =>',
  '    segment !== "." && segment !== ".." && !segment.endsWith(".") &&',
  '    !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\\..*)?$/i.test(segment) &&',
  '    /^[a-zA-Z0-9._-]+$/.test(segment))) {',
  '    throw new Error("Unsafe integrity-manifest path");',
  '  }',
  '  const portable = item.path.toLowerCase();',
  '  if (portablePaths.has(portable)) throw new Error("Case-insensitive duplicate manifest path");',
  '  portablePaths.add(portable);',
  '  if (checked.has(item.path)) throw new Error("Duplicate manifest path");',
  '  checked.add(item.path);',
  '  requiredPaths.delete(item.path);',
  '  const target = resolve(root, ...item.path.split("/"));',
  '  if (!target.startsWith(root + sep)) throw new Error("Path escapes exported project");',
  '  // Reject symlinked parent directories, not only a symlink at the final file.',
  '  let cursor = root;',
  '  for (const segment of item.path.split("/").slice(0, -1)) {',
  '    cursor = resolve(cursor, segment);',
  '    const parentStat = lstatSync(cursor);',
  '    if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) throw new Error("Unsafe parent directory: " + item.path);',
  '  }',
  '  const stat = lstatSync(target);',
  '  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Not a regular file: " + item.path);',
  '  const data = readFileSync(target);',
  '  const digest = createHash("sha256").update(data).digest("hex");',
  '  if (data.byteLength !== item.bytes || digest !== item.sha256) {',
  '    throw new Error("Integrity mismatch: " + item.path);',
  '  }',
  '}',
  'if (requiredPaths.size) throw new Error("Integrity manifest is missing required metadata files");',
  '// Detect extra files and directories, not only changes to listed file hashes.',
  'const expectedDirectories = new Set();',
  'for (const path of [...checked, "forge-integrity.json"]) {',
  '  const segments = path.split("/");',
  '  for (let depth = 1; depth < segments.length; depth++) {',
  '    expectedDirectories.add(segments.slice(0, depth).join("/"));',
  '  }',
  '}',
  'function verifyInventory(directory, relative = "") {',
  '  for (const entry of readdirSync(directory, { withFileTypes: true })) {',
  '    const path = relative ? relative + "/" + entry.name : entry.name;',
  '    if (entry.isSymbolicLink()) throw new Error("Unexpected symbolic link: " + path);',
  '    if (entry.isDirectory()) {',
  '      if (!expectedDirectories.has(path)) throw new Error("Unlisted directory: " + path);',
  '      verifyInventory(resolve(directory, entry.name), path);',
  '    } else if (!entry.isFile() || (path !== "forge-integrity.json" && !checked.has(path))) {',
  '      throw new Error("Unlisted file: " + path);',
  '    }',
  '  }',
  '}',
  'verifyInventory(root);',
  'process.stdout.write("Verified " + checked.size + " original files (SHA-256).\\n");',
].join("\n") + "\n";

/**
 * Creates deterministic SHA-256 provenance for all generated files.
 * It detects accidental modifications, not authorship: the manifest is unsigned.
 */
export function attachIntegrityFiles(files: GeneratedFile[]): GeneratedFile[] {
  const metadataPaths = new Set(["forge-integrity.json", "tools/verify-integrity.mjs", "integrity.md"]);
  if (files.some((file) => metadataPaths.has(file.path))) {
    throw new Error("Generated file collides with integrity metadata");
  }
  const extras: GeneratedFile[] = [
    { path: "tools/verify-integrity.mjs", content: verifierScript, language: "javascript" },
    {
      path: "integrity.md",
      content: "# Comprobar el ZIP de AZUL FORGE\n\n" +
        "Tras extraerlo, ejecuta node tools/verify-integrity.mjs antes de instalar dependencias, generar archivos o editar el proyecto. " +
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
