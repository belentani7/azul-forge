import Link from "next/link";

export default function NotFound() {
  return <main className="system-page"><span className="system-kicker">AZUL FORGE / 404</span><h1>Esta ruta no forma parte del plano.</h1><p>Vuelve al estudio para diseñar y exportar tu proyecto.</p><Link href="/">Volver al estudio ↗</Link></main>;
}
