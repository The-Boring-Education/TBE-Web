import { test, expect } from '@playwright/test';
import { testURLs } from '../fixtures/test-data';

/**
 * E2E tests for Prep Yatra dashboard
 * Tests the preparation journey features
 */

test.describe('Prep Yatra Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(testURLs.prepYatra);
    });

    test('should load prep yatra homepage', async ({ page }) => {
        // Check page loaded successfully
        await expect(page).toHaveTitle(/prep|yatra/i);

        // Look for main content
        const mainContent = page.locator('main, [role="main"]');
        await expect(mainContent).toBeVisible();
    });

    test('should display navigation menu', async ({ page }) => {
        // Look for navigation elements
        const nav = page.locator('nav, header');
        await expect(nav.first()).toBeVisible();

        // Check for common nav items
        const navItems = page.locator('a, button').filter({
            hasText: /dashboard|challenges|profile|login/i
        });

        expect(await navItems.count()).toBeGreaterThan(0);
    });

    test('should navigate to dashboard', async ({ page }) => {
        // Look for dashboard link
        const dashboardLink = page.locator('a').filter({
            hasText: /dashboard/i
        }).first();

        if (await dashboardLink.count() > 0) {
            await dashboardLink.click();
            await page.waitForTimeout(1000);
            expect(page.url()).toContain('dashboard');
        }
    });

    test('should display challenges or topics', async ({ page }) => {
        // Navigate to dashboard if not already there
        const url = page.url();
        if (!url.includes('dashboard')) {
            await page.goto(`${testURLs.prepYatra}/dashboard`);
        }

        // Wait for content to load
        await page.waitForTimeout(2000);

        // Look for challenge cards or topic lists
        const content = page.locator('main, [role="main"]');
        await expect(content).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Reload page
        await page.goto(testURLs.prepYatra);

        // Check mobile menu
        const mobileMenu = page.locator('button').filter({
            hasText: /menu|☰/i
        }).or(page.locator('[aria-label*="menu"]'));

        // Either mobile menu should exist or regular nav should be visible
        const hasMobileMenu = await mobileMenu.count() > 0;
        const hasNav = await page.locator('nav').count() > 0;

        expect(hasMobileMenu || hasNav).toBe(true);
    });
});
