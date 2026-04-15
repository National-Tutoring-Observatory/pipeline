import { fileURLToPath } from "url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
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
        "e2e/**",
      ],
      thresholds: {
        branches: 15,
        functions: 20,
        lines: 20,
        statements: 20,
      },
    },
  },
  plugins: [tsconfigPaths()],
  resolve: {
    alias: process.env.BULLMQ_PRO_TOKEN
      ? {}
      : {
          "@taskforcesh/bullmq-pro": fileURLToPath(
            new URL("./test/mocks/bullmq-pro.ts", import.meta.url),
          ),
        },
  },
});
