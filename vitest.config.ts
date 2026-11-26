import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Lets tests use the same `@/...` imports as the app (from tsconfig.json).
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
