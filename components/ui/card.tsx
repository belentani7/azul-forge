import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-forge p-6 sm:p-8 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'accent';
}) {
  const tones: Record<string, string> = {
    neutral: 'badge-forge',
    success: 'badge-forge !text-[var(--verde-exito)] !border-[var(--verde-exito)]/40',
    warning: 'badge-forge !text-[var(--amarillo-advertencia)] !border-[var(--amarillo-advertencia)]/40',
    error: 'badge-forge !text-[var(--rojo-error)] !border-[var(--rojo-error)]/40',
    accent: 'badge-forge !text-[var(--cian-suave)] !border-[var(--cian-suave)]/40',
  };
  return <span className={tones[tone]}>{children}</span>;
}
