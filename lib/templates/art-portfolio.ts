import type { GeneratedFile, ProjectManifest, ThemeDef } from '@/lib/types';
import { languageFromPath, mulberry32 } from '@/lib/utils';

function file(path: string, content: string): GeneratedFile {
  return { path, content: content.trimStart(), language: languageFromPath(path) };
}

/**
 * Plantilla: Portfolio artístico
 * Hero generativo + galería de obras + manifiesto + contacto.
 */
export function buildArtPortfolioFiles(
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
    { label: 'Obra', href: '#obra' },
    { label: 'Manifiesto', href: '#manifiesto' },
    { label: 'Contacto', href: '#contacto' },
  ] satisfies NavItem[],
  hero: {
    eyebrow: 'Estudio digital · ${theme.name}',
    title: '${escapeSingle(manifest.name)}',
    subtitle: '${escapeSingle(manifest.description)}',
  },
  works: [
    {
      id: 'obra-01',
      title: 'Cartografía del silencio',
      year: 2026,
      medium: 'Generative canvas',
      collection: 'Señales',
      summary: 'Composición procedural que traduce ondas de sonido en retículas de luz.',
    },
    {
      id: 'obra-02',
      title: 'Catedral de datos',
      year: 2025,
      medium: 'Escultura WebGL',
      collection: 'Arquitecturas',
      summary: 'Volumen navegable construido con arquitecturas de latencia.',
    },
    {
      id: 'obra-03',
      title: 'Marea eléctrica',
      year: 2025,
      medium: 'Instalación audiovisual',
      collection: 'Señales',
      summary: 'Superficie fluida gobernada por ruido simplex y respiración lenta.',
    },
    {
      id: 'obra-04',
      title: 'Índice de cenizas',
      year: 2024,
      medium: 'Serie fotográfica',
      collection: 'Archivo',
      summary: 'Archivo material sobre memoria, temperatura y desaparición.',
    },
    {
      id: 'obra-05',
      title: 'Protocolo Aurora',
      year: 2026,
      medium: 'Web experience',
      collection: 'Arquitecturas',
      summary: 'Experiencia web navegable con narrativa rama a rama.',
    },
    {
      id: 'obra-06',
      title: 'Ruido de fondo',
      year: 2024,
      medium: 'Impresión generativa',
      collection: 'Archivo',
      summary: 'Edición limitada generada a partir de interferencias de radio.',
    },
  ] satisfies WorkItem[],
  manifesto: {
    title: 'El código como material',
    paragraphs: [
      'Trabajamos donde la ingeniería y la arte comparten mesa: sistemas reales, ejecutables, con la misma atención al detalle que una pieza de galería.',
      'Cada proyecto nace de una restricción honesta, se documenta como un artefacto cultural y se publica para ser leído, no solo admirado.',
    ],
  },
  contact: {
    email: 'estudio@example.com',
    location: 'L\'Hospitalet de Llobregat · Barcelona',
  },
};

// Tipos exportados para que el catálogo sea consumible por la API.
export type SiteData = typeof site;

export const unusedCatalogTypes: {
  metrics: Metric[];
  projects: ProjectRow[];
  activity: ActivityEvent[];
} = { metrics: [], projects: [], activity: [] };
`,
    ),
  );

  if (manifest.features.generativeBackground) {
    files.push(
      file(
        'components/BlueField.tsx',
        `'use client';

import { useEffect, useRef } from 'react';

/**
 * Blue Field — fondo generativo con puntos y retícula reactiva al cursor.
 * Respeta prefers-reduced-motion: en modo reducido se dibuja una única vez.
 */
