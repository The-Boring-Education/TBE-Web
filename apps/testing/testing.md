# Comprehensive Testing Plan for TBE Platform

## Overview

This document outlines a comprehensive testing strategy for the TBE Platform monorepo. The plan categorizes all modules that need testing and defines testing approaches for each category, ensuring robust coverage from UI components to API endpoints.

**Maintenance:** After each testing task (new specs, refactors, or CI changes), update the checklists in this file, the **Current Test Coverage Status** counts (`pnpm test:unit`), and **Recommended Next Steps** so the plan stays the single source of truth.

## Testing Philosophy

- **Test Behavior, Not Implementation**: Focus on what components/functions do, not how they do it
- **Avoid Tailwind Class Testing**: Don't test specific CSS classes; test visual behavior and functionality
- **Integration Testing**: Ensure each module works correctly in isolation and integration
- **Progressive Testing**: Start with simple units, build to complex integrations
- **Maintainable Tests**: Keep tests simple, focused, and easy to update

## Module Categories

### 1. UI Components (`@tbe/components`)

#### 1.1 Common Components (55 components)

**Basic UI Elements** (Priority: High)

- [x] `Button` ✅ (Already tested)
- [x] `Modal` ✅ (Already tested)
- [x] `Card` ✅ (Already tested)
- [x] `LoadingSpinner` ✅ (Already tested)
- [x] `Accordion` ✅ (Tested)
- [x] `AccordionLinkItem` ✅ (Tested — `AccordionLinkItem.test.tsx`)
- [x] `Alert` ✅ (Tested)
- [x] `Banner` (ActionBanner, BannerVariantA/B/C) ✅ (Tested — `Banner.test.tsx`)
- [x] `Carousel` ✅ (Tested — common `Carousel`; `Carousel.test.tsx` imports `packages/components/src/common/Carousel` because `export * from "./ui"` shadows the barrel `Carousel`)
- [x] `CheckboxButton` ✅ (Tested)
- [x] `InputFieldContainer` ✅ (Tested — `InputFieldContainer.test.tsx`)
- [x] `RadioButton` ✅ (`RadioButton.test.tsx`)
- [x] `RadioInputField` ✅ (`RadioInputField.test.tsx`)
- [x] `SelectInput` ✅ (`SelectInput.test.tsx`)
- [x] `Pill` / `IconPill` ✅ (Tested)
- [x] `TabComponent` ✅ (Tested)
- [x] `Toast` ✅ (Tested)
- [x] `Link` / `Text` (Typography) ✅ (Tested)

**Complex Components** (Priority: Medium)

- `CelebrationAnimation`
- `CertificateBanner` / `CertificateContent` / `CertificateModal`
- `ComingSoon`
- `GamificationDemo` / `GamificationToast` / `GamificationProvider`
- `MDXRenderer`
- `NotificationPopover`
- `ProgressBar` (CircularProgressBar, LinerProgressBar)
- `ResourceTooltip`

**Image Components** (Priority: Medium)

- [x] `BackgroundImage` ✅ (`BackgroundImage.test.tsx`)
- [x] `Image` ✅ (`Image.test.tsx`; `ImageLink` pending)
- [x] `Logo` ✅ (`Logo.test.tsx`)
- `UserAvatar`

**Learning Components** (Priority: Medium)

- [x] `ChapterLink` ✅ ([ChapterLink.test.tsx](src/unit/components/common/ChapterLink.test.tsx))
- `QuestionLink`

**Button Variants** (Priority: High)

- [x] `FloatingActionButton` ✅ (`FloatingActionButton.test.tsx`)
- [x] `LinkButton` ✅ (Tested)
- [x] `LoginRedirectButton` ✅ (`LoginRedirectButton.test.tsx`; `next/navigation` aliased in Vitest — see Test File Structure note)
- [x] `LoginWithGoogleButton` ✅ (`LoginWithGoogleButton.test.tsx`)
- [x] `LogoutButton` ✅ (Tested)
- [x] `ScrollToTopBottomButton` ✅ (`ScrollToTopBottomButton.test.tsx`)
- [x] `StarButton` ✅ (Tested)
- [x] `ToggleButton` ✅ (Tested)
- [x] `UserPointButton` ✅ (`UserPointButton.test.tsx`)

**Testing Strategy for Components:**

- Render tests: Verify component renders without errors
- Props tests: Test all prop variations and defaults
- Interaction tests: Click, hover, focus, keyboard navigation
- Accessibility tests: ARIA labels, roles, keyboard navigation
- State tests: Loading, error, success states
- Integration tests: Component composition and data flow

#### 1.2 Container Components (82 components)

**Card Components** (Priority: High)

- `AboutTBE`
- `CardContainerA` / `CardContainerB`
- `QuestionRow` / `DifficultyQuestionList`
- `FeedbackPopup`
- `GitHubIssuesContainer`
- `Leaderboard`
- `LoginCard` / `LoginCardNew`
- `MentorshipCard`
- `NotificationContainer`
- `PaymentCard`
- `PlaylistSkillCard`
- `QuestionDetailPanel`
- `QuizSection`
- `Testimonials`
- `UserLevelProgressContainer`
- `WeAlreadyTaughtAt`
- `WebinarCard`

**Card Items** (Priority: Medium)

- `ContactCard`
- `IconCard`
- `OutlineCard`
- `PlaylistCard` / `PlaylistRecommend` / `PlaylistVideoCard` / `PlaylistVideoTimeCard`
- `PortfolioCard` / `PortfolioTemplate`
- `PrimaryCard` / `PrimaryCardWithCTA`
- `ProgressRing`
- `StarRatingCard`
- `TestimonialCard`
- `WeTaughtAtCard`

**Form Containers** (Priority: High)

- `CheckboxButtonContainer`
- `InputRadioContainer`
- `RadioButtonContainer`
- `UploadFileInput`

**Page Containers** (Priority: Medium)

