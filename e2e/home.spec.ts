import { expect, test } from '@playwright/test';

test('homepage has expected title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/The Boring Education/i);
});