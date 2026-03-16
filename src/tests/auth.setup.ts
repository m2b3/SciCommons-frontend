import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  /* Fixed by Codex on 2026-03-16
     Who: Codex
     What: Added strict environment validation for Playwright auth setup.
     Why: Empty or missing credentials can accidentally produce misleading downstream test behavior.
     How: Fail immediately with an explicit error before attempting UI login. */
  const loginValue = process.env.PW_LOGIN?.trim();
  const passwordValue = process.env.PW_PASSWORD?.trim();

  if (!loginValue || !passwordValue) {
    throw new Error('Missing PW_LOGIN or PW_PASSWORD in .playwrightenv');
  }

  console.log('Navigating to Login Page...');

  await page.goto('/auth/login', { timeout: 90000 });

  const loader = page.getByText(/performing some checks/i);
  if (await loader.isVisible()) {
    console.log('Waiting for SciCommons loader to finish...');
    await loader.waitFor({ state: 'hidden', timeout: 60000 });
  }

  console.log('Locating login inputs...');
  const emailInput = page.locator(
    'input[name="username"], input[name="email"], input[type="text"]'
  );

  await emailInput.first().waitFor({ state: 'visible', timeout: 60000 });

  await emailInput.first().fill(loginValue);
  await page.locator('input[type="password"]').fill(passwordValue);

  console.log('Submitting credentials...');
  await page.getByRole('button', { name: /login/i }).first().click();

  try {
    await page.waitForURL(/^(?!.*\/auth\/login).*/, { timeout: 45000 });
    await expect(page).not.toHaveURL(/\/auth\/login(?:\?|$)/);
    console.log('Login successful! State saved.');
  } catch (e) {
    const alert = page.getByRole('alert');
    const errorText = await alert.innerText().catch(() => 'Unknown Error');
    throw new Error(`Authentication failed. UI says: ${errorText}`);
  }

  await page.context().storageState({ path: authFile });
});
