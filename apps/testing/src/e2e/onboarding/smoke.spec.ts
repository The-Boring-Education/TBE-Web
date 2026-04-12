import { expect, test } from "@playwright/test";

/**
 * Onboarding is a Vite app: valid `userId` + `productId` triggers a user fetch
 * from `VITE_API_BASE_URL` (see apps/onboarding/.env.example). Without a mock,
 * the shell can remain in loading — we stub the user API for a deterministic smoke.
 */
test.describe("Onboarding smoke flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.searchParams.get("userId") === "smoke-e2e-user";
        } catch {
          return false;
        }
      },
      async (route) => {
        // Do not mock the HTML document for `/?userId=...` — only API fetches.
        if (route.request().resourceType() === "document") {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: true,
            data: {
              _id: "smoke-e2e-user",
              userName: "",
              email: "smoke-e2e@example.com",
            },
          }),
        });
      },
    );
  });

  test("webapp onboarding renders branding and first step", async ({
    page,
  }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=webapp", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", {
        name: "Welcome to The Boring Education!",
      }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test("prepyatra alias renders Prep Yatra branding", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=prepyatra", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Welcome to Prep Yatra!" }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test("dsayatra product renders DSA Yatra branding", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=dsayatra", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Welcome to DSA Yatra!" }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test("oncampus product renders OnCampus branding", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=oncampus", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Welcome to OnCampus!" }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test("unknown productId shows invalid link message", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=not-a-valid-product", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByText("Invalid onboarding link.")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("quizes product shows TBE Quizes branding", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=quizes", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Welcome to TBE Quizes!" }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test("tech-yatra product shows Tech Yatra branding", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=tech-yatra", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Welcome to Tech Yatra!" }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test("resume-yatra product shows Resume Yatra branding", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=resume-yatra", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Welcome to Resume Yatra!" }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test("platform productId shows platform branding", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=platform", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Welcome to The Boring Education!" }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test("quizapp alias shows The Boring Quiz branding", async ({ page }) => {
    await page.goto("/?userId=smoke-e2e-user&productId=quizapp", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Welcome to The Boring Quiz!" }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });
});
