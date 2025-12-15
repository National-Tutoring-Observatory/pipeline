import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './test/vitest.globalSetup.ts',
    setupFiles: ['./test/vitest.dbSetup.ts', './test/vitest.adaptersSetup.ts'],
  },
  plugins: [tsconfigPaths()],
})
