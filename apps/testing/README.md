# 🧪 TBE Platform - Comprehensive Testing Suite

This directory contains a robust testing suite for the TBE Platform, covering both API endpoints and React components.

## 📋 Overview

The testing suite is designed with the following principles:
- **Simple & Focused**: Test simple endpoints thoroughly, skip complex ones
- **Robust Component Tests**: Ensure components are bulletproof and can't be easily broken
- **Maintainable**: Easy to understand and extend
- **Fast**: Quick feedback during development

## 🏗️ Structure

```
apps/testing/
├── src/
│   ├── api/                    # API endpoint tests
│   │   ├── quiz/              # Quiz API tests
│   │   ├── interview-prep/     # Interview Prep API tests
│   │   ├── shiksha/           # Shiksha API tests
│   │   ├── utils/             # API test utilities
│   │   └── mocks/             # Mock handlers and server
│   ├── unit/                  # Unit tests
│   │   ├── components/        # Component tests
│   │   ├── hooks/            # Hook tests
│   │   ├── services/         # Service tests
│   │   └── utils/            # Utility tests
│   └── test-utils/            # Shared test utilities
└── README.md
```

## 🚀 Running Tests

### All Tests
```bash
pnpm test
```

### Unit Tests Only
```bash
pnpm test:unit
```

### API Tests Only
```bash
pnpm test:api
```

### Watch Mode
```bash
pnpm test:unit:watch
```

### Coverage
```bash
pnpm test:coverage
```


## 📝 API Testing

### Tested Endpoints

#### Quiz API (`/api/v1/quiz`)
- ✅ `GET /api/v1/quiz` - Get quiz categories
- ✅ `POST /api/v1/quiz` - Create new quiz
- ✅ Quiz validation and error handling

#### Interview Prep API (`/api/v1/interview-prep`)
- ✅ `GET /api/v1/interview-prep` - Get all sheets or by slug
- ✅ `POST /api/v1/interview-prep` - Create new interview sheet
- ✅ User-specific data handling

#### Shiksha API (`/api/v1/shiksha`)
- ✅ `GET /api/v1/shiksha` - Get all courses or by slug
- ✅ `POST /api/v1/shiksha` - Create new course
- ✅ Enrollment status handling

### API Test Utilities

Located in `src/api/utils/api-test-helpers.ts`:

- `createMockRequest()` - Create mock Next.js API request
- `createMockResponse()` - Create mock Next.js API response
- `executeHandler()` - Execute API handler and get response
- `mockDatabaseConnection()` - Mock database connection
- `createMockDBQuery()` - Mock database query functions

### Example API Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createMockRequest, createMockResponse, executeHandler } from '../utils/api-test-helpers';
import handler from '../../../../api/src/pages/api/v1/quiz/index';

describe('Quiz API', () => {
    it('should return quiz categories', async () => {
        const req = createMockRequest('GET');
        const res = createMockResponse();
        const result = await executeHandler(handler, req, res);
        
        expect(result.statusCode).toBe(200);
        expect(result.data.success).toBe(true);
    });
});
```

## 🧩 Component Testing

### Tested Components

#### Button Component
- ✅ All variants (PRIMARY, SECONDARY, OUTLINE, GHOST, SUCCESS, NEUTRAL)
- ✅ All sizes (SMALL, MEDIUM, LARGE)
- ✅ Active/disabled states
- ✅ Loading states
- ✅ Click handling
- ✅ Icon support
- ✅ Full width option
- ✅ Animation types
- ✅ Accessibility

#### LoadingSpinner Component
- ✅ Size customization (height, width)
- ✅ Border color customization
- ✅ Margin classes
- ✅ Custom classes
- ✅ Animation classes

#### Modal Component
- ✅ Open/close states
- ✅ Title rendering
- ✅ Children content
- ✅ Close functionality
- ✅ Backdrop handling
- ✅ Styling and layout
- ✅ Accessibility

#### Card Components
- ✅ Base Card component
- ✅ CardHeader
- ✅ CardTitle
- ✅ CardDescription
- ✅ CardContent
- ✅ CardFooter
- ✅ Complete card structure
- ✅ Custom classes
- ✅ Accessibility

### Component Test Utilities

Located in `src/test-utils/`:

- `renderWithProviders()` - Render with React providers
- `createMockSession()` - Create mock session data
- `createMockAPIResponse()` - Create mock API response

### Example Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@tbe/components/common/Buttons/Button';

describe('Button Component', () => {
    it('should render button with text', () => {
        render(<Button text="Click Me" variant="PRIMARY" />);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });
});
```

## 🎯 Testing Philosophy

### API Tests
- **Simple Endpoints**: Test thoroughly with all edge cases
- **Complex Endpoints**: Skip if too complex (as per requirements)
- **Error Handling**: Always test error scenarios
- **Validation**: Test input validation
- **Database Mocking**: Mock all database operations

### Component Tests
- **Robustness**: Make tests so robust that components can't be easily broken
- **Edge Cases**: Test all edge cases and error states
- **Accessibility**: Ensure components are accessible
- **Props Validation**: Test all prop combinations
- **User Interactions**: Test all user interactions

## 📊 Coverage Goals

- **Statements**: 70%
- **Branches**: 65%
- **Functions**: 70%
- **Lines**: 70%

## 🔧 Configuration

### Vitest Config
Located in `vitest.config.ts`:
- Environment: `jsdom` for React components
- Setup files: `src/test-utils/setup.ts`
- Coverage provider: `v8`
- Test timeout: 10 seconds

### Test Setup
Located in `src/test-utils/setup.ts`:
- React Testing Library cleanup
- Next.js router mocking
- NextAuth mocking
- Global mocks (ResizeObserver, IntersectionObserver, matchMedia)

## 🚫 What NOT to Test

As per requirements:
- ❌ Complex API endpoints (skip them)
- ❌ Third-party library internals
- ❌ Implementation details (test behavior, not implementation)
- ❌ Already tested dependencies

## 📚 Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component/API does, not how it does it
2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Mock External Dependencies**: Always mock database, external APIs, etc.
5. **Test Edge Cases**: Don't just test happy paths
6. **Keep Tests Fast**: Tests should run quickly for fast feedback
7. **Maintain Tests**: Update tests when code changes

## 🐛 Debugging Tests

### Run Single Test File
```bash
pnpm test src/api/quiz/quiz.test.ts
```

### Run Tests in Watch Mode
```bash
pnpm test:unit:watch
```

### Debug with VS Code
Add breakpoints and use the VS Code debugger with the "Debug Jest Tests" configuration.

## 📈 Continuous Integration

Tests run automatically in CI/CD pipeline:
- All unit tests
- All API tests
- Coverage reports
- E2E tests (optional, can be run separately)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns
2. Use provided utilities
3. Mock external dependencies
4. Test edge cases
5. Update this README if adding new test categories

## 📝 Notes

- Tests use Vitest as the test runner
- React Testing Library for component tests
- node-mocks-http for API route testing
- MSW (Mock Service Worker) available for API mocking

---

**Remember**: The goal is to have robust, maintainable tests that catch bugs early and prevent regressions. Keep tests simple, focused, and fast! 🚀
