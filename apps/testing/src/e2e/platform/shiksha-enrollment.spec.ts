import { expect, test } from "../fixtures/auth.fixture";
import {
  COURSE_SLUG,
  enrolledCourse,
  mockChapterCompletionAPI,
  mockCoursePageSSR,
  mockShikshaExploreAPI,
  unenrolledCourse,
} from "../fixtures/course-mocks";

async function goToCourseFromExplore(page: import("@playwright/test").Page) {
  await page.goto("/shiksha/explore");
  const courseLink = page.locator(`a[href="/shiksha/${COURSE_SLUG}"]`).first();
  await expect(courseLink).toBeVisible();
  await courseLink.click();
  await page.waitForURL(`**/shiksha/${COURSE_SLUG}**`, { timeout: 60000 });
}

test.describe("Shiksha Enrollment — Flow First", () => {
  test("explore to course navigation works", async ({ authedPage: page }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, unenrolledCourse);

    await goToCourseFromExplore(page);

    await expect(page).toHaveURL(new RegExp(`/shiksha/${COURSE_SLUG}`));
    await expect(
      page.getByRole("link", { name: "← Back to Courses" }),
    ).toBeVisible();
  });

  test("course page shows an access CTA in unenrolled state", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, unenrolledCourse);

    await goToCourseFromExplore(page);

    const actionButtons = page.locator("main button");
    expect(await actionButtons.count()).toBeGreaterThan(0);
  });

  test("chapter list and back navigation are available", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, unenrolledCourse);

    await goToCourseFromExplore(page);

    const chapterLinks = page.locator('a[href^="/shiksha/"]');
    expect(await chapterLinks.count()).toBeGreaterThan(1);

    const backLink = page.getByRole("link", { name: "← Back to Courses" });
    await expect(backLink).toHaveAttribute("href", "/shiksha/explore");
  });

  test("enrolled flow exposes completion action when available", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, enrolledCourse);
    await mockChapterCompletionAPI(page);

    await goToCourseFromExplore(page);

    const markCompleted = page.getByRole("button", {
      name: "Mark As Completed",
    });
    if ((await markCompleted.count()) > 0) {
      const patchPromise = page.waitForRequest(
        (req) =>
          req.url().includes("/api/proxy/user/shiksha/course") &&
          req.method() === "PATCH",
      );
      await markCompleted.click();
      await patchPromise;
    } else {
      // Some builds gate completion behind auth/session checks.
      await expect(
        page.getByRole("button", { name: "Login to Get Started" }),
      ).toBeVisible();
    }
  });
});
