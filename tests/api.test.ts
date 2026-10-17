import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { GET as health } from "@/app/api/health/route";
import { GET as listTemplates } from "@/app/api/templates/route";
import { GET as oneTemplate } from "@/app/api/templates/[slug]/route";
import { POST as generate } from "@/app/api/projects/generate/route";
import { POST as validate } from "@/app/api/projects/validate/route";
import { POST as exportProject } from "@/app/api/projects/export/route";
import { createProject } from "@/lib/generator/project";
import { validInput } from "./fixtures";

function request(data: unknown, contentType = "application/json") {
  return new Request("http://localhost:3000/api/projects/generate", {
    method: "POST", headers: { "Content-Type": contentType }, body: JSON.stringify(data)
  });
}

describe("rutas públicas", () => {
  it("expone salud, catálogo y detalle con 404 para plantillas desconocidas", async () => {
    expect((await health()).status).toBe(200);
    const catalog = await (await listTemplates()).json();
    expect(catalog.templates).toHaveLength(3);
    const found = await oneTemplate(new Request("http://localhost"), { params: Promise.resolve({ slug: "visual-gallery" }) });
    expect((await found.json()).template.slug).toBe("visual-gallery");
    const missing = await oneTemplate(new Request("http://localhost"), { params: Promise.resolve({ slug: "inexistente" }) });
    expect(missing.status).toBe(404);
  });

  it("rechaza cabeceras, JSON, campos y tamaño inválidos antes de generar", async () => {
    expect((await generate(request(validInput, "text/plain"))).status).toBe(415);
    expect((await generate(new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }))).status).toBe(400);
    const wrong = await generate(request({ ...validInput, extra: "no permitido" }));
    expect(wrong.status).toBe(400);
    expect((await wrong.json()).issues.length).toBeGreaterThan(0);
    const tooLong = request({ ...validInput, description: "A".repeat(17_000) });
    expect((await generate(tooLong)).status).toBe(413);
    const stream = new ReadableStream<Uint8Array>({ start(controller) {
      controller.enqueue(new Uint8Array(20_000)); controller.close();
    } });
    const streamed = new Request("http://localhost", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half"
    } as RequestInit & { duplex: string });
    expect((await generate(streamed)).status).toBe(413);
  });

  it("genera, valida y exporta exactamente el mismo conjunto de archivos", async () => {
    const generated = await generate(request(validInput));
    expect(generated.status).toBe(200);
    expect(generated.headers.get("cache-control")).toBe("no-store");
    const project = await generated.json();
    const checked = await (await validate(request(validInput))).json();
    expect(checked.slug).toBe(project.manifest.slug);
    expect(checked.quality).toEqual(project.quality);
    const archiveResponse = await exportProject(request(validInput));
    expect(archiveResponse.headers.get("content-type")).toBe("application/zip");
    expect(archiveResponse.headers.get("content-disposition")).toContain('filename="museo-azul.zip"');
    const archive = await JSZip.loadAsync(await archiveResponse.arrayBuffer());
    const files = Object.keys(archive.files).filter((path) => !archive.files[path].dir);
    expect(files).toHaveLength(project.files.length);
    for (const file of project.files) {
      expect(await archive.file(`museo-azul/${file.path}`)?.async("string")).toBe(file.content);
    }
  });

  it("mantiene package.json y lockfile sincronizados con las dos combinaciones de tests", () => {
    for (const tests of [true, false]) {
      const project = createProject({ ...validInput, features: { ...validInput.features, tests } });
      const pkg = JSON.parse(project.files.find((file) => file.path === "package.json")!.content);
      const lock = JSON.parse(project.files.find((file) => file.path === "package-lock.json")!.content);
      expect(lock.name).toBe(pkg.name);
      expect(lock.packages[""].name).toBe(pkg.name);
      expect(lock.packages[""].dependencies).toEqual(pkg.dependencies);
      expect(lock.packages[""].devDependencies).toEqual(pkg.devDependencies);
      expect(pkg.scripts.test === undefined).toBe(!tests);
    }
  });
});
