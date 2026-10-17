import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AZUL FORGE — Generador de proyectos web',
    template: '%s · AZUL FORGE',
  },
  description:
    'Crea proyectos web modernos con estructura profesional, calidad verificada y exportación .zip lista para GitHub y Vercel.',
  authors: [{ name: 'AZUL FORGE' }],
  openGraph: {
    title: 'AZUL FORGE',
    description: 'Generador de proyectos web con calidad de producción.',
    type: 'website',
    locale: 'es_ES',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#031425',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try { var t = localStorage.getItem('azul-forge:theme'); if (t === 'light') document.documentElement.dataset.theme = 'light'; } catch (e) {}",
          }}
        />
      </head>
      <body className="antialiased">
        <div className="blue-field" aria-hidden="true" />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[var(--azul-electrico)] focus:px-4 focus:py-2"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
