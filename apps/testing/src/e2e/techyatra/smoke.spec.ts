import { expect, test } from "../fixtures/public.fixture";

test.describe("Tech Yatra smoke flow", () => {
  test("landing loads with hero and learning path section", async ({
    publicPage: page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", {
        name: /Confused What to Learn/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Start Your Yatra Here 🚀" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start Exploring 🎯" }),
    ).toBeVisible();
  });

  test("learning paths section is present", async ({ publicPage: page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Choose Your Learning Path" }),
    ).toBeVisible();
  });

  test("free learning section renders", async ({ publicPage: page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Learn Tech for Free" }),
    ).toBeVisible();
  });
});
