import { expect, test } from "../fixtures/public.fixture";

test.describe("OnCampus smoke flow", () => {
  test("landing loads with hero content", async ({ publicPage: page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { name: /Advance Your Career with/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Get Started for Free" }),
    ).toBeVisible();
  });

  test("user can navigate from landing to login", async ({
    publicPage: page,
  }) => {
    await page.goto("/");

    const startCTA = page.getByRole("button", { name: "Get Started for Free" });
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
      page.getByRole("heading", { name: "Our Resources" }),
    ).toBeVisible();
    const resourceLinks = page.locator("section a[href]");
    expect(await resourceLinks.count()).toBeGreaterThan(0);
  });
});
