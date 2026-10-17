import { createHash } from "node:crypto";
import type { ProjectInput } from "./schema";
import { getTemplate } from "./templates";
import type { ProjectManifest } from "./types";

const reservedNames = new Set(["con", "prn", "aux", "nul", "com1", "com2", "lpt1", "lpt2"]);

export function slugify(value: string): string {
  const slug = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 48).replace(/-+$/g, "");
  if (!slug) return `proyecto-${createHash("sha256").update(value).digest("hex").slice(0, 8)}`;
  return reservedNames.has(slug) ? `proyecto-${slug}` : slug;
}

export function composeProject(input: ProjectInput): ProjectManifest {
  const template = getTemplate(input.template);
  if (!template) throw new Error("Plantilla no disponible.");
  const normalized = { ...input, name: input.name.trim(), description: input.description.trim(), author: input.author.trim() };
  const hash = createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 16);
  return { ...normalized, id: `proj_${hash}`, slug: slugify(normalized.name), templateName: template.name };
}
