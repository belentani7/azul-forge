import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { alias: { "@": import.meta.dirname } },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    environment: "node",
    coverage: { exclude: [".research/**", "google_drive/**", ".next/**"] }
  }
});
