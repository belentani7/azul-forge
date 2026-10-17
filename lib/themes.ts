import type { ThemeDef, ThemeSlug } from '@/lib/types';

/**
 * Temas curados de AZUL FORGE (spec §15.2). deep-blue es la identidad primaria.
 */
export const THEMES: ThemeDef[] = [
  {
    id: 'deep-blue',
    name: 'Deep Blue',
    description: 'Identidad AZUL FORGE: azul profundo, eléctrico y cian.',
    bg: '#031425',
    fg: '#F2F8FF',
    muted: '#9DB2C7',
    accent: '#2D7DFF',
    accentAlt: '#66E0FF',
    card: '#071E33',
    border: 'rgba(157, 178, 199, 0.16)',
    btnFg: '#F2F8FF',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Noche violeta, carbón profundo y acento lavanda.',
    bg: '#0B0714',
    fg: '#F4EFE6',
    muted: '#A79BB5',
    accent: '#7C5CFF',
    accentAlt: '#C4B5FD',
    card: '#140C24',
    border: 'rgba(167, 155, 181, 0.18)',
    btnFg: '#FFFFFF',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Verdes nórdicos sobre casi-negro con destellos menta.',
    bg: '#04120F',
    fg: '#ECFFF7',
    muted: '#8FB8AC',
    accent: '#2DD4BF',
    accentAlt: '#7DF9E2',
    card: '#0A1F1B',
    border: 'rgba(143, 184, 172, 0.18)',
    btnFg: '#04120F',
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Brasa cálida: naranja eléctrico sobre marrón nocturno.',
    bg: '#140B06',
    fg: '#FFF3E4',
    muted: '#C7A78B',
    accent: '#FF7A2F',
    accentAlt: '#FFC857',
    card: '#211209',
    border: 'rgba(199, 167, 139, 0.2)',
    btnFg: '#140B06',
  },
  {
    id: 'paper',
    name: 'Paper',
    description: 'Lienzo editorial claro con tinta oscura y azul de imprenta.',
    bg: '#F4F1EA',
    fg: '#131517',
    muted: '#5C6470',
    accent: '#1D4ED8',
    accentAlt: '#0E7490',
    card: '#FFFFFF',
    border: 'rgba(19, 21, 23, 0.12)',
    btnFg: '#FFFFFF',
  },
];

export const DEFAULT_THEME: ThemeDef = THEMES[0]!;

export function getTheme(id: string): ThemeDef | undefined {
  return THEMES.find((theme) => theme.id === id || theme.id === (id as ThemeSlug));
}

export function getThemeOrDefault(id: string): ThemeDef {
  return getTheme(id) ?? DEFAULT_THEME;
}
