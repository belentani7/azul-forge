"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Box, Check, CheckCircle2,
  ChevronRight, CircleAlert, CircleMinus, ClipboardCheck, Code2, Copy, FileCode2,
  FileJson2, FileText, FolderOpen, GalleryHorizontalEnd, LayoutDashboard,
  Layers3, Monitor, Palette, Play, RotateCw, Search, ShieldCheck,
  Smartphone, Sparkles, WandSparkles, X
} from "lucide-react";
import { projectSchema as projectInputSchema, type ProjectInput } from "@/lib/generator/schema";
import { templates as templateCatalog } from "@/lib/generator/templates";
import type { GeneratedFile, GeneratedProject, QualityReport } from "@/lib/generator/types";

const STORAGE_KEY = "azul-forge:draft:v1";
const defaults: ProjectInput = {
  name: "Tu próximo proyecto",
  author: "",
  description: "Un espacio digital para reunir y presentar el trabajo que importa.",
  template: "art-portfolio",
  theme: "nocturne",
  features: { darkMode: true, generative: true, tests: true, ci: true, docs: true }
};
const palettes = [
  { id: "nocturne", name: "Nocturno", colors: ["#071523", "#79ddf7", "#e3ad7b"] },
  { id: "cerulean", name: "Cerúleo", colors: ["#101b45", "#a9e9ff", "#627ed3"] },
  { id: "paper", name: "Papel", colors: ["#f7f5ef", "#226452", "#bce3d2"] }
] as const;
const templateIcons = [Layers3, GalleryHorizontalEnd, LayoutDashboard];
const featureOptions: { key: keyof ProjectInput["features"]; title: string; detail: string }[] = [
  { key: "darkMode", title: "Modo oscuro", detail: "Invierte la base visual" },
  { key: "generative", title: "Campo generativo", detail: "Geometría editorial sin scripts" },
  { key: "tests", title: "Pruebas", detail: "Vitest + test de contenido" },
  { key: "ci", title: "CI de GitHub", detail: "Verificación automatizada" },
  { key: "docs", title: "Documentación", detail: "Arquitectura y despliegue" }
];

