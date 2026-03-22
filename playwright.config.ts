import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const playwrightEnvPath = path.resolve(__dirname, '.playwrightenv');
dotenv.config({ path: playwrightEnvPath });

const isCI = !!process.env.CI;
const STORAGE_STATE = 'playwright/.auth/user.json';
const isBrowserStackEnabled = Boolean(
  process.env.PW_USE_BROWSERSTACK === '1' &&
  process.env.BROWSERSTACK_USERNAME &&
  process.env.BROWSERSTACK_ACCESS_KEY,
);

const caps = {
  browser: 'chrome',
  os: 'osx',
  os_version: 'sonoma',
  project: 'SciCommons Accessibility', 
  build: 'Initial Setup Build',
  'browserstack.username': process.env.BROWSERSTACK_USERNAME,
  'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
  'browserstack.local': 'true',
};

/* Fixed by Codex on 2026-03-22
   Problem: BrowserStack setup was enabled for every Playwright invocation.
   Solution: Gate BrowserStack tunnel/bootstrap and remote projects behind an explicit opt-in flag plus required credentials.
   Result: Local Chromium accessibility runs keep working unchanged, while BrowserStack remains available when intentionally enabled. */
const browserStackProjects = isBrowserStackEnabled
  ? [
      {
        name: 'browserstack-public',
        use: {
          connectOptions: {
            wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({ ...caps, name: 'Public Audit' }))}`,
          },
        },
        testMatch: /accessibility\.public\.spec\.ts/,
      },
      {
        name: 'browserstack-protected',
        use: {
          storageState: STORAGE_STATE,
          connectOptions: {
            wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({ ...caps, name: 'Protected Audit' }))}`,
          },
        },
        dependencies: ['setup'],
        testMatch: /accessibility\.protected\.spec\.ts/,
      },
    ]
  : [];

export default defineConfig({
  globalSetup: isBrowserStackEnabled ? require.resolve('./src/tests/global-setup') : undefined,
  globalTeardown: isBrowserStackEnabled ? require.resolve('./src/tests/global-teardown') : undefined,
  timeout: 120000,
  expect: {
    timeout: 30000,
  },

  testDir: './src/tests',
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : 1,
  reporter: [['list'], ['html']],
  use: {
    actionTimeout: 60000,
    navigationTimeout: 60000,
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
    ...browserStackProjects,
  ],
});
