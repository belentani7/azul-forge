/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Badge, Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';

afterEach(cleanup);

describe('componentes base', () => {
  it('Card renderiza contenido', () => {
    render(<Card>Contenido de prueba</Card>);
    expect(screen.getByText('Contenido de prueba')).toBeTruthy();
  });

  it('Badge expone el tono', () => {
    render(<Badge tone="success">Listo</Badge>);
    expect(screen.getByText('Listo')).toBeTruthy();
  });

  it('Tabs cambia de panel', () => {
    let active = 'code';
    const onChange = (id: string) => {
      active = id;
    };
    render(
      <Tabs
        items={[
          { id: 'code', label: 'Código' },
          { id: 'preview', label: 'Vista previa' },
        ]}
        active={active}
        onChange={onChange}
      />,
    );
    const previewTab = screen.getByRole('tab', { name: /vista previa/i });
    previewTab.click();
    expect(active).toBe('preview');
  });
});
