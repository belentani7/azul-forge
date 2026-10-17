import { getPalette } from "./palette";
import type { ProjectManifest } from "./types";

export function generatedCss(manifest: ProjectManifest): string {
  const color = getPalette(manifest);
  return `:root {
  color-scheme: ${manifest.features.darkMode ? "dark" : "light"};
  --bg: ${color.background}; --surface: ${color.surface}; --ink: ${color.foreground};
  --muted: ${color.muted}; --accent: ${color.accent}; --line: ${color.line};
  font-family: Arial, Helvetica, sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; color: var(--ink); background: var(--bg); line-height: 1.55; }
a { color: inherit; }
a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
button, input { font: inherit; }
button:disabled { opacity: .55; cursor: not-allowed; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.skip-link { position: absolute; top: -100px; left: 1rem; padding: .75rem; background: var(--surface); z-index: 10; }
.skip-link:focus { top: 1rem; }
.site-shell { max-width: 1320px; margin: auto; padding: 0 clamp(1.4rem, 5vw, 5rem); }
.site-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.75rem 0; border-bottom: 1px solid var(--line); }
.wordmark { font-size: .9rem; font-weight: 800; letter-spacing: -.04em; text-decoration: none; text-transform: uppercase; }
.wordmark span { display: inline-block; width: .7rem; height: .7rem; margin-right: .7rem; border-radius: 50%; background: var(--accent); }
.site-header nav { display: flex; gap: 1.5rem; font-size: .82rem; color: var(--muted); }
.site-header nav a { text-decoration: none; }
.site-header nav a:hover { color: var(--ink); }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(220px, .9fr); min-height: 66vh; align-items: center; gap: clamp(1.5rem, 5vw, 6rem); padding: 5rem 0 6rem; }
.overline { font-size: .72rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); }
.display { max-width: 13ch; margin: 1.2rem 0 1.5rem; font-size: clamp(3.6rem, 8vw, 7.8rem); font-weight: 700; letter-spacing: -.085em; line-height: .98; overflow-wrap: anywhere; }
.intro { max-width: 55ch; color: var(--muted); font-size: clamp(1rem, 1.4vw, 1.18rem); }
.text-link { display: inline-flex; align-items: center; gap: .7rem; margin-top: 2rem; padding-bottom: .45rem; border-bottom: 1px solid var(--accent); text-decoration: none; font-size: .86rem; font-weight: 700; }
.text-link:hover { gap: 1rem; color: var(--accent); }
.hero-art { position: relative; aspect-ratio: 1; min-height: 280px; overflow: hidden; border: 1px solid var(--line); background: var(--surface); display: grid; place-items: center; }
.hero-art::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 14% 14%; opacity: .25; }
.hero-art::after { content: ""; width: 58%; aspect-ratio: 1; border: 1px solid var(--accent); border-radius: 50%; box-shadow: 0 0 0 55px color-mix(in srgb, var(--accent) 10%, transparent), 0 0 0 110px color-mix(in srgb, var(--accent) 5%, transparent); transform: rotate(-28deg) scaleX(.72); }
.art-label { position: absolute; left: 1.3rem; bottom: 1.3rem; font-size: .68rem; text-transform: uppercase; letter-spacing: .15em; color: var(--muted); }
${manifest.features.generative ? `.hero-art, .board { background-image: radial-gradient(circle at 65% 38%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%); }` : ".hero-art::after { box-shadow: none; }"}
.section-head { display: flex; align-items: end; justify-content: space-between; gap: 1rem; padding: 0 0 1.2rem; border-bottom: 1px solid var(--line); }
.section-head h2 { margin: .5rem 0 0; font-size: clamp(2rem, 4vw, 3.6rem); line-height: 1.05; letter-spacing: -.06em; }
.section-head small { color: var(--muted); }
.work-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.2rem; padding: 2rem 0 6rem; }
.work-card { padding: 1.5rem; border: 1px solid var(--line); background: var(--surface); }
.work-card .work-art { aspect-ratio: 1.45; display: grid; place-items: center; margin-bottom: 1.5rem; overflow: hidden; background: linear-gradient(135deg, var(--bg), var(--surface)); color: var(--accent); font-size: 3rem; }
.work-art img { display: block; width: 100%; height: 100%; object-fit: cover; }
.work-card h3 { margin: 0 0 .35rem; font-size: 1.6rem; letter-spacing: -.05em; }
.work-card p, .work-card small { color: var(--muted); }
.empty { grid-column: 1 / -1; padding: clamp(2rem, 5vw, 4rem); border: 1px dashed var(--line); color: var(--muted); background: var(--surface); }
.empty strong { display: block; margin-bottom: .5rem; color: var(--ink); font-size: 1.1rem; }
.gallery-heading { padding: 5rem 0 3rem; }
.gallery-heading .display { max-width: 16ch; }
.gallery-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; padding-bottom: 7rem; }
.gallery-grid .work-art { aspect-ratio: .85; }
.board-shell { padding: 5rem 0 7rem; max-width: 820px; }
.board-shell h1 { max-width: 13ch; }
.board { margin-top: 3rem; border: 1px solid var(--line); background: var(--surface); padding: clamp(1.4rem, 4vw, 3rem); }
.board-top { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; border-bottom: 1px solid var(--line); padding-bottom: 1rem; }
.board-top h2 { margin: 0; letter-spacing: -.04em; }
.board-top small, .board-note { color: var(--muted); }
.board-form { display: flex; gap: .6rem; margin-top: 1.7rem; }
.board-form input { flex: 1; min-width: 0; padding: .8rem 1rem; color: var(--ink); background: var(--bg); border: 1px solid var(--line); }
.board-form button, .board-item button { padding: .8rem 1rem; color: var(--bg); background: var(--accent); border: 0; cursor: pointer; }
.board-list { list-style: none; padding: 0; margin: 2rem 0 0; }
.board-item { display: flex; align-items: center; gap: .8rem; border-top: 1px solid var(--line); padding: 1rem 0; }
.board-item span { flex: 1; overflow-wrap: anywhere; }
.board-item[data-done="true"] span { color: var(--muted); text-decoration: line-through; }
.board-item button { color: var(--muted); background: transparent; border: 1px solid var(--line); padding: .35rem .6rem; }
.board-item button:hover { color: var(--ink); }
.storage-warning { margin: 1rem 0; padding: .8rem 1rem; border: 1px solid var(--accent); color: var(--ink); font-size: .86rem; }
.storage-warning p { margin: 0 0 .5rem; }
.storage-warning button { background: transparent; color: var(--accent); border: 1px solid var(--accent); padding: .35rem .5rem; }
.site-footer { display: flex; justify-content: space-between; gap: 1rem; padding: 2rem 0; border-top: 1px solid var(--line); color: var(--muted); font-size: .75rem; }
@media (max-width: 760px) { .hero-grid { min-height: 0; padding: 2.5rem 0 3rem; gap: 1.4rem; } .hero-grid .display { font-size: clamp(3rem, 7vw, 5.8rem); } .hero-art { min-height: 220px; } .gallery-grid { grid-template-columns: repeat(2, 1fr); } .site-header nav { gap: .7rem; } }
@media (max-width: 600px) { .hero-grid { grid-template-columns: 1fr; padding: 3rem 0; } .hero-art { aspect-ratio: 1.6; min-height: 220px; } }
@media (max-width: 520px) { .work-list, .gallery-grid { grid-template-columns: 1fr; } .site-header nav a:last-child { display: none; } .board-form { flex-direction: column; } .site-footer { flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; } }
`;
}

