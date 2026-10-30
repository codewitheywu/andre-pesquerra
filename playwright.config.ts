import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Runs against the production build (`npm run build` first). Chromium
// projects use the locally installed Chrome; Firefox and WebKit need
// `npx playwright install firefox webkit` once.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // Six browser setups at the default 4 workers starve Firefox and WebKit on
  // a laptop: client navigations that take ~150ms alone overran 5–30s.
  workers: process.env.CI ? undefined : 3,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chrome-1280",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 800 } },
    },
    {
      name: "chrome-768",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 768, height: 1024 } },
    },
    {
      name: "chrome-375",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 375, height: 667 },
        // Match the screen to the viewport like a real phone; the desktop
        // descriptor's 1920px screen skews responsive image preloads.
        screen: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: "firefox-1280", use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } } },
    // Playwright's WebKit build for Windows intermittently stalls ~30s on the
    // document request under parallel load (traced: no sub-resource is ever
    // requested; standalone loads take ~330ms). Retries keep the run green
    // while still reporting those tests as "flaky" instead of hiding them.
    {
      name: "webkit-1280",
      retries: 2,
      use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } },
    },
    { name: "webkit-iphone", retries: 2, use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
