import type { GeneratedFile, ProjectManifest, ThemeDef } from '@/lib/types';
import { languageFromPath, mulberry32 } from '@/lib/utils';

function file(path: string, content: string): GeneratedFile {
  return { path, content: content.trimStart(), language: languageFromPath(path) };
}

/**
 * Plantilla: Dashboard creativo
 * Panel operativo con métricas, proyectos y actividad reales del catálogo.
 */
export function buildCreativeDashboardFiles(
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
    { label: 'Panel', href: '#panel' },
    { label: 'Proyectos', href: '#proyectos' },
    { label: 'Actividad', href: '#actividad' },
  ] satisfies NavItem[],
  hero: {
    eyebrow: 'Estudio operativo · ${theme.name}',
    title: '${escapeSingle(manifest.name)}',
    subtitle: '${escapeSingle(manifest.description)}',
  },
  metrics: [
    { id: 'm1', label: 'Proyectos activos', value: '12', trend: '+2 este trimestre' },
    { id: 'm2', label: 'Piezas entregadas', value: '87', trend: '+14 este mes' },
    { id: 'm3', label: 'Satisfacción de clientes', value: '96%', trend: 'estable' },
    { id: 'm4', label: 'Horas de estudio', value: '1 240', trend: '+8% vs. año anterior' },
  ] satisfies Metric[],
  projects: [
    { id: 'p1', name: 'Museo Azul — experiencia WebGL', status: 'activo', owner: 'Estudio', updated: '2026-10-12' },
    { id: 'p2', name: 'Archivo vivo del Besòs', status: 'en revisión', owner: 'Cultura', updated: '2026-10-08' },
    { id: 'p3', name: 'Identidad Aurora', status: 'activo', owner: 'Marca', updated: '2026-10-15' },
    { id: 'p4', name: 'Instalación Marea', status: 'archivado', owner: 'Arte', updated: '2026-09-30' },
    { id: 'p5', name: 'Panel de impacto social', status: 'activo', owner: 'Datos', updated: '2026-10-16' },
  ] satisfies ProjectRow[],
  activity: [
    { id: 'a1', when: 'hace 2 h', actor: 'Equipo de diseño', action: 'publicó la v3 de la guía de marca' },
    { id: 'a2', when: 'hace 5 h', actor: 'Pipeline CI', action: 'verificó build y tests de Museo Azul' },
    { id: 'a3', when: 'ayer', actor: 'Dirección de arte', action: 'aprobó la paleta de Identidad Aurora' },
    { id: 'a4', when: 'hace 2 días', actor: 'Cliente', action: 'dejó comentarios en Archivo vivo del Besòs' },
  ] satisfies ActivityEvent[],
  works: [] as WorkItem[],
};

export type SiteData = typeof site;
`,
    ),
  );

  files.push(
    file(
      'components/MetricCards.tsx',
      `import { site } from '@/lib/data';

export function MetricCards() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {site.metrics.map((metric) => (
        <article key={metric.id} className="card">
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>{metric.label}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', margin: '0.35rem 0' }}>
            {metric.value}
          </p>
          <p style={{ color: 'var(--accent-alt)', fontSize: '0.85rem', margin: 0 }}>{metric.trend}</p>
        </article>
      ))}
    </div>
  );
}
`,
    ),
  );

  files.push(
    file(
      'components/ProjectTable.tsx',
      `import { site } from '@/lib/data';

const statusColor: Record<string, string> = {
  activo: 'var(--accent-alt)',
  'en revisión': 'var(--warning, #FFC857)',
  archivado: 'var(--muted)',
};

export function ProjectTable() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <caption className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
          Proyectos del estudio
        </caption>
        <thead>
          <tr>
            {['Proyecto', 'Estado', 'Responsable', 'Actualizado'].map((header) => (
              <th
                key={header}
                scope="col"
                style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '0.85rem 0.5rem' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {site.projects.map((project) => (
            <tr key={project.id}>
              <th scope="row" style={{ textAlign: 'left', fontWeight: 500, padding: '0.85rem 0.5rem' }}>
                {project.name}
              </th>
              <td style={{ padding: '0.85rem 0.5rem' }}>
                <span
                  style={{
                    color: statusColor[project.status] ?? 'var(--ink)',
                    border: '1px solid var(--border)',
                    borderRadius: '999px',
                    padding: '0.2rem 0.75rem',
                    fontSize: '0.82rem',
                  }}
                >
                  {project.status}
                </span>
              </td>
              <td style={{ padding: '0.85rem 0.5rem', color: 'var(--muted)' }}>{project.owner}</td>
              <td style={{ padding: '0.85rem 0.5rem', color: 'var(--muted)' }}>{project.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`,
    ),
  );

  files.push(
    file(
      'components/ActivityFeed.tsx',
      `import { site } from '@/lib/data';

export function ActivityFeed() {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
      {site.activity.map((event) => (
        <li key={event.id} className="card" style={{ padding: '1.1rem 1.25rem' }}>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>{event.when}</p>
          <p style={{ margin: '0.35rem 0 0' }}>
            <strong>{event.actor}</strong> {event.action}
          </p>
        </li>
      ))}
    </ol>
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
    <header style={{ padding: '4.5rem 0 3rem' }}>
      <div className="container">
        <p style={{ color: 'var(--accent-alt)', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          {site.hero.eyebrow}
        </p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', maxWidth: '18ch' }}>{site.hero.title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.2rem', maxWidth: '58ch' }}>{site.hero.subtitle}</p>
        <nav aria-label="Secciones" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {site.nav.map((item) => (
            <a key={item.href} className="button" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
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
    <footer className="section" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          © {currentYear()} {site.author} · Panel operativo generado con AZUL FORGE
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
import { MetricCards } from '@/components/MetricCards';
import { ProjectTable } from '@/components/ProjectTable';
import { ActivityFeed } from '@/components/ActivityFeed';
import { SiteFooter } from '@/components/SiteFooter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <main id="contenido" className="container" style={{ paddingBottom: '4rem' }}>
        <section id="panel" className="section" aria-labelledby="panel-titulo" style={{ paddingTop: '2rem' }}>
          <h2 id="panel-titulo" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
            Panel del estudio
          </h2>
          <MetricCards />
        </section>
        <section id="proyectos" className="section" aria-labelledby="proyectos-titulo">
          <h2 id="proyectos-titulo" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
            Proyectos
          </h2>
          <ProjectTable />
        </section>
        <section id="actividad" className="section" aria-labelledby="actividad-titulo">
          <h2 id="actividad-titulo" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
            Actividad reciente
          </h2>
          <ActivityFeed />
        </section>
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
