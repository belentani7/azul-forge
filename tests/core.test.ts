import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, THEMES, getTheme, getThemeOrDefault } from '@/lib/themes';
import { TEMPLATES, getTemplate, getTemplateOrDefault } from '@/lib/templates/registry';
import { DEFAULT_INPUT, validateProjectInput } from '@/lib/validations';

describe('temas', () => {
  it('incluye 5 temas con tokens completos', () => {
    expect(THEMES).toHaveLength(5);
    for (const theme of THEMES) {
      expect(theme.bg).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.fg).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.accentAlt).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.btnFg).toBeTruthy();
    }
  });

  it('deep-blue es el tema por defecto', () => {
    expect(DEFAULT_THEME.id).toBe('deep-blue');
    expect(getThemeOrDefault('no-existe').id).toBe('deep-blue');
    expect(getTheme('paper')?.name).toBe('Paper');
  });
});

describe('plantillas', () => {
  it('incluye las 3 plantillas del MVP', () => {
    expect(TEMPLATES.map((template) => template.id)).toEqual([
      'art-portfolio',
      'visual-gallery',
      'creative-dashboard',
    ]);
    for (const template of TEMPLATES) {
      expect(template.highlights.length).toBeGreaterThan(0);
    }
  });

  it('resuelve por id o slug con fallback', () => {
    expect(getTemplate('visual-gallery')?.slug).toBe('visual-gallery');
    expect(getTemplateOrDefault('desconocida').id).toBe('art-portfolio');
  });
});

describe('validaciones', () => {
  it('acepta la entrada por defecto', () => {
    const result = validateProjectInput(DEFAULT_INPUT);
    expect(result.success).toBe(true);
  });

  it('rechaza datos inválidos con mensajes claros', () => {
    const result = validateProjectInput({ ...DEFAULT_INPUT, name: 'ab', description: 'corta' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.join(' ')).toContain('nombre');
      expect(result.issues.join(' ')).toContain('descripción');
    }
  });

  it('rechaza plantillas y temas inexistentes', () => {
    const result = validateProjectInput({
      ...DEFAULT_INPUT,
      templateId: 'no-existe',
      themeId: 'tampoco',
    });
    expect(result.success).toBe(false);
  });
});
