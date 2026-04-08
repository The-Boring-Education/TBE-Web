import { expect, test } from "../fixtures/public.fixture";

test.describe("Resume Yatra smoke flow", () => {
  test("landing loads with hero and primary CTA", async ({
    publicPage: page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    const hero = page.getByRole("heading", { level: 1 });
    await expect(hero).toContainText(/Resume Building for/);
    await expect(hero).toContainText(/Developers/);
    await expect(
      page.getByRole("button", { name: "Start Building My Resume" }),
    ).toBeVisible();
  });

  test("login page renders Google sign-in", async ({ publicPage: page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });
});
