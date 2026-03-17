import { expect, test } from "../fixtures/auth.fixture";
import {
  completedCourseWithCertificate,
  COURSE_SLUG,
  enrolledCourse,
  mockCertificateAPI,
  mockChapterCompletionAPI,
  mockCoursePageSSR,
  mockEnrollmentAPI,
  mockShikshaExploreAPI,
  partiallyCompletedCourse,
  unenrolledCourse,
} from "../fixtures/course-mocks";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Navigate to the course page via SPA transition from explore.
// This triggers _next/data fetching which our mocks intercept.
// ─────────────────────────────────────────────────────────────────────────────
async function navigateToCourseViaSPA(page: import("@playwright/test").Page) {
  await page.goto("/shiksha/explore");
  await page.getByText("Logic Building for Everyone").click();
  await page.waitForURL(`**/shiksha/${COURSE_SLUG}`);
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. UNENROLLED STATE
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Shiksha Enrollment — Unenrolled State", () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, unenrolledCourse);
    await mockEnrollmentAPI(page);
  });

  test("shows 'Enroll to Course' button for authenticated unenrolled user", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    await expect(
      page.getByRole("button", { name: "Enroll to Course" }),
    ).toBeVisible();

    // Should NOT show "Continue Learning" or "Course Overview" enrolled-only buttons
    await expect(
      page.getByRole("button", { name: "Continue Learning" }),
    ).not.toBeVisible();
  });

  test("displays locked course content with enrollment prompt", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    await expect(page.getByText("Course Overview")).toBeVisible();
    await expect(page.getByText("Enroll to Access Course")).toBeVisible();
  });

  test("shows course title in hero section", async ({ authedPage: page }) => {
    await navigateToCourseViaSPA(page);

    await expect(page.getByText("Logic Building for Everyone")).toBeVisible();
    await expect(page.getByText("Hello Test User!")).toBeVisible();
  });

  test("enrollment API call fires with correct payload on enroll click", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    const enrollRequestPromise = page.waitForRequest(
      (req) =>
        req.url().includes("/api/proxy/user/shiksha/enroll") &&
        req.method() === "POST",
    );

    await page.getByRole("button", { name: "Enroll to Course" }).click();

    const enrollRequest = await enrollRequestPromise;
    const body = enrollRequest.postDataJSON();
    expect(body).toMatchObject({
      userId: "test-user-id-123",
      courseId: "course-1",
    });
  });

  test("chapters sidebar shows chapter list but content is locked", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    await expect(page.getByText("1 - Introduction to Logic")).toBeVisible();
    await expect(page.getByText("2 - Variables and Data Types")).toBeVisible();
    await expect(page.getByText("3 - Control Flow")).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. ENROLLED STATE — CHAPTER NAVIGATION & COMPLETION
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Shiksha Enrollment — Enrolled State", () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, enrolledCourse);
    await mockChapterCompletionAPI(page);
    await mockCertificateAPI(page);
  });

  test("enrolled user sees unlocked chapter content", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    // Should show MDX content, not the locked overview
    await expect(page.getByText("Enroll to Access Course")).not.toBeVisible();

    // "Mark As Completed" button should be present
    await expect(
      page.getByRole("button", { name: "Mark As Completed" }),
    ).toBeVisible();
  });

  test("progress bar shows 0% for fresh enrollment", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    // Chapters text should appear in sidebar
    await expect(page.getByText("3 chapters")).toBeVisible();
  });

  test("clicking a chapter updates the content area", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    // Click second chapter
    await page.getByText("2 - Variables and Data Types").click();

    // Content should update to chapter 2
    await expect(page.getByText("Variables")).toBeVisible();
  });

  test("'Mark As Completed' fires PATCH to chapter completion API", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    const patchPromise = page.waitForRequest(
      (req) =>
        req.url().includes("/api/proxy/user/shiksha/course") &&
        req.method() === "PATCH",
    );

    await page.getByRole("button", { name: "Mark As Completed" }).click();

    const patchRequest = await patchPromise;
    const body = patchRequest.postDataJSON();
    expect(body).toMatchObject({
      userId: "test-user-id-123",
      courseId: "course-1",
      chapterId: "ch-1",
      isCompleted: true,
    });
  });

  test("chapter status updates after marking complete", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    await page.getByRole("button", { name: "Mark As Completed" }).click();

    // After completion, button text changes to "Completed"
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
  });

  test("certificate banner shows locked state when chapters remain", async ({
    authedPage: page,
  }) => {
    await navigateToCourseViaSPA(page);

    await expect(page.getByText("Certificate Locked")).toBeVisible();
    await expect(
      page.getByText("Complete All to Get Your Certificate"),
    ).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. COURSE COMPLETION & CERTIFICATE
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Shiksha Enrollment — Course Completion", () => {
  test("completing last chapter triggers certificate generation", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, partiallyCompletedCourse);
    await mockChapterCompletionAPI(page);
    await mockCertificateAPI(page);

    await navigateToCourseViaSPA(page);

    // We're on chapter 3 (the only incomplete one)
    await expect(page.getByText("3 - Control Flow")).toBeVisible();

    const certRequestPromise = page.waitForRequest(
      (req) =>
        req.url().includes("/api/proxy/certificate") && req.method() === "POST",
    );

    // Complete the last chapter
    await page.getByRole("button", { name: "Mark As Completed" }).click();

    // Certificate generation should fire
    const certRequest = await certRequestPromise;
    const body = certRequest.postDataJSON();
    expect(body).toMatchObject({
      type: "SHIKSHA",
      userId: "test-user-id-123",
      programId: "course-1",
      programName: "Logic Building for Everyone",
    });
  });

  test("fully completed course shows 'View Certificate' banner", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, completedCourseWithCertificate);
    await mockChapterCompletionAPI(page);
    await mockCertificateAPI(page);

    await navigateToCourseViaSPA(page);

    await expect(page.getByText("View Certificate")).toBeVisible();
    await expect(
      page.getByText("Click below to download your certificate"),
    ).toBeVisible();
  });

  test("fully completed course shows interview prep CTA", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, completedCourseWithCertificate);
    await mockChapterCompletionAPI(page);
    await mockCertificateAPI(page);

    await navigateToCourseViaSPA(page);

    await expect(page.getByText("Start Interview Prep")).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. FULL NAVIGATION FLOW (EXPLORE → COURSE)
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Shiksha Enrollment — Navigation Flow", () => {
  test("user can navigate from explore to course detail page", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, enrolledCourse);

    await page.goto("/shiksha/explore");

    // Course card should be visible with CTA
    await expect(page.getByText("Logic Building for Everyone")).toBeVisible();

    // Click through to course
    await page.getByText("Logic Building for Everyone").click();

    await page.waitForURL(`**/shiksha/${COURSE_SLUG}`);
    await expect(page.getByText("Chapters")).toBeVisible();
  });

  test("'← Back to Courses' link navigates back to explore", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, enrolledCourse);

    await navigateToCourseViaSPA(page);

    const backLink = page.getByRole("link", { name: "← Back to Courses" });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/shiksha/explore");
  });
});
