export const templates = [
  {
    slug: "art-portfolio",
    name: "Portfolio artístico",
    category: "Identidad",
    description: "Un espacio editorial para presentar tu práctica y tus obras sin inventar proyectos.",
    number: "01",
    icon: "orbit"
  },
  {
    slug: "visual-gallery",
    name: "Galería visual",
    category: "Colección",
    description: "Un archivo digital para publicar piezas, series y relatos visuales propios.",
    number: "02",
    icon: "grid"
  },
  {
    slug: "creative-dashboard",
    name: "Tablero creativo",
    category: "Organización",
    description: "Un tablero local-first para capturar, completar y ordenar trabajo real.",
    number: "03",
    icon: "layers"
  }
] as const;

export type TemplateSlug = (typeof templates)[number]["slug"];

export function getTemplate(slug: string) {
  return templates.find((template) => template.slug === slug);
}
