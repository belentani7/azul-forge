'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TEMPLATES } from '@/lib/templates/registry';
import { THEMES } from '@/lib/themes';
import type { ProjectInput } from '@/lib/types';

export interface FormErrors {
  [field: string]: string | undefined;
}

interface ProjectFormProps {
  value: ProjectInput;
  errors: FormErrors;
  busy: boolean;
  onChange: (next: ProjectInput) => void;
  onSubmit: () => void;
}

export function ProjectForm({ value, errors, busy, onChange, onSubmit }: ProjectFormProps) {
  const set = <K extends keyof ProjectInput>(key: K, next: ProjectInput[K]) =>
    onChange({ ...value, [key]: next });

  const setFeature = (key: keyof ProjectInput['features'], checked: boolean) =>
    onChange({ ...value, features: { ...value.features, [key]: checked } });

  const inputProps = (field: keyof ProjectInput): InputHTMLAttributes<HTMLInputElement> & {
    'aria-invalid'?: boolean;
  } => ({
    id: `f-${String(field)}`,
    value: String(value[field] ?? ''),
    onChange: (event) => set(field, event.target.value as never),
    'aria-invalid': errors[String(field)] ? true : undefined,
    autoComplete: 'off',
  });

  const areaProps: TextareaHTMLAttributes<HTMLTextAreaElement> & { 'aria-invalid'?: boolean } = {
    id: 'f-description',
    value: value.description,
    onChange: (event) => set('description', event.target.value),
    'aria-invalid': errors.description ? true : undefined,
  };

  return (
    <form
      className="grid gap-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <Label htmlFor="f-name">Nombre del proyecto</Label>
        <Input placeholder="Mi estudio de arte digital" {...inputProps('name')} />
        {errors.name ? (
          <p role="alert" className="mt-1.5 text-xs text-[var(--rojo-error)]">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="f-description" hint="mínimo 20 caracteres">
          Descripción
        </Label>
        <Textarea
          placeholder="Un espacio digital que presenta mi obra con una experiencia inmersiva y profesional."
          {...areaProps}
        />
        {errors.description ? (
          <p role="alert" className="mt-1.5 text-xs text-[var(--rojo-error)]">
            {errors.description}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="f-author">Autor / estudio</Label>
        <Input placeholder="Nombre del autor o estudio" {...inputProps('author')} />
        {errors.author ? (
          <p role="alert" className="mt-1.5 text-xs text-[var(--rojo-error)]">
            {errors.author}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="f-templateId">Plantilla</Label>
        <select
          id="f-templateId"
          className="input-forge"
          value={value.templateId}
          onChange={(event) => set('templateId', event.target.value)}
        >
          {TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-[var(--gris-neblina)]">
          {TEMPLATES.find((template) => template.id === value.templateId)?.description}
        </p>
      </div>

      <div>
        <Label htmlFor="f-themeId">Tema visual</Label>
        <select
          id="f-themeId"
          className="input-forge"
          value={value.themeId}
          onChange={(event) => set('themeId', event.target.value)}
        >
          {THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {(() => {
            const theme = THEMES.find((candidate) => candidate.id === value.themeId);
            return theme
              ? [theme.bg, theme.accent, theme.accentAlt, theme.card, theme.fg].map((color) => (
                  <span
                    key={color}
                    className="h-4 w-8 rounded-md border border-white/10"
                    style={{ background: color }}
                  />
                ))
              : null;
          })()}
        </div>
      </div>

      <fieldset className="grid gap-3">
        <legend className="label-forge">Módulos del proyecto</legend>
        <Switch
          id="f-darkMode"
          checked={value.features.darkMode}
          onChange={(checked) => setFeature('darkMode', checked)}
          label="Modo oscuro / claro"
          description="Interruptor de tema persistente"
        />
        <Switch
          id="f-tests"
          checked={value.features.tests}
          onChange={(checked) => setFeature('tests', checked)}
          label="Tests (Vitest)"
          description="Suite de tests de tipos y contenido"
        />
        <Switch
          id="f-ci"
          checked={value.features.ci}
          onChange={(checked) => setFeature('ci', checked)}
          label="CI con GitHub Actions"
          description="lint · type-check · test · build en cada push"
        />
        <Switch
          id="f-docs"
          checked={value.features.docs}
          onChange={(checked) => setFeature('docs', checked)}
          label="Documentación"
          description="README profesional + guías en docs/"
        />
        <Switch
          id="f-generativeBackground"
          checked={value.features.generativeBackground}
          onChange={(checked) => setFeature('generativeBackground', checked)}
          label="Fondo generativo"
          description="Canvas Blue Field reactivo (respeta reduced-motion)"
        />
      </fieldset>

      <button type="submit" className="btn-forge mt-2 w-full py-3 text-base" disabled={busy} data-action-state={busy ? 'generating' : 'idle'}>
        {busy ? 'Generando proyecto…' : 'Generar proyecto'}
      </button>
    </form>
  );
}