- `NotFound`
- `CohortJourneyContainer` / `FAQSection` / `InterviewPrepSection` / `PrevCohortProjects` / `SessionDetailsSection`
- `CardSectionContainer` / `FlexContainer` / `GradientContainer` / `GridContainer`
- `HeaderLabel` / `LandingPageHero` / `ModernLandingHero`
- `MobileNavbarLinksContainer` / `NavbarDropdownContainer`
- `PageHeroMetaContainer` / `PopoverContainer`
- `RevenueTransparency` / `SectionHeaderContainer`
- `CourseHeroContainer`
- `SheetHeroContainer` / `SheetLandingPage`
- `CollegeEventsSection` / `Community` / `MentorshipPlans`
- `OnboardingLayout` / `OnboardingProgressBar` / `StepNavigation` / `StepOccupation` / `StepPhoneNumber` / `StepUsage` / `StepUsername`
- `EnhancedOnboarding` / `PricingPage`
- `ProjectHeroContainer`
- `ResumeEvaluationSection`
- `WebinarHeroContainer`
- `ExplorePlaylistContainer` / `PlaylistContainer`

**Testing Strategy for Container Components:**

- Data rendering: Test with mock data
- User interactions: Form submissions, navigation, filtering
- State management: Loading, error, empty states
- API integration: Mock API calls and responses
- Conditional rendering: Show/hide based on props/state

#### 1.3 Layout Components (9 components)

**Priority: High**

- `Footer`
- `Navbar`
- `Page` / `Section`
- `SEO` / `SEOWrapper` / `PageSEO`
- `PageHeader`
- `QuestionDetails` / `QuestionSidebar`

**Testing Strategy:**

- Layout structure: Verify correct DOM structure
- Navigation: Test links and routing
- SEO: Verify meta tags and structured data
- Responsive behavior: Test mobile/desktop layouts

#### 1.4 PrepYatra Components (98 components)

**Priority: Medium-High**

- Auth components
- Dashboard components
- Feature components
- Gamification components
- Modal components
- Onboarding components
- UI primitives (AlertDialog, Badge, Card, Input, Label, Progress, Sheet, Tabs, Textarea, Tooltip)

**Testing Strategy:**

- Feature-specific functionality
- State management
- User flows (onboarding, dashboard, challenges)

#### 1.5 Quiz Components (25 components)

**Priority: High**

- Quiz-specific UI components
- Timer components
- Result components

**Testing Strategy:**

- Quiz flow: Start, answer, submit, results
- Timer functionality
- Score calculation
- Progress tracking

#### 1.6 TechYatra Components (7 components)

**Priority: Low-Medium**

- Tech learning journey components

### 2. React Hooks (`@tbe/hooks`)

**Priority: High** (30+ hooks)

**Authentication & User** (Priority: Critical)

- [ ] `useAuth` (Pending)
- [x] `useUser` ✅ (Tested - data fetching)
- [x] `useProductOnboardingGate` ✅ ([useProductOnboardingGate.test.ts](src/unit/hooks/useProductOnboardingGate.test.ts)) — product onboarding redirect gate
- [ ] `useUsername` (Pending)
- [ ] `useAdmin` / `useAdminData` (Pending)

**API & Data Fetching** (Priority: High)

- [x] `useApi` ✅ (Tested)
- [x] `useAPIResponseMapper` ✅ (Tested)
- [ ] `useQuizData` (Pending)

**Payment & Access** (Priority: High)

- [ ] `useCashfreePayment` (Pending)
- [ ] `usePaymentAccess` / `usePaymentStatus` (Pending)

**Gamification** (Priority: Medium)

- [ ] `useGamification` / `usePyGamification` (Pending)
- [ ] `useLeaderboard` (Pending)
- [ ] `useChallenges` / `useChallengeProgress` (Pending)

**Learning & Progress** (Priority: High)

- [ ] `usePrepLogs` / `usePrepStats` (Pending)
- [ ] `useQuestionStarred` (Pending)
- [ ] `useSkillPlaylist` (Pending)
- [ ] `useCertificate` (Pending)
- [ ] `useOnboarding` (Pending)

**UI & Interaction** (Priority: Medium)

- [x] `useMobile` ✅ (Tested)
- [x] `useMediaQuery` ✅ (Tested)
- [ ] `useToast` (Pending)
- [x] `useScrollDirection` ✅ (Tested)
- [x] `useScrollPosition` ✅ (Tested)
- [ ] `useInstallPrompt` (Pending)
- [ ] `useOptimizedNavigation` (Pending)

**Analytics & Feedback** (Priority: Medium)

- [ ] `useAnalytics` (Pending)
- [ ] `useFeedback` (Pending)
- [ ] `useNotifications` (Pending)

**Specialized** (Priority: Medium)

- [ ] `useDailyPrepEncouragement` (Pending)
- [ ] `useResumeEvaluation` / `useResumeParser` / `usePDFFile` (Pending)
- [ ] `useUnskilledGraphData` (Pending)

**Testing Strategy for Hooks:**

- State management: Initial state, state updates
- Side effects: useEffect, API calls, cleanup
- Return values: Verify correct return structure
- Error handling: Error states and recovery
- Dependencies: Test dependency arrays and re-renders
- Custom logic: Business logic within hooks

### 3. Services (`@tbe/services`)

**Priority: High** (10+ services)

**Core Services**

- [x] `api.ts` - Base API client ✅ (Tested - userApi, authApi, analyticsApi, etc.)
- [x] `base.ts` - `APIClient` fetch/URL/auth/JSON error handling ✅ ([base.test.ts](src/unit/services/base.test.ts))
- [ ] `client.ts` - Email client (Brevo/axios) (Pending; env-heavy)

**Feature Services** (Priority: High)

- [x] `quizApi.ts` - Quiz API calls ✅ (Tested)
- [ ] `challenges.ts` - Challenge management (Pending)
- [x] `prep-logs.ts` - Prep log CRUD ✅ ([prep-logs.test.ts](src/unit/services/prep-logs.test.ts))
- [ ] `prep-stats.ts` - Statistics operations (Pending)
- [x] `user.ts` - `getProfile` ✅ ([user.test.ts](src/unit/services/user.test.ts))
- [ ] `recruiters.ts` - Recruiter operations (Pending)
- [ ] `resumeService.ts` - Resume operations (Pending)
- [ ] `email.ts` - Email operations (Pending)
- [ ] `templates.ts` - Template operations (Pending)
- [ ] `triggers.ts` - Email triggers (Pending)

