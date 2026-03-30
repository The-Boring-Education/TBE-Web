import { expect, test } from "../fixtures/public.fixture";

test.describe("Prep Yatra smoke flow", () => {
  test("landing loads and journey CTA is visible", async ({
    publicPage: page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("button", { name: "Start Your Journey for Free" }),
    ).toBeVisible();
  });

  test("user can navigate from landing to login", async ({
    publicPage: page,
  }) => {
    await page.goto("/");

    const journeyCTA = page.getByRole("button", {
      name: "Start Your Journey for Free",
    });
    await expect(journeyCTA).toBeVisible();
    await expect(journeyCTA).toBeEnabled();

    await Promise.all([
      page.waitForURL(/\/login\/?$/, { timeout: 15_000 }),
      journeyCTA.click(),
    ]);

    await expect(
      page.getByRole("heading", { name: "Welcome Back!" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });

  test("login page renders core auth UI", async ({ publicPage: page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Welcome Back!" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });

  test("pricing redirects unauthenticated users to login", async ({
    publicPage: page,
  }) => {
    await page.goto("/pricing");

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });
});
