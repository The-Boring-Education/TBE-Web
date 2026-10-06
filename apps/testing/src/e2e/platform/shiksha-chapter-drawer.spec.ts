import type { Page } from "@playwright/test";

import { expect, test } from "../fixtures/auth.fixture";
import {
  COURSE_SLUG,
  enrolledCourse,
  mockCoursePageSSR,
  mockShikshaExploreAPI,
} from "../fixtures/course-mocks";

const chapterHref = (chapterId: string) =>
  `/shiksha/${COURSE_SLUG}/learn?chapterId=${chapterId}`;

/** Presses Tab until `isFocused` resolves true, so the whole flow stays keyboard-only. */
const tabUntilFocused = async (
  page: Page,
  isFocused: () => Promise<boolean>,
  maxPresses = 40,
) => {
  for (let i = 0; i < maxPresses; i++) {
    if (await isFocused()) return;
    await page.keyboard.press("Tab");
  }
  expect(await isFocused()).toBe(true);
};

const goToCourseLearn = async (page: Page, chapterId: string) => {
  await page.goto("/shiksha/explore");
  await page.locator(`a[href="/shiksha/${COURSE_SLUG}"]`).first().click();
  await page.waitForURL(`**/shiksha/${COURSE_SLUG}*`);
  await Promise.all([
    page.waitForURL(`**${chapterHref(chapterId)}`),
    page
      .locator(`a[href="${chapterHref(chapterId)}"]`)
      .first()
      .click(),
  ]);
};

test.describe("Shiksha mobile chapter drawer — keyboard accessibility", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, navigates and dismisses with the keyboard alone", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, enrolledCourse);

    await goToCourseLearn(page, "ch-1");

    const drawer = page.getByRole("dialog", { name: "Chapters" });
    const trigger = page.getByRole("button", { name: /View Chapters/ });
    const mainContent = page.locator("main#chapter-content");

    // Closed drawer must not exist in the accessibility tree or tab order.
    await expect(drawer).toHaveCount(0);
    await expect(page.locator(`a[href="${chapterHref("ch-2")}"]`)).toBeHidden();

    // Tab to the trigger and open with Enter.
    await expect(trigger).toBeVisible();
    await tabUntilFocused(page, () =>
      trigger.evaluate((el) => el === document.activeElement),
    );
    await page.keyboard.press("Enter");

    await expect(drawer).toBeVisible();
    // Focus moved into the drawer.
    await expect
      .poll(() => drawer.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true);

    // Tab to the second chapter and activate it.
    const secondChapter = drawer.getByRole("link", {
      name: "2. Variables and Data Types",
    });
    await tabUntilFocused(page, () =>
      secondChapter.evaluate((el) => el === document.activeElement),
    );
    await page.keyboard.press("Enter");

    await page.waitForURL(`**${chapterHref("ch-2")}`);
    await expect(drawer).toHaveCount(0);
    // Selecting a chapter moves focus to the chapter content.
    await expect(mainContent).toBeFocused();

    // Re-open and dismiss with Escape; focus returns to the trigger.
    await tabUntilFocused(page, () =>
      trigger.evaluate((el) => el === document.activeElement),
    );
    await page.keyboard.press("Enter");
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("drawer exposes an accessible name and a labelled close control", async ({
    authedPage: page,
  }) => {
    await mockShikshaExploreAPI(page);
    await mockCoursePageSSR(page, enrolledCourse);

    await goToCourseLearn(page, "ch-1");

    await page.getByRole("button", { name: /View Chapters/ }).click();

    const drawer = page.getByRole("dialog", { name: "Chapters" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("button", { name: "Close" })).toBeVisible();

    // Background content is hidden from assistive technology while open.
    await expect
      .poll(() =>
        page
          .locator("main#chapter-content")
          .evaluate((el) => el.closest('[aria-hidden="true"]') !== null),
      )
      .toBe(true);

    await drawer.getByRole("button", { name: "Close" }).click();
    await expect(drawer).toHaveCount(0);
  });
});
