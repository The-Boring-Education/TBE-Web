import type { Page } from "@playwright/test";

import { expect, test } from "../fixtures/auth.fixture";
import {
  COURSE_SLUG,
  enrolledCourse,
  mockChapterCompletionAPI,
  mockCourseLearnSSR,
  mockShikshaExploreAPI,
} from "../fixtures/course-mocks";

const LEARN_URL = `/shiksha/${COURSE_SLUG}/learn`;

const CHAPTERS = [
  { id: "ch-1", name: "Introduction to Logic", body: "Welcome to logic" },
  { id: "ch-2", name: "Variables and Data Types", body: "Learn about" },
  { id: "ch-3", name: "Control Flow", body: "If/else statements" },
];

const VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "mobile", width: 390, height: 844 },
];

/** Counts every write a learner should never trigger by just switching chapters. */
const trackWrites = async (page: Page) => {
  const writes: string[] = [];

  await page.route("**/api/proxy/user/shiksha/enroll", (route) => {
    if (route.request().method() === "POST") writes.push("enroll");
    return route.fulfill({ status: 200, json: { status: true } });
  });
  await page.route("**/api/proxy/certificate", (route) => {
    if (route.request().method() === "POST") writes.push("certificate");
    return route.fulfill({ status: 200, json: { status: true, data: null } });
  });
  page.on("request", (request) => {
    if (
      request.method() === "PATCH" &&
      request.url().includes("/api/proxy/user/shiksha/course")
    ) {
      writes.push("completion");
    }
  });

  return writes;
};

const openLearnPage = async (page: Page, chapterId: string) => {
  await page.goto("/shiksha/explore");

  const courseLink = page.locator(`a[href="/shiksha/${COURSE_SLUG}"]`).first();
  await expect(courseLink).toBeVisible();
  await Promise.all([
    page.waitForURL(`**/shiksha/${COURSE_SLUG}`),
    courseLink.click(),
  ]);

  await Promise.all([
    page.waitForURL(`**${LEARN_URL}?chapterId=${chapterId}`),
    page.locator(`a[href="${LEARN_URL}?chapterId=${chapterId}"]`).click(),
  ]);
};

/** Navigate the way a pasted link or an in-app redirect does, through the router. */
const visit = async (page: Page, url: string) => {
  await page.evaluate(
    (target) =>
      (
        window as unknown as { next: { router: { push: (u: string) => void } } }
      ).next.router.push(target),
    url,
  );
};

const selectChapter = async (
  page: Page,
  chapterId: string,
  isMobile = false,
) => {
  if (isMobile) {
    await page.getByRole("button", { name: /View Chapters/i }).click();
  }

  // The mobile drawer renders before the desktop sidebar in the DOM.
  const links = page.locator(`a[href="${LEARN_URL}?chapterId=${chapterId}"]`);
  const link = isMobile ? links.first() : links.last();

  await Promise.all([
    page.waitForURL(`**${LEARN_URL}?chapterId=${chapterId}`),
    link.click(),
  ]);
};

/** The heading and the body must always describe the same chapter. */
const expectChapter = async (
  page: Page,
  chapter: (typeof CHAPTERS)[number],
) => {
  await expect(
    page.getByRole("heading", { level: 1, name: chapter.name }),
  ).toBeVisible();
  await expect(page.getByText(chapter.body).first()).toBeVisible();
};

test.describe("Shiksha learn — chapter is resolved from the URL", () => {
  for (const viewport of VIEWPORTS) {
    const isMobile = viewport.label === "mobile";

    test.describe(`${viewport.label} (${viewport.width}px)`, () => {
      test.beforeEach(async ({ authedPage: page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await mockShikshaExploreAPI(page);
        await mockCourseLearnSSR(page, enrolledCourse);
        await mockChapterCompletionAPI(page);
      });

      test("a chapter link opens that chapter and survives a refresh", async ({
        authedPage: page,
      }) => {
        await openLearnPage(page, CHAPTERS[0].id);
        await expectChapter(page, CHAPTERS[0]);

        await visit(page, `${LEARN_URL}?chapterId=${CHAPTERS[2].id}`);
        await expect(page).toHaveURL(
          new RegExp(`chapterId=${CHAPTERS[2].id}$`),
        );
        await expectChapter(page, CHAPTERS[2]);

        // Refreshing re-runs the server props for the same URL.
        await visit(page, `${LEARN_URL}?chapterId=${CHAPTERS[2].id}`);
        await expectChapter(page, CHAPTERS[2]);
      });

      test("an unrecognised chapter id redirects to the first chapter without looping", async ({
        authedPage: page,
      }) => {
        await openLearnPage(page, CHAPTERS[0].id);

        await visit(page, `${LEARN_URL}?chapterId=does-not-exist`);

        await page.waitForURL(`**${LEARN_URL}?chapterId=${CHAPTERS[0].id}`);
        await expectChapter(page, CHAPTERS[0]);

        // The canonical URL is stable: it does not redirect again.
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(
          new RegExp(`chapterId=${CHAPTERS[0].id}$`),
        );
      });

      test("Back and Forward restore the chapter they left", async ({
        authedPage: page,
      }) => {
        await openLearnPage(page, CHAPTERS[0].id);
        await selectChapter(page, CHAPTERS[1].id, isMobile);
        await expectChapter(page, CHAPTERS[1]);

        await page.goBack();
        await expect(page).toHaveURL(
          new RegExp(`chapterId=${CHAPTERS[0].id}$`),
        );
        await expectChapter(page, CHAPTERS[0]);

        await page.goForward();
        await expect(page).toHaveURL(
          new RegExp(`chapterId=${CHAPTERS[1].id}$`),
        );
        await expectChapter(page, CHAPTERS[1]);
      });

      test("Back to the learn URL without a chapter id shows the first chapter", async ({
        authedPage: page,
      }) => {
        await openLearnPage(page, CHAPTERS[0].id);

        await visit(page, LEARN_URL);
        await expectChapter(page, CHAPTERS[0]);

        await selectChapter(page, CHAPTERS[1].id, isMobile);
        await expectChapter(page, CHAPTERS[1]);

        await page.goBack();
        await expect(page).toHaveURL(new RegExp(`${LEARN_URL}$`));
        await expectChapter(page, CHAPTERS[0]);
      });

      test("switching chapters performs no enrolment, completion or certificate writes", async ({
        authedPage: page,
      }) => {
        const writes = await trackWrites(page);

        await openLearnPage(page, CHAPTERS[0].id);
        await selectChapter(page, CHAPTERS[1].id, isMobile);
        await expectChapter(page, CHAPTERS[1]);
        await selectChapter(page, CHAPTERS[2].id, isMobile);
        await expectChapter(page, CHAPTERS[2]);

        expect(writes).toEqual([]);
      });
    });
  }
});
