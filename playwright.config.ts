import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const playwrightEnvPath = path.resolve(__dirname, '.playwrightenv');
dotenv.config({ path: playwrightEnvPath });

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
      /* Fixed by Codex on 2026-03-16
         Who: Codex
         What: Split unauthenticated accessibility tests into a separate project.
         Why: Public page audits should not depend on login setup or auth storage state.
         How: Run only accessibility.public.spec.ts in a dedicated project with no setup dependency. */
      name: 'public-chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /accessibility\.public\.spec\.ts/,
    },
    {
      /* Fixed by Codex on 2026-03-16
         Who: Codex
         What: Scope authenticated accessibility tests to a separate project.
         Why: Protected audits must explicitly depend on successful auth setup.
         How: Run accessibility.protected.spec.ts with setup dependency and storage state. */
      name: 'protected-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testMatch: /accessibility\.protected\.spec\.ts/,
    },
  ],
});
