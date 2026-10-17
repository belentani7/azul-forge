import type { ProjectInput } from "@/lib/generator/schema";

export const validInput: ProjectInput = {
  name: "Museo Azul",
  description: "Una galería digital para exhibir obras originales con contexto y claridad.",
  author: "Equipo Museo Azul",
  template: "art-portfolio",
  theme: "nocturne",
  features: { tests: true, ci: true, docs: true, darkMode: true, generative: true }
};
