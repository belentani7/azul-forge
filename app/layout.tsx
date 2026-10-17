import type { Metadata } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AZUL FORGE — Estudio de proyectos",
  description: "Diseña, verifica y exporta bases web reales para proyectos creativos. Sin cuentas, sin piezas ficticias y con el código en tus manos.",
  applicationName: "AZUL FORGE",
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