const header = `<a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="site-header"><a className="wordmark" href="#inicio"><span aria-hidden="true" />{site.name}</a>
      <nav aria-label="Navegación principal"><a href="#contenido">Inicio</a><a href="#coleccion">${"Colección"}</a></nav></header>`;
const footer = `<footer className="site-footer"><span>{site.name} · {new Date().getFullYear()}</span><span>Hecho para mostrar trabajo real.</span></footer>`;

export function generatedPage(manifest: ProjectManifest): string {
  if (manifest.template === "creative-dashboard") return `import { site } from "@/lib/content";
import { CreativeBoard } from "@/components/creative-board";

export default function Home() {
  return <div className="site-shell" id="inicio">
    ${header}
    <main id="contenido" className="board-shell">
      <p className="overline">ESTUDIO / ORGANIZACIÓN PERSONAL</p>
      <h1 className="display">{site.name}</h1>
      <p className="intro">{site.description}</p>
      <CreativeBoard />
    </main>
    ${footer}
  </div>;
}
`;
  if (manifest.template === "visual-gallery") return `import Image from "next/image";
import { site, works } from "@/lib/content";

export default function Home() {
  return <div className="site-shell" id="inicio">
    ${header}
    <main id="contenido">
      <section className="gallery-heading"><p className="overline">ARCHIVO VISUAL / EDICIÓN ABIERTA</p>
        <h1 className="display">{site.name}</h1><p className="intro">{site.description}</p></section>
      <section id="coleccion" aria-labelledby="galeria-titulo"><div className="section-head"><div><p className="overline">01 / EL ARCHIVO</p><h2 id="galeria-titulo">La colección</h2></div><small>{works.length} piezas publicadas</small></div>
        <div className="gallery-grid">{works.length ? works.map((work) => <article className="work-card" key={work.id}><div className="work-art">{work.image ? <Image src={work.image} alt={work.alt || work.title} width={960} height={720} /> : <span aria-hidden="true">◇</span>}</div><small>{work.year}</small><h3>{work.title}</h3><p>{work.description}</p></article>) : <div className="empty"><strong>Sin obras todavía.</strong>Incorpora tus piezas reales en <code>lib/content.ts</code>; aparecerán aquí y en la API de contenido.</div>}</div>
      </section>
    </main>
    ${footer}
  </div>;
}
`;
  return `import Image from "next/image";
import { site, works } from "@/lib/content";

export default function Home() {
  return <div className="site-shell" id="inicio">
    ${header}
    <main id="contenido">
      <section className="hero-grid" aria-labelledby="titulo"><div><p className="overline">PORTFOLIO / PRÁCTICA CREATIVA</p>
        <h1 id="titulo" className="display">{site.name}</h1><p className="intro">{site.description}</p><a className="text-link" href="#coleccion">Explorar el trabajo <span aria-hidden="true">↗</span></a></div>
        <div className="hero-art" aria-hidden="true"><span className="art-label">Forma · luz · código</span></div></section>
      <section id="coleccion" aria-labelledby="obras-titulo"><div className="section-head"><div><p className="overline">01 / SELECCIÓN</p><h2 id="obras-titulo">Obras</h2></div><small>{works.length} obras publicadas</small></div>
        <div className="work-list">{works.length ? works.map((work) => <article className="work-card" key={work.id}><div className="work-art">{work.image ? <Image src={work.image} alt={work.alt || work.title} width={960} height={720} /> : <span aria-hidden="true">◇</span>}</div><small>{work.year}</small><h3>{work.title}</h3><p>{work.description}</p></article>) : <div className="empty"><strong>Sin obras todavía.</strong>Añade tu trabajo real en <code>lib/content.ts</code>. No se publican piezas ficticias.</div>}</div>
      </section>
    </main>
    ${footer}
  </div>;
}
`;
}