**Testing Strategy for Services:**

- API calls: Mock HTTP requests/responses
- Error handling: Network errors, API errors
- Request formatting: Verify correct payloads
- Response parsing: Verify data transformation
- Retry logic: Test retry mechanisms
- Authentication: Test auth headers/tokens

### 4. Utilities (`@tbe/utils`)

**Priority: High** (15+ utilities)

**Core Utilities**

- [x] `functions.ts` - General utility functions (45 tests)
- [x] `api.ts` - API helper functions (2 tests)
- `global.ts` - Global utilities

**Feature Utilities** (Priority: High)

- [x] `analytics.ts` - Analytics tracking (15 tests)
- `auth.ts` - Authentication utilities
- [x] `challenges.ts` - Challenge utilities (18 tests)
- [x] `discount.ts` - Discount calculations (25 tests)
- `health.ts` - Health check utilities
- [x] `onboarding.ts` - Onboarding utilities (12 tests)
- `prepLogs.ts` - Prep log utilities
- [x] `quiz.ts` - Quiz utilities (21 tests)
- `sitemap.ts` - Sitemap generation
- `socialMedia.ts` / `socialMediaTemplates.ts` - Social media utilities
- `mongodb.ts` - Database utilities
- `initMiddleware.ts` - Middleware initialization
- `mdx/index.ts` - MDX processing

**Completed Utility Tests:**

- ✅ Core functions (formatDate, formatTime, localStorage, cn, etc.) - 45 tests
- ✅ API utilities (sendRequest) - 2 tests
- ✅ Analytics utilities (trackEvent, trackPageView, quiz/course/user events) - 15 tests
- ✅ Challenges utilities (challengesService, social media templates) - 18 tests
- ✅ Discount utilities (price breakdown, coupon validation) - 25 tests
- ✅ Onboarding utilities (username check, user fetch) - 12 tests
- ✅ Quiz utilities (cleanOptionText, quizService) - 21 tests
- **Total: 138 utility tests passing**

**Testing Strategy for Utilities:**

- Pure functions: Input/output testing
- Edge cases: Null, undefined, empty values
- Type safety: Verify TypeScript types
- Error handling: Invalid inputs
- Performance: Large data sets
- Side effects: Functions with side effects

### 5. API Routes (`apps/api/src/pages/api`)

**Priority: Critical** (100+ endpoints)

#### 5.1 Health & Monitoring (`/api/health`)

- [x] `index.ts` - Overall health check endpoint

#### 5.2 Authentication (`/api/auth`)

- `[...nextauth].ts` - NextAuth configuration

#### 5.3 User Management (`/api/v1/user`)

- [x] `index.ts` - User CRUD operations (GET, POST)
- `dashboard.ts` - User dashboard data
- `onboarding.ts` - User onboarding
- `interest.ts` - User interests
- `shiksha/index.ts` / `shiksha/enroll.ts` / `shiksha/course.ts` - Course enrollment
- `projects/index.ts` / `projects/enroll.ts` / `projects/project.ts` - Project enrollment
- `interview-prep/index.ts` / `interview-prep/sheet.ts` / `interview-prep/starred.ts` - Interview prep
- `playlists/index.ts` - User playlists

#### 5.4 Quiz System (`/api/v1/quiz`)

- [x] `index.ts` - Quiz categories and creation
- `[id].ts` - Get quiz by ID
- `[id]/attempt.ts` - Start quiz attempt
- `[id]/submit.ts` - Submit quiz
- `attempts.ts` - Get user attempts
- `sessions/[userId].ts` - User sessions
- `session/start.ts` - Start session
- `session/[sessionId]/answer.ts` - Submit answer
- `session/[sessionId]/complete.ts` - Complete session
- `leaderboard.ts` - Quiz leaderboard
- `performance/[userId].ts` - User performance
- `analytics/[userId].ts` - User analytics

#### 5.4 Interview Prep (`/api/v1/interview-prep`)

- `index.ts` ✅ (Already tested)
- `upload.ts` - Upload interview sheet
- `[sheetId]/index.ts` - Get sheet
- `[sheetId]/question/index.ts` - Get questions
- `[sheetId]/question/[questionId]/index.ts` - Get question
- `dsa-sheet/index.ts` - DSA sheets
- `company-types/update.ts` - Update company types

#### 5.5 Shiksha (Courses) (`/api/v1/shiksha`)

- `index.ts` - Course listing
- `[courseId]/index.ts` - Get course
- `[courseId]/chapter/index.ts` - Get chapters
- `[courseId]/chapter/bulk.ts` - Bulk chapter operations
- `[courseId]/chapter/[chapterId]/index.ts` - Get chapter

#### 5.6 Projects (`/api/v1/projects`)

- `index.ts` - Project listing
- `[projectId]/index.ts` - Get project
- `[projectId]/sections/index.ts` - Get sections
- `[projectId]/sections/[sectionId]/index.ts` - Get section
- `[projectId]/sections/[sectionId]/chapters/index.ts` - Get chapters
- `[projectId]/sections/[sectionId]/chapters/[chapterId].ts` - Get chapter

#### 5.7 Payment (`/api/v1/payment`)

- `create-order.ts` - Create payment order
- `checkstatus.ts` - Check payment status
- `webhook.ts` - Payment webhook

#### 5.8 Other Endpoints (Priority: Medium)

- `/api/v1/coupon/validate.ts` - Coupon validation
- `/api/v1/feedback/index.ts` - Feedback submission
- `/api/v1/gamification/index.ts` - Gamification data
- `/api/v1/gamification/leaderboard.ts` - Gamification leaderboard
- `/api/v1/leaderboard/index.ts` - General leaderboard
- `/api/v1/notification/index.ts` - Notifications
- `/api/v1/prepyatra/*` - PrepYatra endpoints
- `/api/v1/unskilled/*` - Unskilled endpoints
- `/api/v1/webinar/*` - Webinar endpoints
- `/api/v1/youfocus/*` - YouFocus endpoints
- `/api/v1/email/*` - Email endpoints
- `/api/v1/devrel/*` - DevRel endpoints
- `/api/v1/admin/*` - Admin endpoints
- `/api/health/*` - Health checks

