import type { Metadata } from 'next';
import { StudioShell } from '@/components/studio/studio-shell';

export const metadata: Metadata = {
  title: 'Estudio',
  description: 'Genera, verifica y exporta tu proyecto web con AZUL FORGE.',
};

export default function StudioPage() {
  return (
    <main id="contenido">
      <StudioShell />
    </main>
  );
}
