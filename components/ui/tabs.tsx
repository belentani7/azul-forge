'use client';

import { type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string;
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" aria-label="Vistas del proyecto" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => {
              const index = items.findIndex((candidate) => candidate.id === active);
              if (event.key === 'ArrowRight') {
                const next = items[(index + 1) % items.length];
                if (next) onChange(next.id);
              }
              if (event.key === 'ArrowLeft') {
                const prev = items[(index - 1 + items.length) % items.length];
                if (prev) onChange(prev.id);
              }
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              selected
                ? 'bg-[var(--azul-electrico)] text-[var(--blanco-hielo)]'
                : 'border border-[var(--border)] text-[var(--gris-neblina)] hover:border-[var(--cian-suave)] hover:text-[var(--cian-suave)]'
            }`}
          >
            {item.label}
            {item.badge ? (
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{item.badge}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  id,
  active,
  children,
}: {
  id: string;
  active: string;
  children: ReactNode;
}) {
  if (id !== active) return null;
  return (
    <div role="tabpanel" aria-label={id} className="mt-6">
      {children}
    </div>
  );
}
