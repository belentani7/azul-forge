import { z } from 'zod';
import type { ProjectInput, ValidationResponse } from '@/lib/types';

export const featuresSchema = z.object({
  tests: z.boolean().default(true),
  ci: z.boolean().default(true),
  docs: z.boolean().default(true),
  darkMode: z.boolean().default(true),
  generativeBackground: z.boolean().default(true),
});

export const projectInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre necesita al menos 3 caracteres.')
    .max(60, 'El nombre no puede superar 60 caracteres.'),
  description: z
    .string()
    .trim()
    .min(20, 'La descripción necesita al menos 20 caracteres.')
    .max(240, 'La descripción no puede superar 240 caracteres.'),
  author: z
    .string()
    .trim()
    .min(2, 'Indica el autor o estudio.')
    .max(60, 'El autor no puede superar 60 caracteres.'),
  templateId: z.enum(['art-portfolio', 'visual-gallery', 'creative-dashboard']),
  themeId: z.enum(['deep-blue', 'obsidian', 'aurora', 'ember', 'paper']),
  features: featuresSchema,
});

export const DEFAULT_INPUT: ProjectInput = {
  name: 'Mi estudio creativo',
  description: 'Un espacio digital que presenta mi obra con una experiencia inmersiva y profesional.',
  author: 'Belentani',
  templateId: 'art-portfolio',
  themeId: 'deep-blue',
  features: {
    tests: true,
    ci: true,
    docs: true,
    darkMode: true,
    generativeBackground: true,
  },
};

export function validateProjectInput(data: unknown): ValidationResponse {
  const result = projectInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as ProjectInput };
  }
  return {
    success: false,
    issues: result.error.issues.map((issue) => {
      const path = issue.path.join('.') || 'datos';
      return `${path}: ${issue.message}`;
    }),
  };
}

export const validateInput = validateProjectInput;
