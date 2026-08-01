import { expect, test } from "../fixtures/public.fixture";

test.describe("Resume Yatra smoke flow", () => {
  test("landing loads with hero and primary CTA", async ({
    publicPage: page,
  }) => {
    const response = await page.goto("/");
    if (response) {
      expect(response.status()).toBe(200);
    }

    const hero = page.getByRole("heading", { level: 1 });
    await expect(hero).toContainText(/Stop Sending Resumes/i);
    await expect(hero).toContainText(/That Get Ignored/i);
    await expect(
      page.locator("a, button", { hasText: /Start Building My Resume/i }),
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
