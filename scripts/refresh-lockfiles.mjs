// Ejecutar con: node --experimental-strip-types scripts/refresh-lockfiles.mjs
// Regenera los dos lockfiles de las aplicaciones exportadas; no se ejecuta al generar proyectos.
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { generatedPackage } from "../lib/generator/versions.ts";

const output = join(process.cwd(), "lib/generator/lockfiles");
mkdirSync(output, { recursive: true });
for (const [tests, filename] of [[true, "with-tests.json"], [false, "without-tests.json"]]) {
  const directory = mkdtempSync(join(tmpdir(), "azul-lock-"));
  try {
    writeFileSync(join(directory, "package.json"), JSON.stringify(generatedPackage(tests, "azul-forge-starter"), null, 2));
    execFileSync("npm", ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: directory, stdio: "inherit" });
    const lock = JSON.parse(readFileSync(join(directory, "package-lock.json"), "utf8"));
    writeFileSync(join(output, filename), JSON.stringify(lock, null, 2) + "\n");
    console.log(`Actualizado ${filename}`);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
