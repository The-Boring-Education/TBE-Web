import { expect, test, Page } from '@playwright/test';

test('homepage has expected title', async ({ page }: { page: Page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/The Boring Education/i);
});