**Testing Strategy for API Routes:**

- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Request validation: Query params, body, headers
- Response format: Status codes, response structure
- Error handling: 400, 401, 403, 404, 500 errors
- Authentication: Protected routes, session handling
- Database operations: Mock DB queries
- Business logic: Verify correct data processing
- Edge cases: Empty data, invalid IDs, missing fields

**Completed API Route Tests:**

- ✅ `/api/health` - Health check endpoint (7 tests)
  - Service health monitoring
  - Error handling
  - Method validation
- ✅ `/api/v1/user` - User management (10 tests)
  - GET user by email/userId/username
  - POST create user
  - Error handling and validation
- ✅ `/api/v1/quiz` - Quiz operations (11 tests)
  - GET quiz categories
  - POST create quiz
  - POST append questions
  - Validation and error handling
- **Total: 28 API route tests passing**

## Testing Implementation Plan

### Phase 1: Foundation (Week 1-2)

1. ✅ Set up testing infrastructure (Already done)
2. Create test utilities and helpers
3. Establish testing patterns and conventions
4. Document testing guidelines

### Phase 2: Core Components (Week 3-4)

1. Test all Button variants
2. Test all Form components
3. Test Modal and Dialog components
4. Test Loading and Error states
5. Test Typography components

### Phase 3: Container Components (Week 5-6)

1. Test Card components
2. Test Form containers
3. Test Page containers
4. Test Layout components

### Phase 4: Hooks (Week 7-8)

1. ✅ Test API/data fetching hooks (useApi, useAPIResponseMapper, useUser) - 3 hooks
2. ✅ Test UI interaction hooks (useMobile, useMediaQuery, useScrollDirection, useScrollPosition) - 4 hooks
3. [ ] Test authentication hooks (useAuth, useUsername, useAdmin)
4. [ ] Test payment hooks (useCashfreePayment, usePaymentAccess)
5. [ ] Test gamification hooks (useGamification, useLeaderboard, useChallenges)
6. [ ] Test learning hooks (usePrepLogs, useQuestionStarred, useCertificate)
7. [ ] Test specialized hooks (useAnalytics, useFeedback, useResumeEvaluation)

### Phase 5: Services & Utils (Week 9-10)

1. ✅ Test core utility functions (formatDate, localStorage, etc.) - 45 tests
2. ✅ Test discount utilities - 25 tests
3. ✅ Test quiz utilities - 21 tests
4. ✅ Test analytics utilities - 15 tests
5. ✅ Test challenges utilities - 18 tests
6. ✅ Test onboarding utilities - 12 tests
7. ✅ Test service functions (api, quizApi) - 26 tests
8. [ ] Test remaining utility functions (auth, health, prepLogs, sitemap, etc.)
9. [ ] Test remaining service functions (challenges, prep-logs, user, etc.)
10. [ ] Test error handling
11. [ ] Test edge cases

### Phase 6: API Routes (Week 11-14)

1. ✅ Test health check endpoints
2. ✅ Test user management endpoints (GET, POST)
3. ✅ Test quiz endpoints (GET categories, POST create/append)
4. Test authentication endpoints
5. Test course/project endpoints
6. Test payment endpoints
7. Test remaining endpoints

## Test File Structure

```
apps/testing/src/
├── unit/
│   ├── components/
│   │   ├── common/          # Common component tests
│   │   ├── integration/     # Cross-component RTL integration (e.g. form-fields)
│   │   ├── containers/      # Container component tests
│   │   ├── layout/          # Layout component tests
│   │   ├── prepyatra/       # PrepYatra component tests
│   │   ├── quizes/          # Quiz component tests
│   │   └── techyatra/       # TechYatra component tests
│   ├── hooks/               # Hook tests
│   ├── services/            # Service tests
│   └── utils/               # Utility tests
└── api/                     # API route tests
    ├── auth/
    ├── user/
    ├── quiz/
    ├── interview-prep/
    ├── shiksha/
    ├── projects/
    ├── payment/
    └── ...
```

**Vitest / App Router:** `vitest.config.ts` aliases `next/navigation` → `src/test-utils/next-navigation-mock.ts` so components under `@tbe/components` can call `useRouter` / `usePathname` in unit tests. Mutate `nextNavigationTest` when a spec needs a custom pathname or `push` spy.

## Testing Best Practices

### Component Testing

- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Mock external dependencies (API calls, router, etc.)
- Test accessibility with `@testing-library/jest-dom`
- Avoid testing Tailwind classes directly

### Hook Testing

- Use `@testing-library/react-hooks` or `renderHook` from RTL
- Test state changes and side effects
- Mock dependencies (API services, context)
- Test cleanup functions

### Service Testing

- Mock axios/fetch calls
- Test request/response handling
- Test error scenarios
- Verify correct API endpoints and methods

### API Route Testing

- Use `node-mocks-http` for request/response mocking
- Mock database operations
- Test all HTTP methods
- Test authentication and authorization
- Test validation and error handling

## Coverage Goals

- **Components**: 80%+ coverage
- **Hooks**: 85%+ coverage
- **Services**: 90%+ coverage
- **Utils**: 90%+ coverage
- **API Routes**: 75%+ coverage (focus on critical paths)

## Maintenance

- Run tests in CI/CD pipeline
- Update tests when code changes
- Review test coverage regularly
- Refactor tests for maintainability
- Document test patterns and conventions

## Implementation Tasks

### Phase 1: Foundation ✅

- [x] Set up testing infrastructure
- [ ] Create test utilities and helpers
- [ ] Establish testing patterns and conventions
- [ ] Document testing guidelines

### Phase 2: Core Components

#### Basic UI Elements

