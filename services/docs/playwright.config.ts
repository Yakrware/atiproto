import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8788",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npx react-router dev --port 8788",
    port: 8788,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
