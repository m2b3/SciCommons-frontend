import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './src/tests',
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [['list'], ['html']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  /* Fixed by Codex on 2026-03-12
     Problem: Manual accessibility runs depended on a separately started Next.js server,
     and broad Playwright discovery could pick up Jest suites from src/tests.
     Solution: Restrict Playwright to *.spec files and let Playwright start or reuse the
     local Next.js dev server only when Playwright itself is invoked.
     Result: yarn test:ally stays manual, starts the app only when needed, and avoids
     executing Jest tests under the Playwright runner. */
  webServer: {
    command: 'yarn dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Small Phone (iPhone SE)',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'Tablet Landscape',
      use: { ...devices['iPad Pro 11 landscape'] },
    },
    {
      name: 'Galaxy Fold',
      use: { ...devices['Galaxy Z Fold 5'] },
    },
    {
      name: 'Wide Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 },
      },
    },
  ],
});
