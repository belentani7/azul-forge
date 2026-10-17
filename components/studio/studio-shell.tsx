'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectForm, type FormErrors } from '@/components/studio/project-form';
import { FileTree } from '@/components/studio/file-tree';
import { CodeViewer } from '@/components/studio/code-viewer';
import { PreviewPanel } from '@/components/studio/preview-panel';
import { QualityPanel } from '@/components/studio/quality-panel';
import { GitHubInstructions } from '@/components/studio/github-instructions';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ProjectInput, QualityReport } from '@/lib/types';
import { DEFAULT_INPUT } from '@/lib/validations';
import { downloadProjectZip } from '@/lib/zip/exporter';
import type { GeneratedProject } from '@/lib/types';

interface GenerationResult {
  projectId: string;
  slug: string;
  files: { path: string; content: string }[];
  qualityScore: number;
  quality: QualityReport;
}

type StudioStatus =
  | 'idle'
  | 'validating'
  | 'generating'
  | 'generated'
  | 'error'
  | 'zip-ready'
  | 'low-quality'
  | 'incomplete';

const DRAFT_KEY = 'azul-forge:draft';
const RESULT_KEY = 'azul-forge:last-result';

const statusCopy: Record<StudioStatus, { label: string; tone: 'neutral' | 'success' | 'warning' | 'error' | 'accent' }> = {
  idle: { label: 'Listo para generar', tone: 'neutral' },
  validating: { label: 'Validando datos', tone: 'accent' },
  generating: { label: 'Generando', tone: 'accent' },
  generated: { label: 'Proyecto generado', tone: 'success' },
  error: { label: 'Error', tone: 'error' },
  'zip-ready': { label: 'ZIP listo', tone: 'success' },
  'low-quality': { label: 'Calidad baja', tone: 'warning' },
  incomplete: { label: 'Campos incompletos', tone: 'warning' },
};

