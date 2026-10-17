'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: 'Estructura profesional',
    description:
      'Cada proyecto incluye App Router, TypeScript estricto, rutas API, tests con Vitest, CI y documentación real.',
  },
  {
    title: 'Calidad verificable',
    description:
      'El motor de calidad audita README, licencia, tests, CI, SEO y accesibilidad, y devuelve un informe 0–100 accionable.',
  },
  {
    title: 'Identidad visual coherente',
    description:
      'Cinco temas curados y una dirección de arte azul eléctrico: tipografía Space Grotesk, capas translúcidas y fondo Blue Field.',
  },
  {
    title: 'Exportación honesta',
    description:
      'Descarga un .zip con la estructura {slug}/ lista para git init, git push y despliegue en Vercel. El código es el producto.',
  },
];

export function Features() {
  return (
    <section id="como-funciona" className="section" aria-labelledby="features-title">
      <div className="container-forge">
        <h2 id="features-title" className="max-w-[20ch] text-[clamp(1.9rem,4.5vw,3.2rem)] leading-tight">
          Todo lo que hay dentro del generador
        </h2>
        <p className="mt-4 max-w-[60ch] text-[var(--gris-neblina)]">
          Un flujo compacto de estudio: describes, eliges, generas, verificas y exportas.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
              className="card-forge p-7"
            >
              <div
                aria-hidden="true"
                className="mb-5 h-10 w-10 rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--azul-electrico)]/35 to-transparent"
              />
              <h3 className="text-xl">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gris-neblina)]">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
