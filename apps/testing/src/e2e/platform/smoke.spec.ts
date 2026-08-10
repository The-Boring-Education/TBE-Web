import { expect, test } from "../fixtures/platform.fixture";

test.describe("Platform smoke flow", () => {
  test("landing loads with hero CTAs", async ({ platformPage: page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("link", { name: /Start Learning Now/i }),
    ).toBeVisible();
  });

  test("shiksha landing exposes explore courses CTA", async ({
    platformPage: page,
  }) => {
    const response = await page.goto("/shiksha");
    expect(response?.status()).toBe(200);

    const exploreCourses = page.getByRole("link", { name: "Explore Courses" });
    await expect(exploreCourses).toBeVisible();
    await expect(exploreCourses).toHaveAttribute("href", "/shiksha/explore");
  });

  test("interview prep landing exposes explore sheets CTA", async ({
    platformPage: page,
  }) => {
    const response = await page.goto("/interview-prep");
    expect(response?.status()).toBe(200);

    const exploreSheets = page.getByRole("link", { name: "Explore Sheets" });
    await expect(exploreSheets).toBeVisible();
    await expect(exploreSheets).toHaveAttribute(
      "href",
      "/interview-prep/explore",
    );
  });
});