export function StudioShell() {
  const [input, setInput] = useState<ProjectInput>(DEFAULT_INPUT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<StudioStatus>('idle');
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState('code');
  const [activeFile, setActiveFile] = useState('README.md');
  const [search, setSearch] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const searchRef = useRef(0);

  // Borradores: recuperar al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as ProjectInput;
        if (draft && typeof draft.name === 'string') {
          setInput({ ...DEFAULT_INPUT, ...draft, features: { ...DEFAULT_INPUT.features, ...draft.features } });
          setDraftRestored(true);
        }
      }
      const rawResult = localStorage.getItem(RESULT_KEY);
      if (rawResult) {
        const parsed = JSON.parse(rawResult) as GenerationResult;
        if (parsed?.projectId && Array.isArray(parsed.files)) {
          setResult(parsed);
          setStatus('generated');
          setActiveFile(parsed.files[0]?.path ?? 'README.md');
        }
      }
    } catch {
      // almacenamiento no disponible o datos corruptos
    }
  }, []);

  // Borradores: guardar en cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(input));
    } catch {
      // almacenamiento no disponible
    }
  }, [input]);

  const persistResult = useCallback((next: GenerationResult) => {
    try {
      // Evitar localStorage demasiado grande: guardar solo si cabe (~4MB)
      const serialized = JSON.stringify(next);
      if (serialized.length < 4_000_000) localStorage.setItem(RESULT_KEY, serialized);
    } catch {
      // cuota excedida: el resultado sigue en memoria
    }
  }, []);

  const validateClient = useCallback((): boolean => {
    const nextErrors: FormErrors = {};
    if (input.name.trim().length < 3) nextErrors.name = 'Escribe un nombre de al menos 3 caracteres.';
    if (input.description.trim().length < 20)
      nextErrors.description = 'La descripción necesita al menos 20 caracteres.';
    if (input.author.trim().length < 2) nextErrors.author = 'Indica el autor o estudio.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [input]);

  const generate = useCallback(async () => {
    setNotice(null);
    setStatus('validating');
    if (!validateClient()) {
      setStatus('incomplete');
      setNotice('Revisa los campos marcados antes de generar.');
      return;
    }
    setStatus('generating');
    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'No se pudo generar el proyecto.');
      }
      const payload = (await response.json()) as GenerationResult;
      setResult(payload);
      setActiveFile(payload.files[0]?.path ?? 'README.md');
      setStatus(payload.qualityScore < 60 ? 'low-quality' : 'generated');
      if (payload.qualityScore < 60) {
        setNotice('El proyecto se generó, pero su puntuación de calidad es baja. Revisa el panel de calidad.');
      }
      persistResult(payload);
      setActiveTab('code');
    } catch (error) {
      setStatus('error');
      setNotice(error instanceof Error ? error.message : 'Error inesperado al generar.');
    }
  }, [input, persistResult, validateClient]);

  const downloadZip = useCallback(async () => {
    if (!result) return;
    try {
      const project: GeneratedProject = {
        manifest: {
          id: result.projectId,
          slug: result.slug,
          name: input.name.trim(),
          description: input.description.trim(),
          author: input.author.trim(),
          createdAt: new Date().toISOString(),
          templateId: input.templateId,
          themeId: input.themeId,
          seed: 0,
          features: input.features,
        },
        files: result.files.map((file) => ({
          path: file.path,
          content: file.content,
          language: 'text',
        })),
        fileMap: Object.fromEntries(result.files.map((file) => [file.path, file.content])),
        previewHtml: result.files.find((file) => file.path === 'preview.html')?.content ?? '',
      };
      await downloadProjectZip(project);
      setStatus('zip-ready');
      setNotice(`ZIP descargado: ${result.slug}.zip`);
    } catch {
      setStatus('error');
      setNotice('No se pudo construir el ZIP.');
    }
  }, [result, input]);

  // Atajo de teclado: Ctrl/Cmd + K → buscar archivos
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const el = document.getElementById('f-file-search');
        el?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeContent = useMemo(() => {
    if (!result) return '';
    return result.files.find((file) => file.path === activeFile)?.content ?? '';
  }, [result, activeFile]);

  const statusInfo = statusCopy[status];

  return (
    <div className="container-forge py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--cian-suave)]">
            AZUL FORGE · Estudio
          </p>
          <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)]">Genera tu proyecto</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={statusInfo.tone} >{statusInfo.label}</Badge>
          {draftRestored ? <Badge tone="accent">Borrador restaurado</Badge> : null}
        </div>
      </motion.div>

      <AnimatePresence>
        {notice ? (
          <motion.p
            key={notice}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            role="status"
            className="mt-5 rounded-xl border border-[var(--border)] bg-white/[0.04] px-4 py-3 text-sm text-[var(--blanco-hielo)]"
          >
            {notice}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <h2 className="text-lg">Configuración</h2>
          <p className="mb-5 mt-1 text-sm text-[var(--gris-neblina)]">
            Describe tu proyecto. Los cambios se guardan como borrador automáticamente.
          </p>
          <ProjectForm
            value={input}
            errors={errors}
            busy={status === 'generating'}
            onChange={setInput}
            onSubmit={generate}
          />
        </Card>

        <div>
          {result ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs
                  items={[
                    { id: 'code', label: 'Código', badge: String(result.files.length) },
                    { id: 'preview', label: 'Vista previa' },
                    { id: 'quality', label: 'Calidad', badge: String(result.qualityScore) },
                    { id: 'github', label: 'GitHub' },
                  ]}
                  active={activeTab}
                  onChange={setActiveTab}
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={downloadZip} data-action-state="zip" data-action-ready="false">
                    Descargar proyecto .zip
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveTab('quality')}>
                    Ver reporte de calidad
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveTab('github')}>
                    Publicar en GitHub
                  </Button>
                </div>
              </div>

              <TabPanel id="code" active={activeTab}>
                <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                  <div className="code-surface flex max-h-[560px] flex-col p-3">
                    <Input
                      id="f-file-search"
                      placeholder="Buscar archivos… ⌘K"
                      className="!py-2 text-xs"
                      value={search}
                      onChange={(event) => {
                        const next = event.target.value;
                        setSearch(next);
                        window.clearTimeout(searchRef.current);
                      }}
                    />
                    <div className="thin-scroll mt-3 flex-1 overflow-auto">
                      <FileTree
                        files={result.files}
                        activePath={activeFile}
                        onSelect={setActiveFile}
                        query={search}
                      />
                    </div>
                  </div>
                  <CodeViewer path={activeFile} content={activeContent} />
                </div>
              </TabPanel>

              <TabPanel id="preview" active={activeTab}>
                <PreviewPanel
                  html={result.files.find((file) => file.path === 'preview.html')?.content ?? ''}
                />
              </TabPanel>

              <TabPanel id="quality" active={activeTab}>
                <QualityPanel report={result.quality} />
              </TabPanel>

              <TabPanel id="github" active={activeTab}>
                <GitHubInstructions slug={result.slug} />
              </TabPanel>
            </>
          ) : (
            <Card className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div
                aria-hidden="true"
                className="mb-6 h-16 w-16 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--azul-electrico)]/30 to-transparent"
              />
              <h2 className="text-xl">El lienzo está vacío</h2>
              <p className="mt-2 max-w-[42ch] text-sm text-[var(--gris-neblina)]">
                Completa el formulario y pulsa «Generar proyecto». Aquí aparecerán el código, la
                vista previa y el reporte de calidad de tu proyecto.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