- [x] `Button` - Already tested
- [x] `Modal` - Already tested
- [x] `Card` - Already tested
- [x] `LoadingSpinner` - Already tested
- [x] `Accordion` / `AccordionLinkItem`
- [x] `Alert`
- [x] `Banner` (ActionBanner, BannerVariantA/B/C)
- [x] `Carousel` (common carousel component)
- [x] `CheckboxButton`
- [x] `InputFieldContainer`
- [x] `RadioButton` / `RadioInputField` (`RadioButton.test.tsx`, `RadioInputField.test.tsx`)
- [x] `SelectInput` (`SelectInput.test.tsx`)
- [x] `Pill` / `IconPill`
- [x] `TabComponent`
- [x] `Toast`
- [x] `Link` / `Text` (Typography)

#### Button Variants

- [x] `FloatingActionButton`
- [x] `LinkButton`
- [x] `LoginRedirectButton`
- [x] `LoginWithGoogleButton`
- [x] `LogoutButton`
- [x] `ScrollToTopBottomButton`
- [x] `StarButton`
- [x] `ToggleButton`
- [x] `UserPointButton`

#### Complex Components

- [ ] `CelebrationAnimation`
- [ ] `CertificateBanner` / `CertificateContent` / `CertificateModal`
- [ ] `ComingSoon`
- [ ] `GamificationDemo` / `GamificationToast` / `GamificationProvider`
- [ ] `MDXRenderer`
- [ ] `NotificationPopover`
- [ ] `ProgressBar` (CircularProgressBar, LinerProgressBar)
- [ ] `ResourceTooltip`

#### Image Components

- [x] `BackgroundImage`
- [x] `Image` (`ImageLink` pending)
- [x] `Logo`
- [ ] `UserAvatar`

#### Learning Components

- [x] `ChapterLink`
- [ ] `QuestionLink`

### Phase 3: Container Components

#### Card Components

- [ ] `AboutTBE`
- [ ] `CardContainerA` / `CardContainerB`
- [ ] `QuestionRow` / `DifficultyQuestionList`
- [ ] `FeedbackPopup`
- [ ] `GitHubIssuesContainer`
- [ ] `Leaderboard`
- [ ] `LoginCard` / `LoginCardNew`
- [ ] `MentorshipCard`
- [ ] `NotificationContainer`
- [ ] `PaymentCard`
- [ ] `PlaylistSkillCard`
- [ ] `QuestionDetailPanel`
- [ ] `QuizSection`
- [ ] `Testimonials`
- [ ] `UserLevelProgressContainer`
- [ ] `WeAlreadyTaughtAt`
- [ ] `WebinarCard`

#### Card Items

- [ ] `ContactCard`
- [ ] `IconCard`
- [ ] `OutlineCard`
- [ ] `PlaylistCard` / `PlaylistRecommend` / `PlaylistVideoCard` / `PlaylistVideoTimeCard`
- [ ] `PortfolioCard` / `PortfolioTemplate`
- [ ] `PrimaryCard` / `PrimaryCardWithCTA`
- [ ] `ProgressRing`
- [ ] `StarRatingCard`
- [ ] `TestimonialCard`
- [ ] `WeTaughtAtCard`

#### Form Containers

- [ ] `CheckboxButtonContainer`
- [ ] `InputRadioContainer`
- [ ] `RadioButtonContainer`
- [ ] `UploadFileInput`

#### Page Containers

- [ ] `NotFound`
- [ ] `CohortJourneyContainer` / `FAQSection` / `InterviewPrepSection` / `PrevCohortProjects` / `SessionDetailsSection`
- [ ] `CardSectionContainer` / `FlexContainer` / `GradientContainer` / `GridContainer`
- [ ] `HeaderLabel` / `LandingPageHero` / `ModernLandingHero`
- [ ] `MobileNavbarLinksContainer` / `NavbarDropdownContainer`
- [ ] `PageHeroMetaContainer` / `PopoverContainer`
- [ ] `RevenueTransparency` / `SectionHeaderContainer`
- [ ] `CourseHeroContainer`
- [ ] `SheetHeroContainer` / `SheetLandingPage`
- [ ] `CollegeEventsSection` / `Community` / `MentorshipPlans`
- [ ] `OnboardingLayout` / `OnboardingProgressBar` / `StepNavigation` / `StepOccupation` / `StepPhoneNumber` / `StepUsage` / `StepUsername`
- [ ] `EnhancedOnboarding` / `PricingPage`
- [ ] `ProjectHeroContainer`
- [ ] `ResumeEvaluationSection`
- [ ] `WebinarHeroContainer`
- [ ] `ExplorePlaylistContainer` / `PlaylistContainer`

### Phase 4: Layout Components

- [ ] `Footer`
- [ ] `Navbar`
- [ ] `Page` / `Section`
- [ ] `SEO` / `SEOWrapper` / `PageSEO`
- [ ] `PageHeader`
- [ ] `QuestionDetails` / `QuestionSidebar`

### Phase 5: PrepYatra Components

- [ ] PrepYatra Auth components
- [ ] PrepYatra Dashboard components
- [ ] PrepYatra Feature components
- [ ] PrepYatra Gamification components
- [ ] PrepYatra Modal components
- [ ] PrepYatra Onboarding components
- [ ] PrepYatra UI primitives (AlertDialog, Badge, Card, Input, Label, Progress, Sheet, Tabs, Textarea, Tooltip)

### Phase 6: Quiz Components

- [ ] Quiz-specific UI components
- [ ] Timer components
- [ ] Result components

### Phase 7: TechYatra Components

- [ ] Tech learning journey components

### Phase 8: React Hooks

#### Authentication & User

- [ ] `useAuth` / `useUser` / `useUsername`
- [ ] `useAdmin` / `useAdminData`

#### API & Data Fetching

- [ ] `useApi` / `useAPIResponseMapper`
- [ ] `useQuizData`
- [ ] `useUser` (data fetching)

#### Payment & Access

- [ ] `useCashfreePayment`
- [ ] `usePaymentAccess` / `usePaymentStatus`

#### Gamification

- [ ] `useGamification` / `usePyGamification`
- [ ] `useLeaderboard`
- [ ] `useChallenges` / `useChallengeProgress`

#### Learning & Progress

