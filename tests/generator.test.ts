import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { projectSchema } from "@/lib/generator/schema";
import { slugify, composeProject } from "@/lib/generator/composer";
import { createProject } from "@/lib/generator/project";
import { renderPreviewHtml } from "@/lib/generator/preview";
import { buildZip } from "@/lib/generator/zip";
import { validInput } from "./fixtures";

describe("validación y composición", () => {
  it("acepta una configuración explícita y rechaza propiedades no admitidas", () => {
    expect(projectSchema.safeParse(validInput).success).toBe(true);
    expect(projectSchema.safeParse({ ...validInput, token: "secret" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validInput, template: "untrusted" }).success).toBe(false);
  });

  it("rechaza HTML, controles y nombres o descripciones excesivos", () => {
    expect(projectSchema.safeParse({ ...validInput, name: "<script>alert(1)</script>" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validInput, description: "Hola\nMundo <img>" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validInput, description: "a".repeat(321) }).success).toBe(false);
  });

  it("crea slugs seguros, acotados y estables sin usar una ruta suministrada", () => {
    expect(slugify("Áurea & Ciudad 3D")).toBe("aurea-ciudad-3d");
    expect(slugify("../../etc/passwd")).toBe("etc-passwd");
    expect(slugify("CON")).toBe("proyecto-con");
    expect(slugify("東京")).toMatch(/^proyecto-[a-f0-9]{8}$/);
    expect(slugify("a".repeat(100))).toHaveLength(48);
  });

  it("compone un manifiesto determinista para las mismas entradas", () => {
    const one = composeProject(validInput);
    const two = composeProject(validInput);
    expect(one).toEqual(two);
    expect(one.id).toMatch(/^proj_[a-f0-9]{16}$/);
    expect(one.slug).toBe("museo-azul");
  });
});

describe("generación de código y controles", () => {
  it.each(["art-portfolio", "visual-gallery", "creative-dashboard"] as const)(
    "genera una app real y diferente para %s",
    (template) => {
      const project = createProject({ ...validInput, template });
      const paths = project.files.map((file) => file.path);
      expect(paths).toEqual(expect.arrayContaining([
        "package.json", "package-lock.json", "README.md", "LICENSE", ".gitignore",
        ".env.example", "tsconfig.json", "eslint.config.mjs", "app/layout.tsx",
        "app/page.tsx", "app/globals.css", "app/api/health/route.ts",
        "app/api/content/route.ts", "lib/content.ts", "public/favicon.svg"
      ]));
      expect(new Set(paths).size).toBe(paths.length);
      expect(project.files.find((file) => file.path === "app/page.tsx")?.content).toContain(
        template === "creative-dashboard" ? "CreativeBoard" : "works"
      );
      expect(project.files.find((file) => file.path === "app/api/content/route.ts")?.content).toContain("NextResponse.json");
      expect(project.quality.checks.every((check) => check.passed || !check.applicable)).toBe(true);
      expect(project.quality.score).toBe(100);
      expect(project.previewHtml).toContain("Museo Azul");
      expect(project.previewHtml).toContain("Una galería digital");
    }
  );

  it("las opciones cambian los archivos, dependencias y controles, sin fingir tests", () => {
    const project = createProject({
      ...validInput,
      features: { ...validInput.features, tests: false, ci: false, docs: false }
    });
    const paths = project.files.map((file) => file.path);
    expect(paths.some((path) => path.startsWith("tests/") || path.startsWith("docs/") || path.startsWith(".github/"))).toBe(false);
    expect(JSON.parse(project.files.find((file) => file.path === "package.json")!.content).scripts.test).toBeUndefined();
    expect(project.quality.checks.find((check) => check.id === "tests")?.applicable).toBe(false);
    expect(project.quality.score).toBe(100);
  });

  it("no inventa obras ni estadísticas: la colección comienza vacía", () => {
    const project = createProject(validInput);
    expect(project.files.find((file) => file.path === "lib/content.ts")?.content).toContain("works: Work[] = []");
    expect(project.previewHtml).toContain("Sin obras todavía");
    expect(project.quality.method).toContain("automátic");
  });

  it("escapa valores incluso si se invoca la vista fuera del validador", () => {
    const manifest = composeProject(validInput);
    const html = renderPreviewHtml({ ...manifest, description: "<script>alert('x')</script>" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("src=\"http");
  });

  it("empaqueta exactamente los archivos bajo un único directorio seguro", async () => {
    const project = createProject(validInput);
    const archive = await JSZip.loadAsync(await buildZip(project.files, project.manifest.slug));
    const entries = Object.keys(archive.files).filter((path) => !archive.files[path].dir);
    expect(entries).toHaveLength(project.files.length);
    expect(entries.every((entry) => entry.startsWith("museo-azul/") && !entry.includes("../"))).toBe(true);
    expect(await archive.file("museo-azul/README.md")?.async("string")).toContain("Museo Azul");
    await expect(buildZip([{ path: "../escape", content: "x", language: "text" }], "museo-azul")).rejects.toThrow();
  });
});
