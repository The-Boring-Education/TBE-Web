# Comprehensive Testing Plan for TBE Platform

## Overview

This document outlines a comprehensive testing strategy for the TBE Platform monorepo. The plan categorizes all modules that need testing and defines testing approaches for each category, ensuring robust coverage from UI components to API endpoints.

## Testing Philosophy

- **Test Behavior, Not Implementation**: Focus on what components/functions do, not how they do it
- **Avoid Tailwind Class Testing**: Don't test specific CSS classes; test visual behavior and functionality
- **End-to-End Module Testing**: Ensure each module works correctly in isolation and integration
- **Progressive Testing**: Start with simple units, build to complex integrations
- **Maintainable Tests**: Keep tests simple, focused, and easy to update

## Module Categories

### 1. UI Components (`@tbe/components`)

#### 1.1 Common Components (55 components)

**Basic UI Elements** (Priority: High)
- `Button` ✅ (Already tested)
- `Modal` ✅ (Already tested)
- `Card` ✅ (Already tested)
- `LoadingSpinner` ✅ (Already tested)
- `Accordion` / `AccordionLinkItem`
- `Alert`
- `Banner` (ActionBanner, BannerVariantA/B/C)
- `Carousel`
- `CheckboxButton`
- `InputFieldContainer`
- `RadioButton` / `RadioInputField`
- `SelectInput`
- `Pill` / `IconPill`
- `TabComponent`
- `Toast`
- `Link` / `Text` (Typography)

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
- `BackgroundImage`
- `Image` / `ImageLink`
- `Logo`
- `UserAvatar`

**Learning Components** (Priority: Medium)
- `ChapterLink`
- `QuestionLink`

**Button Variants** (Priority: High)
- `FloatingActionButton`
- `LinkButton`
- `LoginRedirectButton`
- `LoginWithGoogleButton`
- `LogoutButton`
- `ScrollToTopBottomButton`
- `StarButton`
- `ToggleButton`
- `UserPointButton`

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
- `DsaQuestionCard` / `DsaQuestionList`
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
- `WebibarCard`

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
- `useAuth` / `useUser` / `useUsername`
- `useAdmin` / `useAdminData`

**API & Data Fetching** (Priority: High)
- `useApi` / `useAPIResponseMapper`
- `useQuizData`
- `useUser` (data fetching)

**Payment & Access** (Priority: High)
- `useCashfreePayment`
- `usePaymentAccess` / `usePaymentStatus`

**Gamification** (Priority: Medium)
- `useGamification` / `usePyGamification`
- `useLeaderboard`
- `useChallenges` / `useChallengeProgress`

**Learning & Progress** (Priority: High)
- `usePrepLogs` / `usePrepStats`
- `useQuestionStarred`
- `useSkillPlaylist`
- `useCertificate`
- `useOnboarding`

**UI & Interaction** (Priority: Medium)
- `useMobile` / `useMediaQuery`
- `useToast`
- `useScrollDirection` / `useScrollPosition`
- `useInstallPrompt`
- `useOptimizedNavigation`

**Analytics & Feedback** (Priority: Medium)
- `useAnalytics`
- `useFeedback`
- `useNotifications`

**Specialized** (Priority: Medium)
- `useDailyPrepEncouragement`
- `useResumeEvaluation` / `useResumeParser` / `usePDFFile`
- `useUnskilledGraphData`

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
- `api.ts` - Base API client
- `base.ts` - Base service utilities
- `client.ts` - HTTP client configuration

**Feature Services** (Priority: High)
- `quizApi.ts` - Quiz API calls
- `challenges.ts` - Challenge management
- `prep-logs.ts` - Prep log operations
- `prep-stats.ts` - Statistics operations
- `user.ts` - User operations
- `recruiters.ts` - Recruiter operations
- `resumeService.ts` - Resume operations
- `email.ts` - Email operations
- `templates.ts` - Template operations
- `triggers.ts` - Email triggers

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
- `analytics.ts` - Analytics tracking
- `auth.ts` - Authentication utilities
- `challenges.ts` - Challenge utilities
- [x] `discount.ts` - Discount calculations (25 tests)
- `health.ts` - Health check utilities
- `onboarding.ts` - Onboarding utilities
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
- ✅ Discount utilities (price breakdown, coupon validation) - 25 tests
- ✅ Quiz utilities (cleanOptionText, quizService) - 21 tests
- **Total: 93 utility tests passing**

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

### 6. E2E Tests (`apps/testing/src/e2e`)

**Priority: High**

#### 6.1 Platform App Flows
- Homepage navigation ✅ (Already tested)
- User registration/login
- Course enrollment flow
- Project enrollment flow
- Interview prep sheet access
- User dashboard

#### 6.2 PrepYatra App Flows
- Onboarding flow
- Challenge completion
- Prep log tracking
- Leaderboard viewing