- [ ] `usePrepLogs` / `usePrepStats`
- [ ] `useQuestionStarred`
- [ ] `useSkillPlaylist`
- [ ] `useCertificate`
- [ ] `useOnboarding`

#### UI & Interaction

- [ ] `useMobile` / `useMediaQuery`
- [ ] `useToast`
- [ ] `useScrollDirection` / `useScrollPosition`
- [ ] `useInstallPrompt`
- [ ] `useOptimizedNavigation`

#### Analytics & Feedback

- [ ] `useAnalytics`
- [ ] `useFeedback`
- [ ] `useNotifications`

#### Specialized

- [ ] `useDailyPrepEncouragement`
- [ ] `useResumeEvaluation` / `useResumeParser` / `usePDFFile`
- [ ] `useUnskilledGraphData`

### Phase 9: Services

#### Core Services

- [ ] `api.ts` - Base API client
- [ ] `base.ts` - Base service utilities
- [ ] `client.ts` - HTTP client configuration

#### Feature Services

- [ ] `quizApi.ts` - Quiz API calls
- [ ] `challenges.ts` - Challenge management
- [ ] `prep-logs.ts` - Prep log operations
- [ ] `prep-stats.ts` - Statistics operations
- [ ] `user.ts` - User operations
- [ ] `recruiters.ts` - Recruiter operations
- [ ] `resumeService.ts` - Resume operations
- [ ] `email.ts` - Email operations
- [ ] `templates.ts` - Template operations
- [ ] `triggers.ts` - Email triggers

### Phase 10: Utilities

#### Core Utilities

- [ ] `functions.ts` - General utility functions
- [ ] `api.ts` - API helper functions
- [ ] `global.ts` - Global utilities

#### Feature Utilities

- [ ] `analytics.ts` - Analytics tracking
- [ ] `auth.ts` - Authentication utilities
- [ ] `challenges.ts` - Challenge utilities
- [ ] `discount.ts` - Discount calculations
- [ ] `health.ts` - Health check utilities
- [ ] `onboarding.ts` - Onboarding utilities
- [ ] `prepLogs.ts` - Prep log utilities
- [ ] `quiz.ts` - Quiz utilities
- [ ] `sitemap.ts` - Sitemap generation
- [ ] `socialMedia.ts` / `socialMediaTemplates.ts` - Social media utilities
- [ ] `mongodb.ts` - Database utilities
- [ ] `initMiddleware.ts` - Middleware initialization
- [ ] `mdx/index.ts` - MDX processing

### Phase 11: API Routes

#### Authentication

- [ ] `[...nextauth].ts` - NextAuth configuration

#### User Management

- [ ] `index.ts` - User CRUD operations
- [ ] `dashboard.ts` - User dashboard data
- [ ] `onboarding.ts` - User onboarding
- [ ] `interest.ts` - User interests
- [ ] `shiksha/index.ts` / `shiksha/enroll.ts` / `shiksha/course.ts` - Course enrollment
- [ ] `projects/index.ts` / `projects/enroll.ts` / `projects/project.ts` - Project enrollment
- [ ] `interview-prep/index.ts` / `interview-prep/sheet.ts` / `interview-prep/starred.ts` - Interview prep
- [ ] `playlists/index.ts` - User playlists

#### Quiz System

- [x] `index.ts` - Already tested
- [ ] `[id].ts` - Get quiz by ID
- [ ] `[id]/attempt.ts` - Start quiz attempt
- [ ] `[id]/submit.ts` - Submit quiz
- [ ] `attempts.ts` - Get user attempts
- [ ] `sessions/[userId].ts` - User sessions
- [ ] `session/start.ts` - Start session
- [ ] `session/[sessionId]/answer.ts` - Submit answer
- [ ] `session/[sessionId]/complete.ts` - Complete session
- [ ] `leaderboard.ts` - Quiz leaderboard
- [ ] `performance/[userId].ts` - User performance
- [ ] `analytics/[userId].ts` - User analytics

#### Interview Prep

- [x] `index.ts` - Already tested
- [ ] `upload.ts` - Upload interview sheet
- [ ] `[sheetId]/index.ts` - Get sheet
- [ ] `[sheetId]/question/index.ts` - Get questions
- [ ] `[sheetId]/question/[questionId]/index.ts` - Get question
- [ ] `dsa-sheet/index.ts` - DSA sheets
- [ ] `company-types/update.ts` - Update company types

#### Shiksha (Courses)

- [x] `index.ts` - Already tested
- [ ] `[courseId]/index.ts` - Get course
- [ ] `[courseId]/chapter/index.ts` - Get chapters
- [ ] `[courseId]/chapter/bulk.ts` - Bulk chapter operations
- [ ] `[courseId]/chapter/[chapterId]/index.ts` - Get chapter

#### Projects

- [ ] `index.ts` - Project listing
- [ ] `[projectId]/index.ts` - Get project
- [ ] `[projectId]/sections/index.ts` - Get sections
- [ ] `[projectId]/sections/[sectionId]/index.ts` - Get section
- [ ] `[projectId]/sections/[sectionId]/chapters/index.ts` - Get chapters
- [ ] `[projectId]/sections/[sectionId]/chapters/[chapterId].ts` - Get chapter

#### Payment

- [ ] `create-order.ts` - Create payment order
- [ ] `checkstatus.ts` - Check payment status
- [ ] `webhook.ts` - Payment webhook

#### Other Endpoints

- [ ] `/api/v1/coupon/validate.ts` - Coupon validation
- [ ] `/api/v1/feedback/index.ts` - Feedback submission
- [ ] `/api/v1/gamification/index.ts` - Gamification data
- [ ] `/api/v1/gamification/leaderboard.ts` - Gamification leaderboard
- [ ] `/api/v1/leaderboard/index.ts` - General leaderboard
- [ ] `/api/v1/notification/index.ts` - Notifications
- [ ] `/api/v1/prepyatra/*` - PrepYatra endpoints
- [ ] `/api/v1/unskilled/*` - Unskilled endpoints
- [ ] `/api/v1/webinar/*` - Webinar endpoints
- [ ] `/api/v1/youfocus/*` - YouFocus endpoints
- [ ] `/api/v1/email/*` - Email endpoints
- [ ] `/api/v1/devrel/*` - DevRel endpoints
- [ ] `/api/v1/admin/*` - Admin endpoints
- [ ] `/api/health/*` - Health checks

