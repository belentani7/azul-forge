"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="system-page"><span className="system-kicker">AZUL FORGE / ERROR</span><h1>Algo no salió como estaba previsto.</h1><p>Tu borrador permanece en este navegador. Puedes intentarlo de nuevo.</p><button onClick={reset}>Reintentar ↗</button></main>;
}