#### 6.3 Quiz App Flows
- Quiz selection
- Quiz taking flow
- Results viewing
- Leaderboard

#### 6.4 Cross-App Flows
- Authentication across apps
- Payment flow
- Certificate generation

**Testing Strategy for E2E:**
- User journeys: Complete user workflows
- Cross-browser: Chrome, Firefox, Safari
- Responsive: Mobile and desktop
- Performance: Page load times
- Accessibility: Screen reader compatibility

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
1. Test authentication hooks
2. Test API/data fetching hooks
3. Test UI interaction hooks
4. Test specialized hooks

### Phase 5: Services & Utils (Week 9-10)
1. ✅ Test core utility functions (formatDate, localStorage, etc.)
2. ✅ Test discount utilities
3. ✅ Test quiz utilities
4. ✅ Test service functions (api, quizApi)
5. Test remaining utility functions (analytics, auth, challenges, etc.)
6. Test error handling
7. Test edge cases

### Phase 6: API Routes (Week 11-14)
1. ✅ Test health check endpoints
2. ✅ Test user management endpoints (GET, POST)
3. ✅ Test quiz endpoints (GET categories, POST create/append)
4. Test authentication endpoints
5. Test course/project endpoints
6. Test payment endpoints
7. Test remaining endpoints

### Phase 7: E2E Tests (Week 15-16)
1. Test critical user flows
2. Test cross-app integration
3. Test responsive behavior
4. Test accessibility

## Test File Structure

```
apps/testing/src/
├── unit/
│   ├── components/
│   │   ├── common/          # Common component tests
│   │   ├── containers/      # Container component tests
│   │   ├── layout/          # Layout component tests
│   │   ├── prepyatra/       # PrepYatra component tests
│   │   ├── quizes/          # Quiz component tests
│   │   └── techyatra/       # TechYatra component tests
│   ├── hooks/               # Hook tests
│   ├── services/            # Service tests
│   └── utils/               # Utility tests
├── api/                     # API route tests
│   ├── auth/
│   ├── user/
│   ├── quiz/
│   ├── interview-prep/
│   ├── shiksha/
│   ├── projects/
│   ├── payment/
│   └── ...
└── e2e/                     # E2E tests
    ├── platform/
    ├── prep-yatra/
    ├── quizes/
    └── cross-app/
```

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

### E2E Testing
- Use Playwright for browser automation
- Test critical user paths
- Use page object model for maintainability
- Test on multiple browsers
- Include accessibility checks

## Coverage Goals

- **Components**: 80%+ coverage
- **Hooks**: 85%+ coverage
- **Services**: 90%+ coverage
- **Utils**: 90%+ coverage
- **API Routes**: 75%+ coverage (focus on critical paths)
- **E2E**: Cover all critical user flows

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
- [ ] `Banner` (ActionBanner, BannerVariantA/B/C)
- [ ] `Carousel`
- [x] `CheckboxButton`
- [ ] `InputFieldContainer`
- [ ] `RadioButton` / `RadioInputField`
- [ ] `SelectInput`
- [x] `Pill` / `IconPill`
- [x] `TabComponent`
- [x] `Toast`
- [x] `Link` / `Text` (Typography)

#### Button Variants
- [ ] `FloatingActionButton`
- [x] `LinkButton`
- [ ] `LoginRedirectButton`
- [ ] `LoginWithGoogleButton`
- [x] `LogoutButton`
- [ ] `ScrollToTopBottomButton`
- [x] `StarButton`
- [x] `ToggleButton`
- [ ] `UserPointButton`

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
- [ ] `BackgroundImage`
- [ ] `Image` / `ImageLink`
- [ ] `Logo`
- [ ] `UserAvatar`

#### Learning Components
- [ ] `ChapterLink`
- [ ] `QuestionLink`

### Phase 3: Container Components

#### Card Components
- [ ] `AboutTBE`
- [ ] `CardContainerA` / `CardContainerB`
- [ ] `DsaQuestionCard` / `DsaQuestionList`
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
- [ ] `WebibarCard`

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

### Phase 12: E2E Tests

#### Platform App Flows
- [x] Homepage navigation - Already tested
- [ ] User registration/login
- [ ] Course enrollment flow
- [ ] Project enrollment flow
- [ ] Interview prep sheet access
- [ ] User dashboard

#### PrepYatra App Flows
- [ ] Onboarding flow
- [ ] Challenge completion
- [ ] Prep log tracking
- [ ] Leaderboard viewing

#### Quiz App Flows
- [ ] Quiz selection
- [ ] Quiz taking flow
- [ ] Results viewing
- [ ] Leaderboard

#### Cross-App Flows
- [ ] Authentication across apps
- [ ] Payment flow
- [ ] Certificate generation

## Next Steps

1. Review and approve this plan
2. Set up test utilities and helpers
3. Begin Phase 1 implementation
4. Establish testing cadence and review process
5. Create test templates for each category
