'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
  {
    title: 'Describe tu proyecto',
    description: 'Nombre, descripción, autor, plantilla y tema. Sin conocimientos técnicos.',
  },
  {
    title: 'Genera el código',
    description: 'AZUL FORGE compone un proyecto Next.js determinista con la estructura completa.',
  },
  {
    title: 'Verifica la calidad',
    description: 'Consulta el informe 0–100: documentación, tests, CI, SEO y accesibilidad.',
  },
  {
    title: 'Publica',
    description: 'Descarga el .zip, súbelo a GitHub y conéctalo a Vercel con las instrucciones incluidas.',
  },
];

export function Steps() {
  return (
    <section className="section pt-0" aria-labelledby="steps-title">
      <div className="container-forge">
        <h2 id="steps-title" className="text-[clamp(1.9rem,4.5vw,3.2rem)]">
          De la idea al repositorio en cuatro pasos
        </h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="relative rounded-2xl border border-[var(--border)] bg-[rgba(7,30,51,0.45)] p-6"
            >
              <span className="mono text-sm font-semibold text-[var(--cian-suave)]">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--gris-neblina)]">{step.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="section pt-0">
      <div className="container-forge">
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glow-border relative overflow-hidden rounded-[28px] px-8 py-14 text-center"
          style={{
            background:
              'linear-gradient(140deg, rgba(45,125,255,0.16), rgba(7,30,51,0.75) 55%, rgba(102,224,255,0.1))',
          }}
        >
          <h2 className="mx-auto max-w-[22ch] text-[clamp(1.9rem,4.5vw,3rem)] leading-tight">
            Construye el siguiente proyecto como un estudio, no como una plantilla
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[var(--gris-neblina)]">
            Calidad profesional, código real y una marca visual coherente desde el primer commit.
          </p>
          <Link href="/studio" className="btn-forge mt-8 px-8 py-3 text-base">
            Entrar al estudio →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-10">
      <div className="container-forge flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--gris-neblina)]">
        <p>© {new Date().getFullYear()} AZUL FORGE · Generador de proyectos web</p>
        <nav aria-label="Pie de página" className="flex gap-6">
          <Link href="/studio" className="hover:text-[var(--cian-suave)]">
            Estudio
          </Link>
          <Link href="/api/health" className="hover:text-[var(--cian-suave)]">
            API · salud
          </Link>
          <Link href="/api/templates" className="hover:text-[var(--cian-suave)]">
            API · plantillas
          </Link>
        </nav>
      </div>
    </footer>
  );
}
