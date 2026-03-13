import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  console.log('Navigating to Login Page...');
  
  await page.goto('/auth/login', { timeout: 90000 });

  
  const loader = page.getByText(/performing some checks/i);
  if (await loader.isVisible()) {
    console.log('Waiting for SciCommons loader to finish...');
    await loader.waitFor({ state: 'hidden', timeout: 60000 });
  }

  console.log('Locating login inputs...');
  const emailInput = page.locator('input[name="username"], input[name="email"], input[type="text"]');
  
  await emailInput.first().waitFor({ state: 'visible', timeout: 60000 });

  await emailInput.first().fill(process.env.PW_LOGIN || '');
  await page.locator('input[type="password"]').fill(process.env.PW_PASSWORD || '');


  console.log('Submitting credentials...');
  await page.getByRole('button', { name: /login/i }).first().click();


  try {
    await page.waitForURL(/^(?!.*\/auth\/login).*/, { timeout: 45000 });
    console.log('Login successful! State saved.');
  } catch (e) {
    const alert = page.getByRole('alert');
    const errorText = await alert.innerText().catch(() => 'Unknown Error');
    throw new Error(`Authentication failed. UI says: ${errorText}`);
  }


  await page.context().storageState({ path: authFile });
});