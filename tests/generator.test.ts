import { describe, expect, it } from 'vitest';
import { composeProject } from '@/lib/generator/composer';
import { renderProject } from '@/lib/generator/renderer';
import { evaluateProject } from '@/lib/quality/engine';
import { DEFAULT_INPUT } from '@/lib/validations';
import type { ProjectInput } from '@/lib/types';

function build(input: Partial<ProjectInput> = {}) {
  const full: ProjectInput = {
    ...DEFAULT_INPUT,
    ...input,
    features: { ...DEFAULT_INPUT.features, ...input.features },
  };
  return renderProject(composeProject(full));
}

describe('composer + renderer', () => {
  it('genera un proyecto determinista', () => {
    const a = build({ name: 'Estudio Determinista' });
    const b = build({ name: 'Estudio Determinista' });
    const pathsA = a.files.map((file) => file.path).join(',');
    const pathsB = b.files.map((file) => file.path).join(',');
    expect(pathsA).toBe(pathsB);
    expect(a.manifest.seed).toBe(b.manifest.seed);
    expect(a.manifest.slug).toBe('estudio-determinista');
  });

  it('incluye la estructura base obligatoria', () => {
    const project = build();
    const paths = project.files.map((file) => file.path);
    for (const required of [
      'README.md',
      'LICENSE',
      'package.json',
      'tsconfig.json',
      'next.config.mjs',
      '.gitignore',
      '.env.example',
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css',
      'app/api/health/route.ts',
      'app/api/content/route.ts',
      'lib/types.ts',
      'lib/utils.ts',
      'lib/data.ts',
      'components',
      'tests/lib/utils.test.ts',
      '.github/workflows/ci.yml',
      'docs/ARQUITECTURA.md',
      'docs/ACCESIBILIDAD.md',
      'docs/DESPLIEGUE.md',
      'preview.html',
    ]) {
      if (required === 'components') {
        expect(paths.some((path) => path.startsWith('components/'))).toBe(true);
      } else {
        expect(paths).toContain(required);
      }
    }
  });

  it('cada plantilla genera sus componentes propios', () => {
    const gallery = build({ templateId: 'visual-gallery', name: 'Galería Prueba' });
    expect(gallery.fileMap['components/ExhibitionFilter.tsx']).toBeTruthy();
    expect(gallery.fileMap['components/ExhibitionFilter.tsx']).toContain("'use client'");

    const dashboard = build({ templateId: 'creative-dashboard', name: 'Panel Prueba' });
    expect(dashboard.fileMap['components/MetricCards.tsx']).toBeTruthy();
    expect(dashboard.fileMap['components/ProjectTable.tsx']).toContain('<table');
  });

  it('respeta las features desactivadas', () => {
    const project = build({
      features: { tests: false, ci: false, docs: false, darkMode: false, generativeBackground: false },
      name: 'Proyecto Minimal',
    });
    const paths = project.files.map((file) => file.path);
    expect(paths).not.toContain('.github/workflows/ci.yml');
    expect(paths).not.toContain('tests/lib/utils.test.ts');
    expect(project.fileMap['components/BlueField.tsx']).toBeUndefined();
    expect(project.fileMap['app/layout.tsx']).not.toContain('dangerouslySetInnerHTML');
  });

  it('el preview.html es autocontenido', () => {
    const project = build();
    expect(project.previewHtml).toContain('<!DOCTYPE html>');
    expect(project.previewHtml).toContain(project.manifest.name);
    expect(project.previewHtml).toContain('lang="es"');
    expect(project.previewHtml).not.toContain('http://');
  });
});

describe('quality engine', () => {
  it('puntúa 100 un proyecto completo', () => {
    const project = build();
    const report = evaluateProject(project);
    expect(report.score).toBe(100);
    expect(report.checks.every((check) => check.passed)).toBe(true);
  });

  it('baja la nota sin tests ni CI', () => {
    const project = build({
      features: { tests: false, ci: false, docs: true, darkMode: true, generativeBackground: true },
    });
    const report = evaluateProject(project);
    expect(report.score).toBeLessThan(85);
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.checks.find((check) => check.id === 'tests')?.passed).toBe(false);
  });

  it('marca accesibilidad y SEO', () => {
    const project = build();
    const report = evaluateProject(project);
    const ids = report.checks.map((check) => check.id);
    expect(ids).toContain('seo-meta');
    expect(ids).toContain('a11y-skip');
  });
});