### Phase 12: Integration Tests (Future)

- [x] **Component composition (RTL):** `InputFieldContainer` + `RadioButton` — `unit/components/integration/form-fields.integration.test.tsx`
- [x] **Select + styled radio:** `SelectInput` + `RadioInputField` — `unit/components/integration/select-radio-field.integration.test.tsx`
- [x] **Background + foreground image:** `BackgroundImage` + `Image` — `unit/components/integration/image-strip.integration.test.tsx`
- [ ] Authentication across apps
- [ ] Payment flow
- [ ] Certificate generation

## Current Test Coverage Status

### ✅ Completed Modules

**Components (Common):** 30/55 components tested

- Button, Modal, Card, LoadingSpinner, Accordion, AccordionLinkItem, Alert, Banner (ActionBanner + variants), Carousel (common), CheckboxButton, InputFieldContainer, Pill, RadioButton, RadioInputField, SelectInput, TabComponent, Toast, Link, Text, StarButton, ToggleButton, LinkButton, LogoutButton, FloatingActionButton, LoginRedirectButton, LoginWithGoogleButton, ScrollToTopBottomButton, UserPointButton, BackgroundImage, Image, Logo, UserAvatar

**Hooks:** 45/45 hooks tested (verified directly against `packages/hooks/src`) — full coverage achieved

- All previously-tested hooks (useApi, useAPIResponseMapper, useUser, useMobile, useMediaQuery, useScrollDirection, useScrollPosition, useAdmin, useAuthAnalytics, useChallenges, useCopyLink, useDailyPrepEncouragement, useDsaCompletedQuestions, useDsaQuestions, useDsaQuestionsForTopic, useDsaTopics, useDsaTopicSummaries, useGamification, useLeaderboard, useOnboarding, usePatternQuiz, usePaymentAccess, usePaymentStatus, usePrepLogs, usePrepStats, useProductOnboardingGate, usePyGamification, useQuestionStarred, useQuizData) plus the 16 hooks added in this batch: `use-toast`, `useAnalytics`, `useCashfreePayment`, `useCertificate`, `useDsaPrepUrlSync`, `useFeedback`, `useInstallPrompt`, `useNotifications`, `useOptimizedNavigation`, `usePDFFile` (tests `useResumeParser`), `useResumeEvaluation`, `useSkillPlaylist`, `useStudyGuide`, `useTracking`, `useUnskilledGraphData`, `useUsername`.
- Added a `next/router` alias (`src/test-utils/next-router-mock.ts`) alongside the existing `next/navigation` one, needed to reliably mock Pages Router hooks under the `@tbe/*` deps optimizer.

**Services:** 13/13 services tested (verified directly against `packages/services/src`) — full coverage achieved

- All previously-tested services (api.ts, base.ts, challenges.ts, prep-logs.ts, quizApi.ts, resumeService.ts, user.ts) plus the 6 added in this batch: `client.ts`, `email.ts`, `prep-stats.ts`, `recruiters.ts`, `templates.ts`, `triggers.ts`.

**Utilities:** 23/26 utilities tested (verified directly against `packages/utils/src`)

- All previously-tested utilities plus 9 added in this batch: `auth.ts`, `health.ts`, `initMiddleware.ts`, `mongodb.ts`, `prepLogs.ts`, `sentry.ts`, `sitemap.ts`, `socialMediaTemplates.ts`, `subscriptionPlanCatalog.ts`.
- Untested (3): `global.ts` (627 lines of `getServerSideProps`-style page-prop builders with heavy DB/SEO dependencies — large, standalone effort, deliberately deferred), `mdx/index.ts`, `socialMedia.ts` (entirely commented-out source, no real exports to test).

**API Routes:** ~54/148 endpoints tested (verified directly against `apps/api/src/pages/api`, correcting a prior stale count)

