import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./test/vitest.globalSetup.ts",
    setupFiles: ["./test/vitest.dbSetup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["app/**/*.{ts,tsx,js,jsx}", "workers/**/*.{ts,js}"],
      exclude: [
        "**/node_modules/**",
        "test/**",
        "fixtures/**",
        "build/**",
        "public/**",
        "data/**",
        "tmp/**",
      ],
    },
  },
  plugins: [tsconfigPaths()],
});
