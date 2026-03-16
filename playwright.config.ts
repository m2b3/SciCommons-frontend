import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;
const STORAGE_STATE = 'playwright/.auth/user.json';

export default defineConfig({
  timeout: 120000,
  expect: {
    timeout: 15000,
  },

  testDir: './src/tests',
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : 1,
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
    timeout: 240000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'Small Phone (iPhone SE)',
      use: {
        ...devices['iPhone SE'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'Tablet Landscape',
      use: {
        ...devices['iPad Pro 11 landscape'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'Galaxy Fold',
      use: {
        ...devices['Galaxy Z Fold 5'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'Wide Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 },
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ],
});
