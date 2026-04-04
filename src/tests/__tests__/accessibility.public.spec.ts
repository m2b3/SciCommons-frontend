import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const PUBLIC_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
  { name: 'Communities', path: '/communities' },
  { name: 'Discussions', path: '/discussions' },
  { name: 'Help', path: '/help' },
  { name: 'About', path: '/about' },
];

test.describe('Global Accessibility Audit (Public)', () => {
  for (const pageInfo of PUBLIC_PAGES) {
    test(`Audit Public: ${pageInfo.name}`, async ({ page }, testInfo) => {
      try {
        await page.goto(pageInfo.path, { waitUntil: 'commit', timeout: 60000 });
        await page.waitForSelector('h1, h2, main', { state: 'visible', timeout: 45000 });
        await page.waitForTimeout(1000);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe')
          .analyze();

        expect(results.violations).toEqual([]);

        if (testInfo.project.name.includes('browserstack')) {
          await page.evaluate(
            (_) => {},
            `browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed", "reason": "Audit Passed"}}`
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
