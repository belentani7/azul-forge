'use client';

export function PreviewPanel({ html }: { html: string }) {
  return (
    <div className="code-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <p className="text-xs text-[var(--gris-neblina)]">Vista previa · preview.html</p>
        <span className="badge-forge !border-[var(--cian-suave)]/30 !text-[var(--cian-suave)]">en vivo</span>
      </div>
      <iframe
        title="Vista previa del proyecto generado"
        srcDoc={html}
        sandbox="allow-scripts"
        className="h-[560px] w-full bg-white"
      />
    </div>
  );
}
