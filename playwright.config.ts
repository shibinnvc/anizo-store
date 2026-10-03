import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: "npm start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 60000,
    env: { SITE_URL: "http://localhost:3100" },
  },
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3100",
    browserName: "chromium",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
