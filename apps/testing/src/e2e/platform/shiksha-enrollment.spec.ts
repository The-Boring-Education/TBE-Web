import type { Page } from "@playwright/test";

import { expect, test } from "../fixtures/auth.fixture";
import {
  COURSE_SLUG,
  enrolledCourse,
  mockChapterCompletionAPI,
  mockCoursePageSSR,
  mockShikshaExploreAPI,
  partiallyCompletedCourse,
  unenrolledCourse,
} from "../fixtures/course-mocks";

const goToCourseFromExplore = async (page: Page) => {
  await page.goto("/shiksha/explore");
  const courseLink = page.locator(`a[href="/shiksha/${COURSE_SLUG}"]`).first();
  await expect(courseLink).toBeVisible();
  await Promise.all([
    page.waitForURL(`**/shiksha/${COURSE_SLUG}*`, { timeout: 30000 }),
    courseLink.click(),
  ]);
};

const goToCourseLearnFromExplore = async (page: Page, chapterId: string) => {
  await goToCourseFromExplore(page);
  await Promise.all([
    page.waitForURL(
      "**/shiksha/" + COURSE_SLUG + "/learn?chapterId=" + chapterId,
    ),
    page
      .locator(
        'a[href="/shiksha/' +
          COURSE_SLUG +
          "/learn?chapterId=" +
          chapterId +
          '"]',
      )
      .click(),
  ]);
};

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

  test("an enrolled learner can complete a chapter", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, enrolledCourse);
    await mockChapterCompletionAPI(page);

    await goToCourseLearnFromExplore(page, "ch-1");

    const markCompleted = page.getByRole("button", {
      name: "Mark As Completed",
    });
    await expect(markCompleted).toBeVisible();

    const patchPromise = page.waitForRequest(
      (req) =>
        req.url().includes("/api/proxy/user/shiksha/course") &&
        req.method() === "PATCH",
    );
    await markCompleted.click();
    await patchPromise;
  });

  test("course completion celebrates once and does not reshow feedback on navigation", async ({
    authedPage: page,
  }) => {
    let certificateRequests = 0;
    let browserCompletionAwardRequests = 0;
    let releaseCertificateResponse: () => void = () => {};
    const certificateResponseGate = new Promise<void>((resolve) => {
      releaseCertificateResponse = resolve;
    });

    await page.route("**/api/proxy/certificate", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();

      certificateRequests += 1;
      await certificateResponseGate;
      await route.fulfill({
        status: 200,
        json: { status: true, data: { _id: "cert-generated-456" } },
      });
    });
    await page.route("**/api/proxy/gamification**", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();

      const body = route.request().postDataJSON() as {
        actionType?: string;
      } | null;
      if (body?.actionType === "COMPLETE_COURSE_CERTIFICATE") {
        browserCompletionAwardRequests += 1;
        await route.fulfill({
          status: 200,
          json: { status: true, data: null },
        });
        return;
      }

      await route.fallback();
    });
    await page.route("**/api/proxy/user/shiksha/course", async (route) => {
      if (route.request().method() !== "PATCH") return route.fallback();

      await route.fulfill({
        status: 200,
        json: { status: true, message: "Chapter updated" },
      });
    });
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, partiallyCompletedCourse);

    await goToCourseLearnFromExplore(page, "ch-3");

    const markCompleted = page.getByRole("button", {
      name: "Mark As Completed",
    });
    const completionRequest = page.waitForRequest(
      (req) =>
        req.url().includes("/api/proxy/user/shiksha/course") &&
        req.method() === "PATCH",
    );
    await markCompleted.click();
    await completionRequest;

    const completionToast = page.getByText(
      "Congratulations! Course completed!",
      { exact: true },
    );
    await expect.poll(() => certificateRequests).toBe(1);
    await expect(completionToast).not.toBeVisible();
    releaseCertificateResponse();

    await expect(page.getByText("Rate your experience")).toBeVisible();
    await expect(completionToast).toBeVisible();

    await page.getByRole("button", { name: "✕" }).click();
    await expect(page.getByText("Rate your experience")).not.toBeVisible();

    const completionToastContainer = page
      .locator("div.fixed.top-20")
      .filter({ hasText: "Congratulations! Course completed!" });
    await completionToastContainer.getByRole("button").click();
    await expect(completionToast).not.toBeVisible();

    for (const chapterId of ["ch-1", "ch-2", "ch-3", "ch-1"]) {
      await page
        .locator(
          `aside a[href="/shiksha/${COURSE_SLUG}/learn?chapterId=${chapterId}"]`,
        )
        .click();
      await expect(page).toHaveURL(new RegExp(`chapterId=${chapterId}$`));
      await expect(page.getByText("Rate your experience")).not.toBeVisible();
      await expect(completionToast).not.toBeVisible();
    }

    expect(certificateRequests).toBe(1);
    expect(browserCompletionAwardRequests).toBe(0);
  });
});
