import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const PROTECTED_PAGES = [
  { name: 'My Contributions', path: '/mycontributions' },
  { name: 'Settings', path: '/settings' },
  { name: 'Profile', path: '/myprofile' },
  { name: 'Submit Article', path: '/submitarticle' },
  { name: 'Create Community', path: '/createcommunity' },
];

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Global Accessibility Audit (Protected)', () => {
  for (const pageInfo of PROTECTED_PAGES) {
    test(`Audit Protected: ${pageInfo.name}`, async ({ page }, testInfo) => {
      try {
        await page.goto(pageInfo.path, { waitUntil: 'commit', timeout: 60000 });

        /* Fixed by Codex on 2026-03-16
           Who: Codex
           What: Added explicit protected-route URL assertions before running Axe.
           Why: Prevent false-pass audits when auth failure silently redirects to /auth/login.
           How: Assert the page URL is not login and still resolves to the expected protected path. */
        await expect(page).not.toHaveURL(/\/auth\/login(?:\?|$)/);
        await expect(page).toHaveURL(new RegExp(`${escapeRegex(pageInfo.path)}(?:[/?#].*)?$`));

        await page.waitForSelector('h1, h2, main', { state: 'visible', timeout: 45000 });
        await page.waitForTimeout(1000);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        expect(results.violations).toEqual([]);

        if (testInfo.project.name.includes('browserstack')) {
          await page.evaluate(
            (_) => {},
            `browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed", "reason": "Accessibility Audit Passed"}}`
          );
        }
      } catch (e: unknown) {
        if (testInfo.project.name.includes('browserstack')) {
          await page.evaluate(
            (_) => {},
            `browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed", "reason": "${getErrorMessage(e)}"}}`
          );
        }
        throw e;
      }
    });
  }
});