type View = "preview" | "code";
type DossierTab = "files" | "quality";
function byteLabel(bytes: number) { return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`; }
function fileIcon(path: string) {
  return path.endsWith(".json") ? FileJson2 : path.endsWith(".md") || path === "LICENSE" ? FileText : FileCode2;
}
function languageFor(file: GeneratedFile): Language {
  return (file.language === "text" ? "plain" : file.language) as Language;
}

export function ForgeStudio() {
  const [draft, setDraft] = useState<ProjectInput>(defaults);
  const [restored, setRestored] = useState(false);
  const [canPersist, setCanPersist] = useState(true);
  const [storageState, setStorageState] = useState<"saved" | "unavailable" | "invalid" | "loading">("loading");
  const [result, setResult] = useState<GeneratedProject | null>(null);
  const [generatedFrom, setGeneratedFrom] = useState("");
  const [qualityOverride, setQualityOverride] = useState<{ signature: string; quality: QualityReport } | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<View>("preview");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [dossierTab, setDossierTab] = useState<DossierTab>("files");
  const [selectedPath, setSelectedPath] = useState("app/page.tsx");
  const [fileQuery, setFileQuery] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const signature = JSON.stringify(draft);
  const dirty = signature !== generatedFrom;

  const generate = useCallback(async (data: ProjectInput) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/projects/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), signal: controller.signal
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.issues?.map((item: { message: string }) => item.message).join(" · ") || payload.error || "No se pudo generar el proyecto.");
      if (!controller.signal.aborted) {
        setResult(payload as GeneratedProject);
        setGeneratedFrom(JSON.stringify(data));
        setQualityOverride(null);
        setSelectedPath((current) => (payload as GeneratedProject).files.some((entry) => entry.path === current) ? current : "app/page.tsx");
        setNotice("Código y vista actualizados.");
      }
    } catch (error) {
      if (!controller.signal.aborted) setErrorMessage(error instanceof Error ? error.message : "No se pudo conectar con el generador.");
    } finally {
      if (requestRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // El borrador se lee después de hidratar para evitar diferencias entre servidor y navegador.
    // El timer también permite cancelar la primera ejecución duplicada de Strict Mode.
    const timer = window.setTimeout(() => {
      let initial = defaults;
      let storageValid = true;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          let stored: unknown;
          try { stored = JSON.parse(saved); } catch { stored = null; }
          const parsed = projectInputSchema.safeParse(stored);
          if (parsed.success) initial = parsed.data;
          else { storageValid = false; setCanPersist(false); setStorageState("invalid"); }
        }
        if (storageValid) setStorageState("saved");
      } catch { setCanPersist(false); setStorageState("unavailable"); }
      setDraft(initial);
      setRestored(true);
      void generate(initial);
    }, 0);
    return () => { window.clearTimeout(timer); requestRef.current?.abort(); };
  }, [generate]);

  useEffect(() => {
    if (!restored || !canPersist) return;
    let status: "saved" | "unavailable" = "saved";
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); }
    catch { status = "unavailable"; }
    const timer = window.setTimeout(() => {
      setStorageState(status);
      if (status === "unavailable") setCanPersist(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draft, restored, canPersist]);

  useEffect(() => {
    if (!aboutOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { setAboutOpen(false); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previous?.focus(); };
  }, [aboutOpen]);

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setNotice("");
  }
  function updateFeature(key: keyof ProjectInput["features"], value: boolean) {
    setDraft((current) => ({ ...current, features: { ...current.features, [key]: value } }));
    setNotice("");
  }

  function replaceStoredDraft() {
    if (!window.confirm("¿Reemplazar el borrador local anterior con la configuración que está en pantalla?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCanPersist(true);
      setStorageState("saved");
      setNotice("El borrador actual se guardará en este navegador.");
    } catch { setStorageState("unavailable"); }
  }

  async function validate() {
    setValidating(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/projects/validate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.issues?.map((item: { message: string }) => item.message).join(" · ") || payload.error || "No se pudo verificar.");
      setQualityOverride({ signature, quality: payload.quality as QualityReport });
      setDossierTab("quality");
      setNotice("Controles calculados con la configuración actual.");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "No se pudo verificar."); }
    finally { setValidating(false); }
  }

  async function exportZip() {
    if (!result || dirty) return;
    setExporting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/projects/export", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft)
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "No se pudo exportar el ZIP.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${result.manifest.slug}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setNotice("ZIP descargado. Puedes instalarlo con npm ci.");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "No se pudo exportar."); }
    finally { setExporting(false); }
  }

  const files = useMemo(() => result?.files ?? [], [result]);
  const filteredFiles = useMemo(() => files.filter((file) => file.path.toLowerCase().includes(fileQuery.toLowerCase().trim())), [files, fileQuery]);
  const selectedFile = files.find((file) => file.path === selectedPath) ?? files[0];
  const quality = qualityOverride?.signature === signature ? qualityOverride.quality : result?.quality;
  const qualityStale = dirty && qualityOverride?.signature !== signature;
  const totalBytes = files.reduce((sum, file) => sum + new TextEncoder().encode(file.content).length, 0);
  const inputValid = projectInputSchema.safeParse(draft).success;
  const codeTruncated = (selectedFile?.content.length ?? 0) > 24_000;
  const visibleCode = selectedFile ? (codeTruncated ? selectedFile.content.slice(0, 24_000) + "\n/* Vista recortada: copia o descarga el archivo completo. */" : selectedFile.content) : "";

  async function copyFile() {
    if (!selectedFile) return;
    try { await navigator.clipboard.writeText(selectedFile.content); setNotice(`Copiado: ${selectedFile.path}`); }
    catch { setErrorMessage("El navegador no permitió copiar. Usa la descarga del archivo."); }
  }
  function downloadFile() {
    if (!selectedFile || !result) return;
    const url = URL.createObjectURL(new Blob([selectedFile.content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.manifest.slug}--${selectedFile.path.replaceAll("/", "-")}`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setNotice(`Archivo descargado: ${selectedFile.path}`);
  }

  return <div className="forge-app">
    <header className="topbar">
      <div className="brand-group"><a href="#estudio" className="brand" aria-label="AZUL FORGE, volver al estudio"><span className="brand-mark"><span /></span><span>AZUL<span className="brand-light">/FORGE</span></span></a><span className="brand-divider" /><span className="edition">ESTUDIO DE PROYECTOS <span>©26</span></span></div>
      <nav className="top-nav" aria-label="Principal"><a className="active" href="#estudio">Estudio</a><button type="button" onClick={() => setAboutOpen(true)}>El método <ArrowUpRight size={13} /></button></nav>
      <div className="top-actions"><span className="draft-indicator"><span className={storageState === "unavailable" || storageState === "invalid" ? "dot warning" : "dot"} />{storageState === "saved" ? "Borrador local" : storageState === "loading" ? "Cargando borrador" : "Sin guardado local"}</span><button type="button" className="export-button" onClick={exportZip} disabled={!result || dirty || loading || exporting} title={dirty ? "Actualiza el proyecto antes de exportar" : "Descargar proyecto completo"}><ArrowDownToLine size={16} />{exporting ? "Preparando ZIP…" : "Exportar ZIP"}</button></div>
    </header>

    <main className="studio-layout" id="estudio">
      <aside className="control-panel" aria-label="Configuración del proyecto">
        <div className="panel-intro"><div className="section-index"><span>01</span><span className="index-rule" /> EL ESTUDIO</div><h1>Ideas que <em>toman</em> forma.</h1><p>Configura una base visual, inspecciona su código y llévate un proyecto que puedes ejecutar.</p></div>
        <div className="control-scroll">
          <section className="control-section" aria-labelledby="templates-label"><div className="section-heading"><span className="section-count">01 / 04</span><h2 id="templates-label">Elige una dirección</h2></div>
            <div className="template-list">{templateCatalog.map((template, index) => {
              const Icon = templateIcons[index];
              const active = draft.template === template.slug;
              return <button type="button" key={template.slug} className={`template-choice ${active ? "selected" : ""}`} onClick={() => update("template", template.slug)} aria-pressed={active}>
                <span className="template-icon"><Icon size={19} strokeWidth={1.5} /></span><span className="template-copy"><strong>{template.name}</strong><small>{template.description}</small></span><span className="template-number">0{index + 1}</span>
              </button>;
            })}</div>
          </section>

          <section className="control-section" aria-labelledby="identity-label"><div className="section-heading"><span className="section-count">02 / 04</span><h2 id="identity-label">Identidad</h2></div>
            <label className="field-label" htmlFor="project-name">Nombre del proyecto <span>*</span></label><input id="project-name" className="text-field" maxLength={80} value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="Nombre de tu proyecto" />
            <label className="field-label" htmlFor="project-description">Descripción <span>*</span></label><textarea id="project-description" className="text-field description-field" maxLength={320} value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="¿Qué vas a crear?" rows={3} />
            <label className="field-label" htmlFor="project-author">Autoría <span className="optional">OPCIONAL</span></label><input id="project-author" className="text-field" maxLength={80} value={draft.author} onChange={(event) => update("author", event.target.value)} placeholder="Tu nombre o colectivo" />
          </section>

          <section className="control-section" aria-labelledby="visual-label"><div className="section-heading"><span className="section-count">03 / 04</span><h2 id="visual-label">Lenguaje visual</h2></div><div className="palette-list" role="group" aria-label="Paleta de color">
            {palettes.map((palette) => <button type="button" key={palette.id} className={`palette-choice ${draft.theme === palette.id ? "selected" : ""}`} aria-pressed={draft.theme === palette.id} onClick={() => update("theme", palette.id)}><span className="palette-swatches">{palette.colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span><span>{palette.name}</span>{draft.theme === palette.id && <Check size={13} aria-hidden="true" />}</button>)}
            </div></section>

          <section className="control-section feature-section" aria-labelledby="modules-label"><div className="section-heading"><span className="section-count">04 / 04</span><h2 id="modules-label">Módulos del proyecto</h2></div>
            {featureOptions.map((option) => <label className="feature-row" key={option.key}><span><strong>{option.title}</strong><small>{option.detail}</small></span><input type="checkbox" checked={draft.features[option.key]} onChange={(event) => updateFeature(option.key, event.target.checked)} /><span className="switch-track" aria-hidden="true"><span /></span></label>)}
          </section>
        </div>
        <div className="control-bottom"><button type="button" className="generate-button" onClick={() => void generate(draft)} disabled={loading || !inputValid}><WandSparkles size={17} />{loading ? "Generando…" : result && dirty ? "Actualizar proyecto" : "Generar proyecto"}<ArrowRight size={17} /></button><p><span className="tiny-square" />{!inputValid ? "Completa el nombre y la descripción para generar." : dirty && result ? "Cambios sin generar. Actualiza antes de exportar." : "Sin cuenta. El código es tuyo."}</p>{storageState === "invalid" && <button type="button" className="reset-draft" onClick={replaceStoredDraft}>Reemplazar borrador local anterior</button>}</div>
      </aside>

      <section className="workspace" aria-label="Vista previa y explorador de código">
        <div className="workspace-heading"><div><span className="eyebrow"><span className="pulse-mark" /> WORKSPACE / {result?.manifest.slug ?? "NUEVO PROYECTO"}</span><h2>El plano <span>cobra vida.</span></h2></div><div className="workspace-heading-mark" aria-hidden="true"><span>AF</span><span>∕ 01</span></div></div>
        <div className="workbench"><div className="workbench-toolbar"><div className="workspace-tabs" role="tablist" aria-label="Vista del proyecto"><button type="button" role="tab" aria-selected={view === "preview"} className={view === "preview" ? "selected" : ""} onClick={() => setView("preview")}><Monitor size={15} /> Vista previa</button><button type="button" role="tab" aria-selected={view === "code"} className={view === "code" ? "selected" : ""} onClick={() => setView("code")}><Code2 size={15} /> Código fuente</button></div><div className="toolbar-right">{view === "preview" ? <div className="device-switch" role="group" aria-label="Ancho de la vista"><button type="button" aria-label="Vista de escritorio" aria-pressed={device === "desktop"} className={device === "desktop" ? "selected" : ""} onClick={() => setDevice("desktop")}><Monitor size={15} /></button><button type="button" aria-label="Vista móvil" aria-pressed={device === "mobile"} className={device === "mobile" ? "selected" : ""} onClick={() => setDevice("mobile")}><Smartphone size={15} /></button></div> : <span className="toolbar-filename">{selectedFile?.path ?? "—"}</span>}<span className="toolbar-counter">{files.length.toString().padStart(2, "0")} FILES</span></div></div>
          {view === "preview" ? <div className={`preview-stage ${device === "mobile" ? "mobile-stage" : ""}`} role="tabpanel" aria-label="Vista de diseño">
            <div className="stage-grid" aria-hidden="true" /><div className={`browser-frame ${device === "mobile" ? "mobile-frame" : ""}`}><div className="browser-chrome"><span className="browser-dots"><i /><i /><i /></span><span className="browser-address"><span className="secure-icon">⌁</span> {result ? `${result.manifest.slug}.localhost` : "vista.azul-forge.local"}</span><span className="browser-more">···</span></div>
              {result ? <iframe title={`Vista de diseño de ${result.manifest.name}`} sandbox="" referrerPolicy="no-referrer" srcDoc={result.previewHtml} /> : <div className="preview-loading"><div className="loading-orbit"><span /></div><strong>Preparando el lienzo</strong><span>Un momento, estamos trazando tu proyecto.</span></div>}
            </div><div className="stage-corner top-left" /><div className="stage-corner top-right" /><div className="stage-corner bottom-left" /><div className="stage-corner bottom-right" /></div> : <div className="code-stage" role="tabpanel" aria-label="Código generado"><div className="code-stage-top"><span><FileCode2 size={15} />{selectedFile?.path ?? "Selecciona un archivo"}</span><div><button type="button" onClick={() => void copyFile()} disabled={!selectedFile} title="Copiar archivo completo"><Copy size={14} /> Copiar</button><button type="button" onClick={downloadFile} disabled={!selectedFile} title="Descargar archivo completo"><ArrowDownToLine size={14} /> Descargar</button></div></div>
            {selectedFile ? <div className="code-scroll" tabIndex={0} aria-label="Código fuente desplazable"><Highlight theme={themes.nightOwl} code={visibleCode} language={languageFor(selectedFile)}>{({ className, style, tokens, getLineProps, getTokenProps }) => <pre className={`source-code ${className}`} style={{ ...style, background: "transparent" }}><code>{tokens.map((line, index) => <span key={index} {...getLineProps({ line })}><span className="line-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{line.map((token, tokenIndex) => <span key={tokenIndex} {...getTokenProps({ token })} />)}</span></span>)}</code></pre>}</Highlight>{codeTruncated && <div className="code-limit">Vista recortada a 24.000 caracteres. Copia, descarga o exporta para obtener el archivo íntegro.</div>}</div> : <div className="preview-loading">Genera un proyecto para inspeccionar sus archivos.</div>}</div>}
          <div className="workbench-foot"><span><span className="foot-square" />{view === "preview" ? "VISTA DE DISEÑO AISLADA · SIN SCRIPTS" : selectedFile ? `${byteLabel(new TextEncoder().encode(selectedFile.content).length)} · ARCHIVO COMPLETO DISPONIBLE` : "EXPLORADOR VACÍO"}</span><span>{result && dirty ? "CAMBIOS SIN GENERAR" : loading ? "COMPILANDO ESTRUCTURA…" : result ? "LISTO PARA EXPLORAR" : "INICIANDO…"}</span></div>
        </div>
        <div className="workspace-caption"><div className="caption-symbol"><Sparkles size={17} /></div><div><strong>Tú pones el contenido. Nosotros, el punto de partida.</strong><p>La vista muestra el diseño; las funciones reales viven en el código exportado. Ninguna obra o cifra se inventa.</p></div><span className="caption-index">/ 01—03</span></div>
      </section>

      <aside className="dossier-panel" aria-label="Archivos y controles de calidad"><div className="dossier-heading"><span className="section-index"><span>02</span><span className="index-rule" /> DOSSIER DEL PROYECTO</span><h2>Todo a la <em>vista.</em></h2><p>Sin cajas negras. Cada archivo y cada comprobación, a tu alcance.</p></div>
        <div className="quality-card"><div className="quality-card-top"><span><ShieldCheck size={15} /> ÍNDICE ESTRUCTURAL</span><span>{qualityStale ? "DESACTUALIZADO" : result ? "AUTOMÁTICO" : "PENDIENTE"}</span></div><div className="quality-score"><div><strong>{quality?.score ?? "—"}</strong><span>/ 100</span></div><span className="quality-ring" style={{ "--score": `${quality?.score ?? 0}%` } as React.CSSProperties}><span><Check size={20} /></span></span></div><div className="quality-bar"><i style={{ width: `${quality?.score ?? 0}%` }} /></div><p>{qualityStale ? "Actualiza o verifica la configuración para recalcular." : "Controles de estructura; no certifican accesibilidad ni seguridad."}</p></div>
        <div className="dossier-tabs" role="tablist" aria-label="Panel de proyecto"><button type="button" role="tab" aria-selected={dossierTab === "files"} className={dossierTab === "files" ? "selected" : ""} onClick={() => setDossierTab("files")}><FolderOpen size={15} /> Archivos <span>{files.length}</span></button><button type="button" role="tab" aria-selected={dossierTab === "quality"} className={dossierTab === "quality" ? "selected" : ""} onClick={() => setDossierTab("quality")}><ClipboardCheck size={15} /> Controles</button></div>
        {dossierTab === "files" ? <div className="file-panel" role="tabpanel" aria-label="Archivos generados"><label className="file-search"><Search size={15} /><span className="sr-only">Buscar archivos</span><input value={fileQuery} onChange={(event) => setFileQuery(event.target.value)} placeholder="Buscar archivo…" /></label><div className="file-list-heading"><span>ÁRBOL DEL PROYECTO</span><span>{byteLabel(totalBytes)}</span></div><div className="file-list">{filteredFiles.map((file) => { const Icon = fileIcon(file.path); return <button type="button" key={file.path} className={`file-row ${selectedPath === file.path && view === "code" ? "selected" : ""}`} onClick={() => { setSelectedPath(file.path); setView("code"); }} title={file.path}><Icon size={15} strokeWidth={1.6} /><span>{file.path}</span><ChevronRight size={13} /></button>; })}{!filteredFiles.length && <p className="file-empty">{result ? "No hay archivos con ese nombre." : "Los archivos aparecerán aquí al generar."}</p>}</div></div> : <div className="checks-panel" role="tabpanel" aria-label="Controles de calidad"><div className="checks-heading"><span>VERIFICACIONES</span><span>{quality?.passed ?? 0} / {quality?.applicable ?? 0}</span></div><div className="checks-list">{quality?.checks.map((check) => <div className="check-row" key={check.id}><span className={!check.applicable ? "check-icon neutral" : check.passed ? "check-icon passed" : "check-icon"}>{!check.applicable ? <CircleMinus size={17} /> : check.passed ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}</span><div><strong>{check.label}</strong><small>{check.applicable ? check.detail : "No incluido por configuración."}</small></div></div>)}{!quality && <p className="file-empty">Genera un proyecto para ver los controles.</p>}</div><button className="verify-button" type="button" onClick={() => void validate()} disabled={validating || !inputValid}><RotateCw size={14} className={validating ? "spin" : ""} />{validating ? "Verificando…" : "Volver a verificar"}</button></div>}
        <div className="dossier-bottom"><div className="mini-stat"><Box size={17} /><span><strong>{files.length}</strong><small>archivos reales</small></span></div><div className="mini-stat"><Palette size={17} /><span><strong>{palettes.find((item) => item.id === draft.theme)?.name}</strong><small>dirección visual</small></span></div></div>
      </aside>
    </main>

    <footer className="site-bottom"><span>AZUL FORGE <span className="footer-asterisk">✳</span> DE LA IDEA AL CÓDIGO</span><div aria-live="polite" className={errorMessage ? "status-message error" : "status-message"}>{errorMessage || notice || (storageState === "invalid" ? "El borrador anterior es incompatible; no se ha sobrescrito." : storageState === "unavailable" ? "No se pudo guardar el borrador en este navegador." : "Tu configuración se guarda únicamente en este navegador.")}</div><span>BUILT TO BE BUILT ON <ArrowUpRight size={13} /></span></footer>

    {aboutOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAboutOpen(false); }}><section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="method-title" className="method-dialog"><button ref={closeRef} type="button" className="dialog-close" onClick={() => setAboutOpen(false)} aria-label="Cerrar"><X size={20} /></button><span className="section-index">EL MÉTODO / AZUL FORGE</span><h2 id="method-title">Un comienzo sólido, no una ilusión.</h2><p>AZUL FORGE transforma tu configuración en una aplicación Next.js editable. El servidor valida la entrada, compone los archivos, calcula controles estructurales y crea un ZIP instalable.</p><ol><li><span>01</span><strong>Diseña</strong><p>Elige portfolio, galería o tablero; define nombre, texto y paleta.</p></li><li><span>02</span><strong>Inspecciona</strong><p>Lee los archivos y la vista de diseño aislada. No ejecutamos código del usuario.</p></li><li><span>03</span><strong>Construye</strong><p>Descarga el ZIP, instala con <code>npm ci</code> y publícalo en un entorno compatible con Next.js.</p></li></ol><p className="method-note">El tablero guarda tareas solo en el navegador. Las obras empiezan vacías. GitHub Pages no ejecuta el backend de Next.js.</p><button type="button" className="dialog-action" onClick={() => setAboutOpen(false)}><Play size={15} /> Volver al estudio</button></section></div>}
  </div>;
}
