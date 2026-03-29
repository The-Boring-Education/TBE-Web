import { expect, test } from "../fixtures/public.fixture";

test.describe("Quizes smoke flow", () => {
  test("landing loads and primary CTA is visible", async ({
    publicPage: page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { name: "Quizes" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start Practicing" }).first(),
    ).toBeVisible();
  });

  test("user can navigate from landing to login", async ({
    publicPage: page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("button", { name: "Start Practicing" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/login\/?$/);

    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });
});
