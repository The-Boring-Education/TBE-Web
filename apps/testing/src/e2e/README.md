# E2E Test Suite

## Overview

This directory contains end-to-end tests for the TBE Platform using Playwright. These tests verify complete user workflows from opening modals to submitting forms and verifying results.

## Test Structure

```
src/e2e/
├── fixtures/
│   ├── auth.ts          # Authentication helpers
│   └── test-data.ts     # Test data fixtures
├── platform/
│   ├── homepage.spec.ts      # Homepage navigation tests
│   ├── onboarding.spec.ts    # Multi-step onboarding flow
│   └── forms.spec.ts         # Form submission tests
├── prep-yatra/
│   └── modals.spec.ts        # Modal form tests
└── example.spec.ts           # Example tests
```

## Test Categories

### Modal Tests
- **Add Prep Log Modal**: Open modal, fill form (title, description, timeSpent), submit, verify success
- **Add Recruiter Modal**: Open modal, fill all fields (name, email, phone, company, position, etc.), submit, verify success
- **Form Validation**: Test required fields, error messages, disabled submit buttons

### Onboarding Tests
- **Multi-step Flow**: Complete all 4 steps (username, occupation, purpose, phone)
- **Step Navigation**: Test Next/Back buttons, progress indicator
- **Username Validation**: Test availability checking, error handling

### Form Submission Tests
- **Resume Evaluation**: File upload, domain selection, experience level, submission
- **Contact Forms**: Name, email, message fields, submission verification

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e platform/onboarding.spec.ts

# Run with UI mode (interactive)
pnpm test:e2e:ui

# Run in debug mode
pnpm test:e2e:debug

# Run on specific browser
pnpm test:e2e --project=chromium
```

## Test Patterns

### Modal Testing Pattern

```typescript
test('should fill and submit modal form', async ({ page, context }) => {
    // 1. Mock API response
    await context.route('**/api/endpoint**', async (route) => {
        await route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true, data: {...} })
        });
    });

    // 2. Navigate to page
    await page.goto('/dashboard');
    
    // 3. Open modal
    await page.locator('button:has-text("Open Modal")').click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // 4. Fill form fields
    await modal.locator('input[name="field"]').fill('value');

    // 5. Submit form
    await modal.locator('button[type="submit"]').click();

    // 6. Verify success
    await expect(modal).not.toBeVisible();
});
```

### Form Validation Pattern

```typescript
test('should validate required fields', async ({ page }) => {
    // Open form
    await page.goto('/form-page');
    
    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]');
    
    // Check if button is disabled or validation appears
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
        await submitButton.click();
        await expect(page.locator('text=/required/i')).toBeVisible();
    }
});
```

## Best Practices

1. **Mock API Responses**: Always mock API calls to avoid dependencies on external services
2. **Wait for Elements**: Use `waitForLoadState` and proper timeouts
3. **Graceful Skipping**: Use `test.skip()` when elements aren't available (e.g., not authenticated)
4. **Verify Success**: Always verify modal closes or success message appears after submission
5. **Test Edge Cases**: Test validation, error states, and cancellation flows

## Current Test Coverage

- ✅ Modal opening and closing
- ✅ Form field filling
- ✅ Form submission
- ✅ Validation testing
- ✅ Multi-step forms
- ✅ API response mocking
- ✅ Success/error state verification

## Next Steps

- [ ] Add authentication state management
- [ ] Add more modal tests (Edit modals, Delete confirmations)
- [ ] Add quiz taking flow tests
- [ ] Add payment flow tests
- [ ] Add cross-app navigation tests
