import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      globalSetup: './test/vitest.globalSetup.ts',
      setupFiles: ['./test/vitest.dbSetup.ts', './test/vitest.adaptersSetup.ts'],
    },
  })
))
