export type TemplateSlug = 'art-portfolio' | 'visual-gallery' | 'creative-dashboard';

export type ThemeSlug = 'deep-blue' | 'obsidian' | 'aurora' | 'ember' | 'paper';

export interface ProjectFeatures {
  tests: boolean;
  ci: boolean;
  docs: boolean;
  darkMode: boolean;
  generativeBackground: boolean;
}

export interface ProjectInput {
  name: string;
  description: string;
  author: string;
  templateId: string;
  themeId: string;
  features: ProjectFeatures;
}

export interface TemplateDef {
  id: string;
  name: string;
  slug: TemplateSlug;
  description: string;
  category: string;
  version: string;
  tags: string[];
  highlights: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface QualityCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface QualityReport {
  score: number;
  checks: QualityCheck[];
  recommendations: string[];
}

export interface ProjectManifest {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  createdAt: string;
  templateId: string;
  themeId: string;
  seed: number;
  features: ProjectFeatures;
}

export interface GeneratedProject {
  manifest: ProjectManifest;
  files: GeneratedFile[];
  fileMap: Record<string, string>;
  previewHtml: string;
}

export interface ThemeDef {
  id: ThemeSlug;
  name: string;
  description: string;
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  accentAlt: string;
  card: string;
  border: string;
  btnFg: string;
}

export type ValidationResponse =
  | { success: true; data: ProjectInput; issues?: undefined }
  | { success: false; data?: undefined; issues: string[] };

export interface ComposedProject {
  manifest: ProjectManifest;
  theme: ThemeDef;
  files: GeneratedFile[];
}
