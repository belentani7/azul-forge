'use client';

import { Badge } from '@/components/ui/card';
import type { QualityReport } from '@/lib/types';

function scoreTone(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

export function QualityPanel({ report }: { report: QualityReport }) {
  const tone = scoreTone(report.score);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="card-forge flex flex-col items-center justify-center p-8 text-center">
        <p className="label-forge">Calidad del proyecto</p>
        <p
          className={`mono text-6xl font-semibold ${
            tone === 'success'
              ? 'text-[var(--verde-exito)]'
              : tone === 'warning'
                ? 'text-[var(--amarillo-advertencia)]'
                : 'text-[var(--rojo-error)]'
          }`}
        >
          {report.score}
        </p>
        <p className="mt-1 text-sm text-[var(--gris-neblina)]">sobre 100</p>
        <div className="mt-4">
          <Badge tone={tone}>
            {tone === 'success' ? 'Listo para entrega' : tone === 'warning' ? 'Aceptable, mejorable' : 'Necesita trabajo'}
          </Badge>
        </div>
      </div>

      <div>
        <h3 className="text-lg">Checklist de calidad</h3>
        <ul className="mt-4 grid gap-2.5">
          {report.checks.map((check) => (
            <li
              key={check.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  <span aria-hidden="true" className="mr-2">
                    {check.passed ? '✅' : '⚠️'}
                  </span>
                  {check.label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--gris-neblina)]">{check.detail}</p>
              </div>
              <Badge tone={check.passed ? 'success' : 'warning'}>{check.passed ? 'OK' : 'Mejorar'}</Badge>
            </li>
          ))}
        </ul>

        {report.recommendations.length > 0 ? (
          <>
            <h3 className="mt-8 text-lg">Recomendaciones</h3>
            <ul className="mt-3 grid gap-2">
              {report.recommendations.map((item) => (
                <li key={item} className="rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm text-[var(--gris-neblina)]">
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
