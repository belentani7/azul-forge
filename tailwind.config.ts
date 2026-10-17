import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: "#031425",
        night: "#071E33",
        electric: "#2D7DFF",
        cyan: {
          soft: "#66E0FF",
        },
        ice: "#F2F8FF",
        mist: "#9DB2C7",
        success: "#3DDC97",
        warning: "#FFC857",
        danger: "#FF6B6B",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(45, 125, 255, 0.25)",
        "glow-cyan": "0 0 32px rgba(102, 224, 255, 0.18)",
      },
      animation: {
        "fade-in": "fade-in 700ms ease-out both",
        "rise": "rise 800ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 6s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
