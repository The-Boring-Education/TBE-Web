import { expect, test } from "@playwright/test";

import { installDsayatraSocialProfileMocks } from "../fixtures/dsayatra-profile-mocks";

test.describe("DSA Yatra social profile edit", () => {
  test.beforeEach(async ({ page }) => {
    await installDsayatraSocialProfileMocks(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Welcome back,/ }),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("saves LinkedIn URL via edit modal and shows active dashboard link", async ({
    page,
  }) => {
    const linkedInInput = "linkedin.com/in/e2e-dsa-profile";

    await page.getByRole("button", { name: /edit goal/i }).click();
    await expect(
      page.getByRole("dialog").getByText("Edit Goal & DSA Preferences"),
    ).toBeVisible();

    await page.getByLabel(/^linkedin$/i).fill(linkedInInput);

    const saveRequest = page.waitForRequest(
      (req) =>
        req.method() === "POST" &&
        /\/api\/proxy\/dsayatra\/onboarding/.test(req.url()),
    );

    await page.getByRole("button", { name: /^save changes$/i }).click();

    const request = await saveRequest;
    const body = request.postDataJSON() as { linkedInUrl?: string };
    expect(body.linkedInUrl).toMatch(/linkedin\.com\/in\/e2e-dsa-profile/i);

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const linkedInLink = page.getByRole("link", { name: "LinkedIn profile" });
    await expect(linkedInLink).toHaveAttribute(
      "href",
      /linkedin\.com\/in\/e2e-dsa-profile/i,
    );
    await expect(linkedInLink).not.toHaveAttribute("href", "#");
  });

  test("prefills saved social URLs when reopening the edit modal", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /edit goal/i }).click();
    await page.getByLabel(/^linkedin$/i).fill("linkedin.com/in/e2e-prefill");
    await page.getByLabel(/^github$/i).fill("github.com/e2e-prefill");

    await page.getByRole("button", { name: /^save changes$/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /edit goal/i }).click();
    await expect(
      page.getByRole("dialog").getByText("Edit Goal & DSA Preferences"),
    ).toBeVisible();

    await expect(page.getByLabel(/^linkedin$/i)).toHaveValue(
      /linkedin\.com\/in\/e2e-prefill/i,
    );
    await expect(page.getByLabel(/^github$/i)).toHaveValue(
      /github\.com\/e2e-prefill/i,
    );
  });

  test("dashboard LeetCode link uses leetCodeUrl after save", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /edit goal/i }).click();
    await page.getByLabel(/^leetcode$/i).fill("leetcode.com/u/e2e-leetcode");

    await page.getByRole("button", { name: /^save changes$/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByRole("link", { name: "LeetCode profile" }),
    ).toHaveAttribute("href", /leetcode\.com\/u\/e2e-leetcode/i);
  });
});
