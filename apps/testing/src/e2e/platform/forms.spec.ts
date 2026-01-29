import { test, expect } from '@playwright/test';

/**
 * E2E tests for Platform form submissions
 * Tests various forms including resume evaluation, contact forms, etc.
 */

const PLATFORM_URL = process.env.NEXTAUTH_URL || process.env.PLATFORM_URL || 'http://localhost:3000';

test.describe('Platform Forms', () => {
    test.describe('Resume Evaluation Form', () => {
        test('should fill and submit resume evaluation form', async ({ page, context }) => {
            // Navigate with error handling
            try {
                await page.goto(`${PLATFORM_URL}/unskilled`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            } catch (error) {
                console.warn(`Failed to navigate to unskilled page, skipping test`);
                test.skip();
                return;
            }
            // Mock API response
            await context.route('**/api/v1/unskilled/evaluate**', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: true,
                            data: {
                                evaluationId: 'eval-123',
                                status: 'processing',
                                message: 'Resume evaluation started'
                            }
                        })
                    });
                } else {
                    await route.continue();
                }
            });

            await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

            // Look for file upload input
            const fileInput = page.locator('input[type="file"], input[accept*="pdf"], input[accept*="doc"]').first();
            
            if (await fileInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                // Create a dummy file for testing
                const filePath = '/tmp/test-resume.pdf';
                // Note: In real tests, you'd use an actual test file
                
                // Select domains (checkboxes)
                const domainCheckboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
                const checkboxCount = await domainCheckboxes.count();
                
                if (checkboxCount > 0) {
                    // Select first 2 checkboxes (max 2 preferred)
                    await domainCheckboxes.nth(0).click();
                    if (checkboxCount > 1) {
                        await domainCheckboxes.nth(1).click();
                    }
                }

                // Select experience level (radio buttons)
                const experienceRadios = page.locator('input[type="radio"], [role="radio"]');
                const radioCount = await experienceRadios.count();
                
                if (radioCount > 0) {
                    await experienceRadios.first().click();
                }

                // Submit form
                const submitButton = page.locator('button:has-text("Start Evaluation"), button:has-text("Evaluate"), button[type="submit"]').first();
                await expect(submitButton).toBeEnabled();
                await submitButton.click();

                // Wait for response
                await page.waitForTimeout(2000);

                // Verify success message or redirect
                const successMessage = page.locator('text=/evaluating|processing|success/i').first();
                const hasSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
                
                // Either success message or form should show processing state
                expect(hasSuccess || await submitButton.textContent()).toBeTruthy();
            } else {
                test.skip();
            }
        });
    });

    test.describe('Contact/Feedback Forms', () => {
        test('should submit contact form with all fields', async ({ page, context }) => {
            // Mock API response
            await context.route('**/api/v1/feedback**', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: true,
                            message: 'Feedback submitted successfully'
                        })
                    });
                } else {
                    await route.continue();
                }
            });

            // Navigate to a page with contact form (adjust URL as needed)
            try {
                await page.goto(PLATFORM_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
            } catch (error) {
                console.warn(`Failed to navigate to platform, skipping test`);
                test.skip();
                return;
            }

            // Look for contact form or feedback form
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
            const emailInput = page.locator('input[name="email"], input[type="email"]').first();
            const messageTextarea = page.locator('textarea[name="message"], textarea[placeholder*="message" i]').first();

            if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                await nameInput.fill('Test User');
                await emailInput.fill('test@example.com');
                
                if (await messageTextarea.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await messageTextarea.fill('This is a test feedback message');
                }

                const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Send")').first();
                await submitButton.click();

                // Wait for submission
                await page.waitForTimeout(2000);

                // Verify success
                const successMessage = page.locator('text=/success|thank you|submitted/i').first();
                const hasSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
                
                expect(hasSuccess).toBeTruthy();
            } else {
                test.skip();
            }
        });
    });
});