export function BlueField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let raf = 0;
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '${theme.bg}';
      ctx.fillRect(0, 0, w, h);

      const spacing = 42;
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          const influence = Math.max(0, 1 - d / 260);
          const drift = reduced ? 0 : Math.sin((x + y + frame) * 0.004) * 1.6;
          const r = 1 + influence * 2.4;
          ctx.beginPath();
          ctx.arc(x + drift, y + drift * 0.6, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(102, 224, 255, ' + (0.1 + influence * 0.55) + ')';
          ctx.fill();
        }
      }
    };

    const loop = () => {
      frame += 1;
      draw();
      raf = window.requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (reduced) draw();
    };

    resize();
    if (reduced) {
      draw();
    } else {
      loop();
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: -1, width: '100%', height: '100%' }}
    />
  );
}
`,
      ),
    );
  }

  if (manifest.features.darkMode) {
    files.push(
      file(
        'components/ThemeToggle.tsx',
        `'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // almacenamiento no disponible
    }
    setTheme(next);
  };

  return (
    <button type="button" className="button" onClick={toggle} aria-pressed={theme === 'light'}>
      {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
}
`,
      ),
    );
  }

  files.push(
    file(
      'components/Hero.tsx',
      `import { site } from '@/lib/data';${
        manifest.features.darkMode
          ? "\nimport { ThemeToggle } from '@/components/ThemeToggle';"
          : ''
      }

export function Hero() {
  return (
    <header
      style={{
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      ${
        manifest.features.darkMode
          ? `<div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>`
          : ''
      }
      <div className="container">
        <p
          style={{
            color: 'var(--accent-alt)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            marginBottom: '1rem',
          }}
        >
          {site.hero.eyebrow}
        </p>
        <h1 style={{ fontSize: 'clamp(2.6rem, 8vw, 5.5rem)', maxWidth: '18ch' }}>
          {site.hero.title}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '52ch' }}>
          {site.hero.subtitle}
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <a className="button" href="#obra">
            Ver la obra
          </a>
          <a
            className="button"
            href="#contacto"
            style={{ background: 'transparent', color: 'var(--ink)' }}
          >
            Contacto
          </a>
        </div>
      </div>
    </header>
  );
}
`,
    ),
  );

  files.push(
    file(
      'components/GalleryGrid.tsx',
      `import { site } from '@/lib/data';

export function GalleryGrid() {
  return (
    <section id="obra" className="section" aria-labelledby="obra-titulo">
      <div className="container">
        <h2 id="obra-titulo" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
          Obra seleccionada
        </h2>
        <p style={{ color: 'var(--muted)', maxWidth: '60ch' }}>
          Piezas donde la generación procedural, la instalación y el archivo se cruzan.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '2.5rem',
          }}
        >
          {site.works.map((work) => (
            <article key={work.id} className="card">
              <div
                aria-hidden="true"
                style={{
                  height: '160px',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  background:
                    'linear-gradient(135deg, var(--accent), transparent 70%), var(--bg)',
                  border: '1px solid var(--border)',
                }}
              />
              <p style={{ color: 'var(--accent-alt)', fontSize: '0.8rem', margin: 0 }}>
                {work.collection} · {work.year}
              </p>
              <h3 style={{ fontSize: '1.25rem', margin: '0.35rem 0' }}>{work.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
                {work.summary}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                {work.medium}
              </p>
            </article>
          ))}
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
      'components/Manifiesto.tsx',
      `import { site } from '@/lib/data';

export function Manifiesto() {
  return (
    <section id="manifiesto" className="section" aria-labelledby="manifiesto-titulo">
      <div className="container" style={{ maxWidth: '760px' }}>
        <h2 id="manifiesto-titulo">{site.manifesto.title}</h2>
        {site.manifesto.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            {paragraph}
          </p>
        ))}
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
        <p style={{ color: 'var(--muted)' }}>
          {site.contact.location}
        </p>
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
import { GalleryGrid } from '@/components/GalleryGrid';
import { Manifiesto } from '@/components/Manifiesto';
import { SiteFooter } from '@/components/SiteFooter';${
        manifest.features.generativeBackground
          ? "\nimport { BlueField } from '@/components/BlueField';"
          : ''
      }

export default function HomePage() {
  return (
    <>
      ${manifest.features.generativeBackground ? '<BlueField />' : ''}
      <Hero />
      <main id="contenido">
        <GalleryGrid />
        <Manifiesto />
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
