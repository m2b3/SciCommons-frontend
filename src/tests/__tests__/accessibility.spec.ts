import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TEST_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
  { name: 'Communities', path: '/communities' },
  { name: 'Discussions', path: '/discussions' },
  { name: 'My Contributions/Bookmarks', path: '/mycontributions' },
  { name: 'Profile Settings', path: '/settings' },
];

test.describe('Global Accessibility Audit', () => {
  for (const pageInfo of TEST_PAGES) {
    test(`Audit: ${pageInfo.name}`, async ({ page }) => {
      // 1. Navigate to the page
      await page.goto(pageInfo.path);
      
      // 2. Wait for the initial DOM to be ready
      await page.waitForLoadState('domcontentloaded');

      await page.waitForSelector('h1, h2, main', { state: 'visible', timeout: 15000 });

     
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n [${pageInfo.name}] Found ${accessibilityScanResults.violations.length} violations:`);
        accessibilityScanResults.violations.forEach((v, i) => {
          console.log(`${i + 1}. ${v.id.toUpperCase()} (${v.impact})`);
          console.log(`Element: ${v.nodes[0].html}`);
          console.log(`Fix: ${v.help} -> ${v.helpUrl}\n`);
        });
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});