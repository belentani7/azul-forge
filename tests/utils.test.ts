import { describe, expect, it } from 'vitest';
import { hashSeed, languageFromPath, mulberry32, slugify, uuid } from '@/lib/utils';

describe('slugify', () => {
  it('convierte nombres con acentos y espacios', () => {
    expect(slugify('Mi Estudio Creativo')).toBe('mi-estudio-creativo');
    expect(slugify('Galería Azul')).toBe('galeria-azul');
    expect(slugify('  ---Hola Mundo---  ')).toBe('hola-mundo');
  });

  it('tiene fallback seguro', () => {
    expect(slugify('!!!')).toBe('proyecto');
  });
});

describe('hashSeed / mulberry32', () => {
  it('es determinista', () => {
    expect(hashSeed('azul-forge')).toBe(hashSeed('azul-forge'));
    expect(hashSeed('azul-forge')).not.toBe(hashSeed('azul-forge-2'));
  });

  it('mulberry32 produce la misma secuencia para la misma semilla', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('languageFromPath', () => {
  it('detecta lenguajes comunes', () => {
    expect(languageFromPath('app/page.tsx')).toBe('tsx');
    expect(languageFromPath('lib/types.ts')).toBe('typescript');
    expect(languageFromPath('README.md')).toBe('markdown');
    expect(languageFromPath('styles.css')).toBe('css');
    expect(languageFromPath('desconocido.xyz')).toBe('text');
  });
});

describe('uuid', () => {
  it('genera identificadores únicos', () => {
    expect(uuid()).not.toBe(uuid());
    expect(uuid()).toMatch(/^[0-9a-f-]{8,}$/i);
  });
});
