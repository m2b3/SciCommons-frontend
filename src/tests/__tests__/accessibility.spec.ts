import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Test Suite for SciCommons
 * Standards: WCAG 2.1 Level A & AA
 * Tooling: Playwright + Axe-Core
 */

const TEST_PAGES = [
  { name: 'Home Page', path: '/' },
  { name: 'Login Page', path: '/auth/login' },
  { name: 'Register Page', path: '/auth/register' },
  { name: 'Communities List', path: '/communities' },
  { name: 'Discussions List', path: '/discussions' },
];

test.describe('Automated Accessibility Audit', () => {
  for (const pageInfo of TEST_PAGES) {
    test(`Page: ${pageInfo.name} should comply with WCAG 2.1 AA`, async ({ page }) => {
      // Navigate to the target page
      await page.goto(pageInfo.path);

      // Wait for the main content to hydrate to avoid false positives
      await page.waitForLoadState('networkidle');

      // Initialize AxeBuilder
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // If violations are found, print a detailed report for the GSoC PR
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n--- Accessibility Report for ${pageInfo.name} ---`);
        
        accessibilityScanResults.violations.forEach((violation, index) => {
          console.log(`${index + 1}. [${violation.impact?.toUpperCase()}] ${violation.id}`);
          console.log(`   Description: ${violation.description}`);
          console.log(`   Help: ${violation.help}`);
          console.log(`   WCAG Link: ${violation.helpUrl}`);
          console.log(`   Elements affected: ${violation.nodes.length}`);
          
          // Print the specific HTML source of the first failing element for quick fixing
          console.log(`   Sample Element: ${violation.nodes[0].html}\n`);
        });
      }

      // Assert that there are zero violations
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});