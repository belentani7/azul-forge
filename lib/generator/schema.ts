import { z } from "zod";

const safeName = /^[\p{L}\p{N}][\p{L}\p{N} .,'’&()\-–]*$/u;
// Rechazamos explícitamente controles ASCII en el contenido que termina en código/HTML.
// eslint-disable-next-line no-control-regex
const safeDescription = /^[^\u0000-\u001f\u007f<>]+$/u;

export const projectSchema = z.strictObject({
  name: z.string().trim().min(3, "Escribe al menos 3 caracteres.").max(80, "Máximo 80 caracteres.").regex(safeName, "Usa letras, números y puntuación sencilla."),
  description: z.string().trim().min(12, "Describe el proyecto en al menos 12 caracteres.").max(320, "Máximo 320 caracteres.").regex(safeDescription, "No se permiten etiquetas HTML ni saltos de línea."),
  author: z.string().trim().max(80, "Máximo 80 caracteres.").regex(/^[\p{L}\p{N} .,'’&()\-–]*$/u, "Usa un nombre de autor sencillo."),
  template: z.enum(["art-portfolio", "visual-gallery", "creative-dashboard"]),
  theme: z.enum(["nocturne", "cerulean", "paper"]),
  features: z.strictObject({
    tests: z.boolean(),
    ci: z.boolean(),
    docs: z.boolean(),
    darkMode: z.boolean(),
    generative: z.boolean()
  })
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const defaultInput: ProjectInput = {
  name: "",
  description: "",
  author: "",
  template: "art-portfolio",
  theme: "nocturne",
  features: { tests: true, ci: true, docs: true, darkMode: true, generative: true }
};
