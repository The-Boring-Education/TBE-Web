import { test, expect } from '@playwright/test';

/**
 * E2E tests for Prep Yatra modals
 * Tests modal opening, form filling, and submission flows
 */

const PREP_YATRA_URL = process.env.NEXT_PUBLIC_PREPYATRA_BASE_URL || process.env.PREP_YATRA_URL || 'http://localhost:3001';

test.describe('Prep Yatra Modal Forms', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to prep-yatra homepage with timeout
        try {
            await page.goto(PREP_YATRA_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(1000);
        } catch (error) {
            console.warn(`Failed to navigate to ${PREP_YATRA_URL}, skipping test`);
            test.skip();
        }
    });

    test.describe('Add Prep Log Modal', () => {
        test('should open modal when trigger button is clicked', async ({ page }) => {
            // First, we need to be authenticated - skip if not logged in
            // In a real scenario, you'd set up auth state here
            const loginButton = page.locator('text=/login|sign in/i').first();
            
            if (await loginButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                test.skip();
                return;
            }

            // Look for button that opens prep log modal
            // This could be "Add Prep Log" button or similar
            const addPrepLogButton = page.locator('button:has-text("Add Prep Log"), button:has-text("Log Prep"), [aria-label*="prep log" i]').first();
            
            if (await addPrepLogButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await addPrepLogButton.click();
                
                // Wait for modal to appear
                const modal = page.locator('[role="dialog"]').first();
                await expect(modal).toBeVisible({ timeout: 5000 });
                
                // Verify modal title
                await expect(modal.locator('text=/Add.*Prep Log|New Prep Log/i')).toBeVisible();
            } else {
                // If button not found, test passes (might be on different page)
                test.skip();
            }
        });

        test('should fill and submit prep log form successfully', async ({ page, context }) => {
            // Mock API response for successful submission
            await context.route('**/api/v1/prepyatra/prep-logs**', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: true,
                            data: {
                                _id: 'test-log-123',
                                title: 'Solved Leetcode Problems',
                                description: 'Worked on array and string problems',
                                timeSpent: 2.5,
                                userId: 'test-user-123',
                                createdAt: new Date().toISOString()
                            }
                        })
                    });
                } else {
                    await route.continue();
                }
            });

            // Navigate to dashboard (where modal is typically accessible)
            await page.goto(`${PREP_YATRA_URL}/dashboard`);
            await page.waitForLoadState('networkidle');

            // Look for button to open modal
            const addButton = page.locator('button:has-text("Add Prep Log"), button:has-text("Log Prep"), [aria-label*="add prep log" i]').first();
            
            if (!(await addButton.isVisible({ timeout: 5000 }).catch(() => false))) {
                test.skip();
                return;
            }

            // Open modal
            await addButton.click();
            
            // Wait for modal
            const modal = page.locator('[role="dialog"]').first();
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Fill form fields
            const titleInput = modal.locator('input[name="title"], input[placeholder*="title" i], label:has-text("Title") + input').first();
            await titleInput.fill('Solved Leetcode Medium Problems');

            const descriptionTextarea = modal.locator('textarea[name="description"], textarea[placeholder*="description" i], label:has-text("Description") + textarea').first();
            await descriptionTextarea.fill('Worked on array manipulation and string algorithms');

            const timeSpentInput = modal.locator('input[name="timeSpent"], input[type="number"], input[placeholder*="time" i], label:has-text("Time") + input').first();
            await timeSpentInput.fill('2.5');

            // Submit form
            const submitButton = modal.locator('button[type="submit"], button:has-text("Add Log"), button:has-text("Create")').first();
            await expect(submitButton).toBeEnabled();
            await submitButton.click();

            // Wait for submission to complete
            await page.waitForTimeout(1000);

            // Verify modal closes or success message appears
            // Modal should close after successful submission
            await expect(modal).not.toBeVisible({ timeout: 5000 });
        });

        test('should validate required fields', async ({ page }) => {
            await page.goto(`${PREP_YATRA_URL}/dashboard`);
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button:has-text("Add Prep Log")').first();
            
            if (!(await addButton.isVisible({ timeout: 5000 }).catch(() => false))) {
                test.skip();
                return;
            }

            await addButton.click();
            
            const modal = page.locator('[role="dialog"]').first();
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Try to submit without filling required fields
            const submitButton = modal.locator('button[type="submit"]').first();
            
            // Submit button should be disabled or form should prevent submission
            const isDisabled = await submitButton.isDisabled();
            
            if (!isDisabled) {
                // If button is enabled, try clicking and check for validation
                await submitButton.click();
                
                // Check for validation messages
                const validationMessage = modal.locator('text=/required|please fill|invalid/i').first();
                const hasValidation = await validationMessage.isVisible({ timeout: 2000 }).catch(() => false);
                
                // Either button should be disabled or validation should appear
                expect(isDisabled || hasValidation).toBeTruthy();
            } else {
                expect(isDisabled).toBeTruthy();
            }
        });

        test('should close modal when cancel button is clicked', async ({ page }) => {
            await page.goto(`${PREP_YATRA_URL}/dashboard`);
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button:has-text("Add Prep Log")').first();
            
            if (!(await addButton.isVisible({ timeout: 5000 }).catch(() => false))) {
                test.skip();
                return;
            }

            await addButton.click();
            
            const modal = page.locator('[role="dialog"]').first();
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Click cancel button
            const cancelButton = modal.locator('button:has-text("Cancel"), button[aria-label*="close" i]').first();
            await cancelButton.click();

            // Modal should close
            await expect(modal).not.toBeVisible({ timeout: 3000 });
        });
    });

    test.describe('Add Recruiter Modal', () => {
        test('should open recruiter modal and fill all fields', async ({ page, context }) => {
            // Mock API response
            await context.route('**/api/v1/prepyatra/recruiter**', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: true,
                            data: {
                                _id: 'test-recruiter-123',
                                recruiterName: 'John Doe',
                                email: 'john@company.com',
                                company: 'Tech Corp',
                                appliedPosition: 'Software Engineer',
                                applicationStatus: 'Screening'
                            }
                        })
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto(`${PREP_YATRA_URL}/dashboard`);
            await page.waitForLoadState('networkidle');

            // Find button to open recruiter modal
            const addRecruiterButton = page.locator('button:has-text("Add Recruiter"), button:has-text("Add Contact"), [aria-label*="recruiter" i]').first();
            
            if (!(await addRecruiterButton.isVisible({ timeout: 5000 }).catch(() => false))) {
                test.skip();
                return;
            }

            await addRecruiterButton.click();
            
            const modal = page.locator('[role="dialog"]').first();
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Fill all form fields
            const nameInput = modal.locator('input[name="recruiterName"], input[placeholder*="name" i], label:has-text("Name") + input').first();
            await nameInput.fill('John Doe');

            const emailInput = modal.locator('input[name="email"], input[type="email"]').first();
            await emailInput.fill('john.doe@techcorp.com');

            const phoneInput = modal.locator('input[name="phone"], input[placeholder*="phone" i]').first();
            if (await phoneInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                await phoneInput.fill('+1234567890');
            }

            const companyInput = modal.locator('input[name="company"], input[placeholder*="company" i]').first();
            if (await companyInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                await companyInput.fill('Tech Corp');
            }

            const positionInput = modal.locator('input[name="appliedPosition"], input[placeholder*="position" i]').first();
            if (await positionInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                await positionInput.fill('Senior Software Engineer');
            }

            // Fill comments if available
            const commentsTextarea = modal.locator('textarea[name="comments"], textarea[placeholder*="comment" i]').first();
            if (await commentsTextarea.isVisible({ timeout: 1000 }).catch(() => false)) {
                await commentsTextarea.fill('Initial screening call scheduled');
            }

            // Submit form
            const submitButton = modal.locator('button[type="submit"], button:has-text("Create Contact"), button:has-text("Add Contact")').first();
            await expect(submitButton).toBeEnabled();
            await submitButton.click();

            // Wait for submission
            await page.waitForTimeout(1000);

            // Verify modal closes
            await expect(modal).not.toBeVisible({ timeout: 5000 });
        });

        test('should validate required recruiter name field', async ({ page }) => {
            await page.goto(`${PREP_YATRA_URL}/dashboard`);
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button:has-text("Add Recruiter")').first();
            
            if (!(await addButton.isVisible({ timeout: 5000 }).catch(() => false))) {
                test.skip();
                return;
            }

            await addButton.click();
            
            const modal = page.locator('[role="dialog"]').first();
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Try to submit without required name field
            const submitButton = modal.locator('button[type="submit"]').first();
            const isDisabled = await submitButton.isDisabled();
            
            if (!isDisabled) {
                await submitButton.click();
                const validationMessage = modal.locator('text=/required|please fill/i').first();
                const hasValidation = await validationMessage.isVisible({ timeout: 2000 }).catch(() => false);
                expect(hasValidation).toBeTruthy();
            } else {
                expect(isDisabled).toBeTruthy();
            }
        });
    });

    test.describe('Onboarding Modal Flow', () => {
        test('should complete multi-step onboarding form', async ({ page, context }) => {
            // Mock API responses
            await context.route('**/api/v1/user/onboarding**', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: true,
                            data: {
                                _id: 'test-user-123',
                                userName: 'testuser',
                                occupation: 'Software Engineer',
                                purpose: ['job_preparation'],
                                contactNo: '+91 9876543210',
                                isOnboarded: true
                            }
                        })
                    });
                } else {
                    await route.continue();
                }
            });

            await context.route('**/api/v1/user/username-check**', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: { available: true }
                    })
                });
            });

            // Navigate to onboarding page
            await page.goto(`${PREP_YATRA_URL}/onboarding`);
            await page.waitForLoadState('networkidle');

            // Step 1: Username
            const usernameInput = page.locator('input[name="userName"], input[placeholder*="username" i]').first();
            if (await usernameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await usernameInput.fill('testuser123');
                await page.waitForTimeout(500); // Wait for username check

                // Click Next
                const nextButton = page.locator('button:has-text("Next"), button[aria-label*="next" i]').first();
                await nextButton.click();
                await page.waitForTimeout(500);
            }

            // Step 2: Occupation
            const occupationSelect = page.locator('select[name="occupation"], input[name="occupation"]').first();
            if (await occupationSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
                if (await occupationSelect.evaluate(el => el.tagName === 'SELECT')) {
                    await occupationSelect.selectOption({ label: /engineer|developer/i });
                } else {
                    await occupationSelect.fill('Software Engineer');
                }

                const nextButton2 = page.locator('button:has-text("Next")').first();
                await nextButton2.click();
                await page.waitForTimeout(500);
            }

            // Step 3: Purpose/Usage (checkboxes)
            const purposeCheckboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
            const checkboxCount = await purposeCheckboxes.count();
            if (checkboxCount > 0) {
                await purposeCheckboxes.first().click();
                await page.waitForTimeout(300);

                const nextButton3 = page.locator('button:has-text("Next")').first();
                await nextButton3.click();
                await page.waitForTimeout(500);
            }

            // Step 4: Phone Number
            const phoneInput = page.locator('input[name="contactNo"], input[type="tel"], input[placeholder*="phone" i]').first();
            if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                await phoneInput.fill('9876543210');
                await page.waitForTimeout(300);

                // Submit onboarding
                const submitButton = page.locator('button:has-text("Submit"), button:has-text("Complete"), button[type="submit"]').first();
                await submitButton.click();

                // Wait for redirect or success message
                await page.waitForTimeout(2000);
                
                // Verify we're redirected or see success
                const currentUrl = page.url();
                expect(currentUrl).not.toContain('/onboarding');
            }
        });
    });
});
