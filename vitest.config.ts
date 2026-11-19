import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Lets tests use the same `@/...` imports as the app (from tsconfig.json).
    tsconfigPaths: true,
  },
});
