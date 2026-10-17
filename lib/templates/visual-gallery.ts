import type { GeneratedFile, ProjectManifest, ThemeDef } from '@/lib/types';
import { languageFromPath, mulberry32 } from '@/lib/utils';

function file(path: string, content: string): GeneratedFile {
  return { path, content: content.trimStart(), language: languageFromPath(path) };
}

/**
 * Plantilla: Galería visual
 * Exposición digital con filtrado por colección en cliente.
 */
export function buildVisualGalleryFiles(
  manifest: ProjectManifest,
  theme: ThemeDef,
): GeneratedFile[] {
  mulberry32(manifest.seed);
  const files: GeneratedFile[] = [];

  files.push(
    file(
      'lib/data.ts',
      `import type { ActivityEvent, Metric, NavItem, ProjectRow, WorkItem } from './types';

export const site = {
  name: '${escapeSingle(manifest.name)}',
  description: '${escapeSingle(manifest.description)}',
  author: '${escapeSingle(manifest.author)}',
  nav: [
    { label: 'Exposición', href: '#exposicion' },
    { label: 'Visita', href: '#visita' },
    { label: 'Contacto', href: '#contacto' },
  ] satisfies NavItem[],
  hero: {
    eyebrow: 'Sala digital · ${theme.name}',
    title: '${escapeSingle(manifest.name)}',
    subtitle: '${escapeSingle(manifest.description)}',
  },
  collections: ['Todas', 'Luz', 'Materia', 'Archivo'],
  works: [
    {
      id: 'pieza-01',
      title: 'Vidrio líquido',
      year: 2026,
      medium: 'Escultura digital',
      collection: 'Luz',
      summary: 'Refracciones calculadas en tiempo real sobre geometría plegada.',
    },
    {
      id: 'pieza-02',
      title: 'Sedimento',
      year: 2025,
      medium: 'Impresión textil',
      collection: 'Materia',
      summary: 'Estratos de color derivados de datos de marea del Mediterráneo.',
    },
    {
      id: 'pieza-03',
      title: 'Sala de ecos',
      year: 2026,
      medium: 'Experiencia web',
      collection: 'Luz',
      summary: 'Recorrido sonoro donde cada habitación responde a la anterior.',
    },
    {
      id: 'pieza-04',
      title: 'Fósil de interfaz',
      year: 2024,
      medium: 'Objeto encontrado',
      collection: 'Archivo',
      summary: 'Catálogo de interfaces obsoletas conservadas como restos arqueológicos.',
    },
    {
      id: 'pieza-05',
      title: 'Peso del aire',
      year: 2025,
      medium: 'Instalación',
      collection: 'Materia',
      summary: 'Volúmenes suspendidos que miden la presión del espacio expositivo.',
    },
    {
      id: 'pieza-06',
      title: 'Negativo 2.0',
      year: 2024,
      medium: 'Fotografía computacional',
      collection: 'Archivo',
      summary: 'Negativos generados por modelos entrenados con el propio archivo.',
    },
  ] satisfies WorkItem[],
  visit: {
    title: 'Planifica tu visita',
    hours: 'Martes a domingo · 10:00 – 20:00',
    address: 'Paseo del Mar 17 · L\\'Hospitalet de Llobregat',
    admission: 'Entrada libre · reserva recomendada para grupos',
  },
  contact: {
    email: 'sala@example.com',
  },
};

export type SiteData = typeof site;

export const unusedCatalogTypes: {
  metrics: Metric[];
  projects: ProjectRow[];
  activity: ActivityEvent[];
} = { metrics: [], projects: [], activity: [] };
`,
    ),
  );

  files.push(
    file(
      'components/ExhibitionFilter.tsx',
      `'use client';

import { useMemo, useState } from 'react';
import { site } from '@/lib/data';

export function ExhibitionFilter() {
  const [collection, setCollection] = useState('Todas');

  const visible = useMemo(() => {
    if (collection === 'Todas') return site.works;
    return site.works.filter((work) => work.collection === collection);
  }, [collection]);

  return (
    <div>
      <div role="group" aria-label="Filtrar por colección" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {site.collections.map((name) => (
          <button
            key={name}
            type="button"
            className="button"
            aria-pressed={collection === name}
            onClick={() => setCollection(name)}
            style={{
              background: collection === name ? 'var(--accent)' : 'transparent',
              color: collection === name ? '${theme.bg === '#F4F1EA' ? '#FFFFFF' : '#041225'}' : 'var(--ink)',
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <p aria-live="polite" style={{ color: 'var(--muted)', marginTop: '1rem' }}>
        {visible.length} piezas en «{collection}»
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}
      >
        {visible.map((work) => (
          <article key={work.id} className="card">
            <div
              aria-hidden="true"
              style={{
                height: '150px',
                borderRadius: '12px',
                marginBottom: '1rem',
                background:
                  'radial-gradient(circle at 30% 20%, var(--accent), transparent 65%), var(--bg)',
                border: '1px solid var(--border)',
              }}
            />
            <p style={{ color: 'var(--accent-alt)', fontSize: '0.8rem', margin: 0 }}>
              {work.collection} · {work.year}
            </p>
            <h3 style={{ margin: '0.35rem 0' }}>{work.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>{work.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
`,
    ),
  );

  files.push(
    file(
      'components/Hero.tsx',
      `import { site } from '@/lib/data';

export function Hero() {
  return (
    <header
      style={{
        minHeight: '72vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '4rem 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <p style={{ color: 'var(--accent-alt)', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          {site.hero.eyebrow}
        </p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', maxWidth: '16ch' }}>{site.hero.title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '54ch' }}>{site.hero.subtitle}</p>
      </div>
    </header>
  );
}
`,
    ),
  );

  files.push(
    file(
      'components/VisitSection.tsx',
      `import { site } from '@/lib/data';

export function VisitSection() {
  return (
    <section id="visita" className="section" aria-labelledby="visita-titulo">
      <div className="container" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div>
          <h2 id="visita-titulo">{site.visit.title}</h2>
          <p style={{ color: 'var(--muted)' }}>{site.visit.admission}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1.05rem' }}>Horario</h3>
          <p style={{ color: 'var(--muted)' }}>{site.visit.hours}</p>
          <h3 style={{ fontSize: '1.05rem' }}>Dirección</h3>
          <p style={{ color: 'var(--muted)' }}>{site.visit.address}</p>
        </div>
      </div>
    </section>
  );
}
`,
    ),
  );

  files.push(
    file(
      'components/SiteFooter.tsx',
      `import { currentYear } from '@/lib/utils';
import { site } from '@/lib/data';

export function SiteFooter() {
  return (
    <footer id="contacto" className="section" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <h2>Contacto</h2>
        <p>
          <a className="button" href={'mailto:' + site.contact.email}>
            {site.contact.email}
          </a>
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
          © {currentYear()} {site.author} · Generado con AZUL FORGE
        </p>
      </div>
    </footer>
  );
}
`,
    ),
  );

  files.push(
    file(
      'app/page.tsx',
      `import { Hero } from '@/components/Hero';
import { ExhibitionFilter } from '@/components/ExhibitionFilter';
import { VisitSection } from '@/components/VisitSection';
import { SiteFooter } from '@/components/SiteFooter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <main id="contenido">
        <section id="exposicion" className="section" aria-labelledby="expo-titulo">
          <div className="container">
            <h2 id="expo-titulo" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Exposición
            </h2>
            <ExhibitionFilter />
          </div>
        </section>
        <VisitSection />
      </main>
      <SiteFooter />
    </>
  );
}
`,
    ),
  );

  return files;
}

function escapeSingle(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
