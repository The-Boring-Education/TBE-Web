import { expect, test } from "../fixtures/public.fixture";

test.describe("OnCampus smoke flow", () => {
  test("landing loads with hero content", async ({ publicPage: page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { name: /Advance Your Career with/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Get Started for Free/i }),
    ).toBeVisible();
  });

  test("user can navigate from landing to login", async ({
    publicPage: page,
  }) => {
    await page.goto("/");

    const startCTA = page.getByRole("link", { name: /Get Started for Free/i });
    await expect(startCTA).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/login\/?$/, { timeout: 15_000 }),
      startCTA.click(),
    ]);

    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });

  test("campus prep page renders resources section", async ({
    publicPage: page,
  }) => {
    const response = await page.goto("/campus-prep");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { name: /What[’']?s Coming Soon/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Upcoming additions to OnCampus/i),
    ).toBeVisible();
  });
});
