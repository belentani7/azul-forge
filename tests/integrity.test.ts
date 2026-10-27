import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { createProject } from "@/lib/generator/project";
import { validInput } from "./fixtures";

describe("offline generated-project integrity", () => {
  it("produces stable SHA-256 hashes and inventory for the complete export", () => {
    const first = createProject(validInput);
    const second = createProject(validInput);
    expect(first.files).toEqual(second.files);
    const raw = first.files.find((file) => file.path === "forge-integrity.json");
    expect(raw).toBeDefined();
    const manifest = JSON.parse(raw!.content);
    expect(manifest.schema).toBe("azul-forge-integrity-v1");
    expect(manifest.signed).toBe(false);
    expect(manifest.files).toHaveLength(first.files.length - 1);
    expect(new Set(manifest.files.map((entry: { path: string }) => entry.path)).size).toBe(manifest.files.length);
    for (const item of manifest.files as { path: string; bytes: number; sha256: string }[]) {
      const generated = first.files.find((file) => file.path === item.path);
      expect(generated).toBeDefined();
      expect(item.bytes).toBe(Buffer.byteLength(generated!.content, "utf8"));
      expect(item.sha256).toBe(createHash("sha256").update(generated!.content, "utf8").digest("hex"));
    }
  });

  it("verifies an extracted project without dependencies and rejects tampering", () => {
    const files = createProject(validInput).files;
    const root = mkdtempSync(join(tmpdir(), "azul-forge-integrity-"));
    try {
      for (const file of files) {
        const location = join(root, ...file.path.split("/"));
        mkdirSync(dirname(location), { recursive: true });
        writeFileSync(location, file.content, "utf8");
      }
      const script = join(root, "tools", "verify-integrity.mjs");
      const verified = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
      expect(verified.status, verified.stderr).toBe(0);
      expect(verified.stdout).toContain("Verified ");
      writeFileSync(join(root, "app", "page.tsx"), "modified after export", "utf8");
      const changed = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
      expect(changed.status).not.toBe(0);
      expect(changed.stderr).toContain("Integrity mismatch");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });


  it("rejects contradictory integrity metadata and incomplete inventories", () => {
    const files = createProject(validInput).files;
    const root = mkdtempSync(join(tmpdir(), "azul-forge-metadata-"));
    try {
      for (const file of files) {
        const location = join(root, ...file.path.split("/"));
        mkdirSync(dirname(location), { recursive: true });
        writeFileSync(location, file.content, "utf8");
      }
      const manifestPath = join(root, "forge-integrity.json");
      const original = JSON.parse(files.find((file) => file.path === "forge-integrity.json")!.content);
      const script = join(root, "tools", "verify-integrity.mjs");
      const cases = [
        { manifest: { ...original, algorithm: "md5" }, error: "Unsupported project integrity manifest" },
        { manifest: { ...original, signed: true }, error: "Unsupported project integrity manifest" },
        { manifest: { ...original, files: [] }, error: "Unsupported project integrity manifest" },
        {
          manifest: { ...original, files: original.files.filter((item: { path: string }) => item.path !== "integrity.md") },
          error: "Integrity manifest is missing required metadata files",
        },
      ];
      for (const { manifest, error } of cases) {
        writeFileSync(manifestPath, JSON.stringify(manifest), "utf8");
        const result = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain(error);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects case-folded duplicates and reserved paths in the offline verifier", () => {
    const files = createProject(validInput).files;
    const root = mkdtempSync(join(tmpdir(), "azul-forge-paths-"));
    try {
      for (const file of files) {
        const location = join(root, ...file.path.split("/"));
        mkdirSync(dirname(location), { recursive: true });
        writeFileSync(location, file.content, "utf8");
      }
      const manifestPath = join(root, "forge-integrity.json");
      const original = JSON.parse(files.find(file => file.path === "forge-integrity.json")!.content);
      const script = join(root, "tools", "verify-integrity.mjs");
      for (const badPath of ["CON.txt", "app/page.tsx."]) {
        const altered = { ...original, files: [...original.files, { ...original.files[0], path: badPath }] };
        writeFileSync(manifestPath, JSON.stringify(altered));
        const result = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain("Unsafe integrity-manifest path");
      }
      const originalEntry = original.files.find((item: { path: string }) => /[a-z]/.test(item.path))!;
      const duplicate = { ...original, files: [...original.files, { ...originalEntry, path: originalEntry.path.toUpperCase() }] };
      writeFileSync(manifestPath, JSON.stringify(duplicate));
      const result = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("Case-insensitive duplicate manifest path");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects extra files and directories absent from the exported manifest", () => {
    const files = createProject(validInput).files;
    const root = mkdtempSync(join(tmpdir(), "azul-forge-inventory-"));
    try {
      for (const file of files) {
        const location = join(root, ...file.path.split("/"));
        mkdirSync(dirname(location), { recursive: true });
        writeFileSync(location, file.content, "utf8");
      }
      const script = join(root, "tools", "verify-integrity.mjs");
      const clean = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
      expect(clean.status, clean.stderr).toBe(0);

      const extraFile = join(root, "app", "hidden.tsx");
      writeFileSync(extraFile, "unexpected code", "utf8");
      const injected = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
      expect(injected.status).not.toBe(0);
      expect(injected.stderr).toContain("Unlisted file: app/hidden.tsx");
      rmSync(extraFile);

      mkdirSync(join(root, "app", "empty-unlisted"));
      const extraDirectory = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
      expect(extraDirectory.status).not.toBe(0);
      expect(extraDirectory.stderr).toContain("Unlisted directory: app/empty-unlisted");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not introduce optional docs or tests directories when disabled", () => {
    const project = createProject({
      ...validInput,
      features: { ...validInput.features, docs: false, tests: false, ci: false },
    });
    const paths = project.files.map((file) => file.path);
    expect(paths).toContain("forge-integrity.json");
    expect(paths).toContain("tools/verify-integrity.mjs");
    expect(paths).not.toContain("docs/integrity.md");
    expect(paths.some((path) => path.startsWith("docs/") || path.startsWith("tests/"))).toBe(false);
  });
});
