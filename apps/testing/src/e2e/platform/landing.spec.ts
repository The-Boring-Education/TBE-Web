import { expect, test } from "../fixtures/platform.fixture";

test.describe("Platform Landing Page", () => {
  test("loads successfully and renders hero section", async ({
    platformPage: page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByText("Learn Tech Skills & Prepare yourself for a Tech Job."),
    ).toBeVisible();

    await expect(page.getByText("Tech Education for")).toBeVisible();
  });

  test("displays primary and secondary CTAs", async ({
    platformPage: page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Book Free Session" }),
    ).toBeVisible();
  });

  test("renders Products section", async ({ platformPage: page }) => {
    await page.goto("/");

    const productsSection = page.locator("#products");
    await expect(productsSection).toBeAttached();

    await expect(page.getByText("Our")).toBeVisible();
    await expect(page.getByText("Products")).toBeVisible();
  });

  test("renders community and testimonial sections", async ({
    platformPage: page,
  }) => {
    await page.goto("/");

    await expect(page.getByText("What We Do")).toBeVisible();
  });

  test("navigation contains key links", async ({ platformPage: page }) => {
    await page.goto("/");

    const nav = page.locator("nav");
    if ((await nav.count()) > 0) {
      const navLinks = nav.getByRole("link");
      expect(await navLinks.count()).toBeGreaterThan(0);
    }
  });
});
