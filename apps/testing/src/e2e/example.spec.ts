import { test, expect } from '@playwright/test';

/**
 * Simple E2E test example
 * Add your end-to-end user flow tests here
 */

test.describe('Example E2E Test', () => {
    test('should load homepage', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check if page loaded
        await expect(page).toHaveTitle(/TBE|The Boring Education/i);
    });

    test('should navigate and interact', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Example: Check for navigation or content
        const mainContent = page.locator('main, [role="main"]');
        await expect(mainContent).toBeVisible();
    });
});





