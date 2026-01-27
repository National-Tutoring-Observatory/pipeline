import { defineConfig, devices } from "@playwright/test";

const browserExecutablePath = process.env.PLAYWRIGHT_BROWSER_EXECUTABLE_PATH;

const browserConfig = browserExecutablePath
  ? {
      ...devices["Desktop Chrome"],
      channel: "chrome",
      launchOptions: {
        executablePath: browserExecutablePath,
      },
    }
  : {
      ...devices["Desktop Chrome"],
      channel: "chrome",
    };

export default defineConfig({
  testDir: "./",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      use: browserConfig,
    },
    {
      name: "chromium",
      testIgnore: /.*\.setup\.ts/,
      use: {
        ...browserConfig,
        storageState: ".auth/user.json",
      },
    },
  ],
});
