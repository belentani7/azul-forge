import type { ProjectInput } from "./schema";
import { composeProject } from "./composer";
import { renderProjectFiles } from "./renderer";
import { evaluateQuality } from "./quality";
import { renderPreviewHtml } from "./preview";
import type { GeneratedProject } from "./types";

export function createProject(input: ProjectInput): GeneratedProject {
  const manifest = composeProject(input);
  const files = renderProjectFiles(manifest);
  return { manifest, files, quality: evaluateQuality(manifest, files), previewHtml: renderPreviewHtml(manifest) };
}
