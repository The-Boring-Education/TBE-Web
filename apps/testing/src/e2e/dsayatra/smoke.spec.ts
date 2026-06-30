import { expect, test } from "../fixtures/public.fixture";

test.describe("DSA Yatra smoke flow", () => {
  test("landing loads and get started CTA is visible", async ({
    publicPage: page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", {
        name: "Stop Grinding Random LeetCode Questions",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Practice that fits your interviews" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();
  });

  test("landing get started CTA points to dashboard route", async ({
    publicPage: page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: "Get Started" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  test("login page renders auth CTA", async ({ publicPage: page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { name: "The Boring Education" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });
});
