import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PUBLIC_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
  { name: 'Communities', path: '/communities' },
  { name: 'Discussions', path: '/discussions' },
  { name: "Help", path: '/help' },
  { name: 'About', path: '/about' },
];

test.describe('Global Accessibility Audit (Public)', () => {
  for (const pageInfo of PUBLIC_PAGES) {
    test(`Audit Public: ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1, h2, main', { state: 'visible', timeout: 15000 });
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
