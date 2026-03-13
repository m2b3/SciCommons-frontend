import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PUBLIC_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
  { name: 'Communities', path: '/communities' },
  { name: 'Discussions', path: '/discussions' },
];

const PROTECTED_PAGES = [
  { name: 'My Contributions/Bookmarks', path: '/mycontributions' },
  { name: 'Profile Settings', path: '/settings' },
];

test.describe('Global Accessibility Audit', () => {
  for (const pageInfo of PUBLIC_PAGES) {
    test(`Audit Public: ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('h1, h2, main', { state: 'visible', timeout: 15000 });
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }

  for (const pageInfo of PROTECTED_PAGES) {
    test(`Audit Protected: ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByRole('link', { name: /login/i })).not.toBeVisible();

      await page.waitForSelector('h1, h2, main', { state: 'visible', timeout: 15000 });
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
