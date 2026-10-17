import type { ProjectManifest } from "./types";

type Colors = { background: string; surface: string; foreground: string; muted: string; accent: string; line: string };

const palettes: Record<ProjectManifest["theme"], { dark: Colors; light: Colors }> = {
  nocturne: {
    dark: { background: "#071523", surface: "#10273a", foreground: "#f0f7fc", muted: "#b7c9d8", accent: "#79ddf7", line: "#416074" },
    light: { background: "#f1f6f8", surface: "#ffffff", foreground: "#0c283b", muted: "#3e5766", accent: "#075e7b", line: "#b3c8d0" }
  },
  cerulean: {
    dark: { background: "#101b45", surface: "#1d3064", foreground: "#f5f7ff", muted: "#c1d1ed", accent: "#a9e9ff", line: "#5f79a8" },
    light: { background: "#eef2ff", surface: "#ffffff", foreground: "#172856", muted: "#3d4d75", accent: "#3151a5", line: "#a6b8e0" }
  },
  paper: {
    dark: { background: "#1b292d", surface: "#293b3e", foreground: "#f3f3e9", muted: "#c6d0c7", accent: "#bce3d2", line: "#5e7977" },
    light: { background: "#f7f5ef", surface: "#ffffff", foreground: "#243334", muted: "#475b58", accent: "#226452", line: "#bbc9c0" }
  }
};

export function getPalette(manifest: ProjectManifest): Colors {
  return palettes[manifest.theme][manifest.features.darkMode ? "dark" : "light"];
}

export function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const high = Math.max(luminance(a), luminance(b));
  const low = Math.min(luminance(a), luminance(b));
  return (high + 0.05) / (low + 0.05);
}
