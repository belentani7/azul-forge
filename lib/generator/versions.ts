// Dependencias fijadas para que el ZIP pueda incluir un lockfile reproducible.
export const generatedDependencies = {
  next: "16.4.2",
  react: "19.3.1",
  "react-dom": "19.3.1"
} as const;

export const generatedDevDependencies = {
  "@eslint/js": "10.0.1",
  "@types/node": "22.20.5",
  "@types/react": "19.3.0",
  "@types/react-dom": "19.3.0",
  eslint: "10.13.0",
  "eslint-plugin-react-hooks": "7.1.0",
  globals: "17.13.0",
  typescript: "5.9.3",
  "typescript-eslint": "8.71.2"
} as const;

export const generatedTestDependencies = { vitest: "5.0.5" } as const;

export function generatedPackage(tests: boolean, slug: string) {
  return {
    name: slug,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "eslint . --max-warnings 0",
      typecheck: "tsc --noEmit",
      ...(tests ? { test: "vitest run" } : {})
    },
    dependencies: generatedDependencies,
    devDependencies: { ...generatedDevDependencies, ...(tests ? generatedTestDependencies : {}) },
    engines: { node: ">=22.13.0" }
  };
}
