import type { ProjectInput } from "./schema";

export type ProjectManifest = ProjectInput & {
  id: string;
  slug: string;
  templateName: string;
};

export type GeneratedFile = {
  path: string;
  content: string;
  language: string;
};

export type QualityCheck = {
  id: string;
  label: string;
  detail: string;
  weight: number;
  applicable: boolean;
  passed: boolean;
};

export type QualityReport = {
  score: number;
  passed: number;
  applicable: number;
  method: string;
  checks: QualityCheck[];
};

export type GeneratedProject = {
  manifest: ProjectManifest;
  files: GeneratedFile[];
  previewHtml: string;
  quality: QualityReport;
};