export const generatedBoard = `"use client";

import { useEffect, useState, type FormEvent } from "react";
import { site } from "@/lib/content";

type Entry = { id: string; title: string; done: boolean };
const key = "azul-board:v1:" + site.slug;

export function CreativeBoard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [canPersist, setCanPersist] = useState(true);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(key) || "[]");
        const valid = (entry: unknown): entry is Entry => !!entry && typeof entry === "object" &&
          "id" in entry && typeof entry.id === "string" && "title" in entry &&
          typeof entry.title === "string" && entry.title.length <= 80 &&
          "done" in entry && typeof entry.done === "boolean";
        if (!Array.isArray(saved) || saved.length > 100 || !saved.every(valid)) throw new Error("Datos locales inválidos");
        setEntries(saved);
      } catch { setStorageError(true); setCanPersist(false); }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded || !canPersist) return;
    let failed = false;
    try { localStorage.setItem(key, JSON.stringify(entries)); }
    catch { failed = true; }
    if (failed) {
      const timer = window.setTimeout(() => { setStorageError(true); setCanPersist(false); }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [entries, loaded, canPersist]);

  function resetStorage() {
    if (!window.confirm("¿Eliminar los datos locales de este tablero y empezar de nuevo?")) return;
    try { localStorage.removeItem(key); setEntries([]); setCanPersist(true); setStorageError(false); }
    catch { setStorageError(true); }
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = title.trim();
    if (!clean || entries.length >= 100) return;
    setEntries((current) => [{ id: crypto.randomUUID(), title: clean, done: false }, ...current]);
    setTitle("");
  }

  return <section className="board" id="coleccion" aria-label="Tablero de trabajo">
    <div className="board-top"><h2>En curso</h2><small>{entries.filter((entry) => !entry.done).length} pendientes · {entries.length} en total</small></div>
    <p className="board-note">Tus entradas viven solo en este navegador. No se envían a un servidor.</p>
    <form className="board-form" onSubmit={add}><label className="sr-only" htmlFor="new-entry">Nueva tarea</label>
      <input id="new-entry" maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Escribe una tarea real…" />
      <button type="submit" disabled={!title.trim() || entries.length >= 100}>Añadir ↗</button></form>
    {storageError && <div role="status" className="storage-warning"><p>No se pudo leer o guardar el almacenamiento local. No sobrescribimos los datos anteriores; los cambios de esta sesión quizá no se conserven.</p><button type="button" onClick={resetStorage}>Restablecer datos locales</button></div>}
    {entries.length ? <ul className="board-list">{entries.map((entry) => <li className="board-item" data-done={entry.done} key={entry.id}>
      <input type="checkbox" checked={entry.done} aria-label={"Completar " + entry.title} onChange={() => setEntries((current) => current.map((item) => item.id === entry.id ? { ...item, done: !item.done } : item))} />
      <span>{entry.title}</span><button type="button" aria-label={"Eliminar " + entry.title} onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))}>Eliminar</button>
    </li>)}</ul> : <p className="empty"><strong>No hay tareas todavía.</strong>Añade la primera para empezar. El contador muestra solo tus entradas reales.</p>}
  </section>;
}
`;