- Covered groups include: health, user (+ dashboard/streak/interest/enroll variants), quiz (+ attempt/submit/session flows), admin (admins/coupon/dashboard/me/quiz/subscription-plans), auth (login/logout/refresh/session/token), payment (checkstatus/create-order/quote/webhook), interview-prep (index/upload), prepyatra (challenges/prep-log/subscription/userskills), certificate, gamification, leaderboard, notification, shiksha, coupon, content-export, growth-analytics, aptitude-upload, youfocus-explore.
- ~90 endpoints remain untested, notably: `auth/[...nextauth]`, `sitemap`, most of `v1/admin/*` (analytics, content, dashboard details, email/send, mentorship/_, prepyatra/_), `v1/devrel/*`, `v1/interview-prep/[sheetId]/*` and aptitude/dsa-sheet/core-subjects sub-routes, `v1/projects/*` (and nested sections/chapters), remaining `v1/prepyatra/*` (onboarding, recruiter, challenges/[id]/*), `v1/quiz/[id]` (single-id GET) and admin quiz-active-sessions/quiz-analytics.

**Total Test Statistics:**

- ✅ **~238 test files** passing (`pnpm test:unit`; 1 skipped; 4 pre-existing failing files unrelated to this batch — `src/api/quiz/quiz.test.ts`, `src/unit/api-routes/admin-coupon.test.ts`, `src/unit/api-routes/quiz.test.ts`, `src/unit/database/gamification-queries.test.ts`)
- ✅ **~1812 tests** passing (1 skipped, 39 pre-existing failing in the 4 files above)
- Some component suites may log React/jsdom warnings (e.g. Radix prop forwarding); treat noisy output as follow-up, not a reason to skip updating this doc.

**Serial batch — common “Basic UI Elements” (completed):**

1. `AccordionLinkItem` → `common/AccordionLinkItem.test.tsx`
2. `Banner` (ActionBanner + A/B/C) → `common/Banner.test.tsx`
3. `Carousel` (common) → `common/Carousel.test.tsx` (direct import; barrel `Carousel` is shadowed by `./ui`)
4. `InputFieldContainer` → `common/InputFieldContainer.test.tsx`
5. `RadioButton` → `common/RadioButton.test.tsx`
6. **Integration:** `unit/components/integration/form-fields.integration.test.tsx`

**Serial batch — forms + auth CTAs (completed):**

1. `SelectInput` → `common/SelectInput.test.tsx`
2. `RadioInputField` → `common/RadioInputField.test.tsx`
3. `FloatingActionButton` → `common/FloatingActionButton.test.tsx`
4. `LoginRedirectButton` → `common/LoginRedirectButton.test.tsx` (uses `nextNavigationTest` from `next-navigation-mock.ts`)
5. `LoginWithGoogleButton` → `common/LoginWithGoogleButton.test.tsx`
6. **Integration:** `unit/components/integration/select-radio-field.integration.test.tsx`

**Serial batch — scroll, points, images (completed):**

1. `ScrollToTopBottomButton` → `common/ScrollToTopBottomButton.test.tsx` (mocks `useScrollPosition`)
2. `UserPointButton` → `common/UserPointButton.test.tsx` (mocks `useUser` + `useGamification`)
3. `BackgroundImage` → `common/BackgroundImage.test.tsx`
4. `Image` → `common/Image.test.tsx`
5. `Logo` → `common/Logo.test.tsx` (`next/link` mock)
6. **Integration:** `unit/components/integration/image-strip.integration.test.tsx`

### 📋 Pending Work

#### High Priority (Next Steps)

**Components:**

- [x] AccordionLinkItem
- [x] SelectInput, RadioInputField
- [x] Banner components (ActionBanner, BannerVariantA/B/C)
- [x] Carousel (common)
- [x] Button variants: ScrollToTopBottomButton, UserPointButton (`FloatingActionButton`, `LoginRedirectButton`, `LoginWithGoogleButton` covered)
- [x] UserAvatar (already covered — `UserAvatar.test.tsx`)
- [ ] Image: `ImageLink`; **Complex:** `CelebrationAnimation`, `CertificateBanner`/`CertificateContent`/`CertificateModal`, `ComingSoon`, `GamificationDemo`/`GamificationProvider`, `MDXRenderer`, `NotificationPopover`, `ResourceTooltip`, `QuestionLink`

**Hooks:** ✅ all 45 hooks tested — none pending

**Services:** ✅ all 13 services tested — none pending

**Utilities:** (3 untested, verified against `packages/utils/src`)

- `global.ts` (deferred — large `getServerSideProps`-style module with heavy DB/SEO/external-API dependencies, warrants its own focused batch), `mdx/index.ts`, `socialMedia.ts` (dead code — entirely commented out, no exports)

**API Routes:** (~90 untested, verified against `apps/api/src/pages/api`)

- Authentication endpoints (`auth/[...nextauth]`)
- `sitemap`
- Remaining `v1/admin/*` (analytics, content, dashboard details, email/send, growth-analytics, mentorship/*, prepyatra/challenges & userlogs, quiz-active-sessions, quiz-analytics)
- `v1/devrel/*` (applications, apply, dashboard, tasks)
- `v1/interview-prep/*` sub-routes (aptitude questions/study-guide, core-subjects, dsa-sheet family, sheetId/question family, study-guide/[topicId])
- `v1/projects/*` and nested sections/chapters
- Remaining `v1/prepyatra/*` (onboarding, recruiter, challenges/[id]/\*, subscription is covered but userskills variants may need more)
- `v1/quiz/[id]` single-id GET, plus remaining quiz session edge cases
- `v1/payment/order-status`
- `v1/certificate/[certificateId]`
- `v1/common/mdx`, `v1/feedback`, `v1/notification` variants, `v1/products`, `v1/coupon/[couponId]` family

#### Medium Priority

**Container Components:** 82 components pending
**Layout Components:** 9 components pending
**PrepYatra Components:** 98 components pending
**Quiz Components:** 25 components pending
**TechYatra Components:** 7 components pending

#### Low Priority

### 📊 Progress Summary

- **Components:** ~55% complete (30/55 common components with dedicated coverage; see list above)
- **Hooks:** 100% complete (45/45 hooks)
- **Services:** 100% complete (13/13 services)
- **Utilities:** ~88% complete (23/26 utilities; remaining 3 are deferred/dead-code as noted above)
- **API Routes:** ~36% complete (~54/148 endpoints)
- **Overall:** hooks/services now fully covered and utilities nearly so (2026-07-30 batch); container/PrepYatra/Quiz/TechYatra/Layout components remain the largest true gap at ~0% dedicated coverage.

### 🎯 Recommended Next Steps

1. **Next serial common batch:** `ImageLink`, then **Complex** (`CelebrationAnimation`, `CertificateBanner`/`CertificateContent`/`CertificateModal`, `ComingSoon`, `GamificationDemo`/`GamificationProvider`, `MDXRenderer`, `NotificationPopover`, `ResourceTooltip`, `QuestionLink`) — note `CircularProgressBar` / `LinerProgressBar` / `GamificationToast` and `UserAvatar` already have specs under `common/`.
2. ~~Add tests for the 16 remaining hooks~~ ✅ done — all 45 hooks now covered.
3. ~~Add tests for the 6 remaining services~~ ✅ done — all 13 services now covered. `mdx/index.ts` and the large `global.ts` remain the only untested utilities worth a dedicated follow-up batch (`socialMedia.ts` is dead/commented-out code, not worth testing).
4. Expand API route coverage — ~90 endpoints remain, concentrated in `v1/admin/*`, `v1/prepyatra/*`, `v1/interview-prep/*`, `v1/projects/*`, `v1/devrel/*`
5. Add container/PrepYatra/Quiz/TechYatra/Layout component tests — these categories are still at ~0% dedicated coverage and are the largest remaining body of work

## Next Steps

1. Keep this document aligned with the repo after each merge (checklists + `pnpm test:unit` counts).
2. Continue **Phase 2** common components (`ImageLink`, `UserAvatar`, learning links, then remaining complex items).
3. Extend **Phase 12** with more RTL integration slices before full auth/payment E2E-style flows.
4. Establish testing cadence and review process
5. Create test templates for each category
