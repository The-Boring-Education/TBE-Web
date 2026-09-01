import { expect, test } from "../fixtures/platform.fixture";

test.describe("Platform checkout page", () => {
  test("checkout loads for subscription query params", async ({
    platformPage: page,
  }) => {
    const response = await page.goto(
      "/checkout?productType=DSA_YATRA&productId=lifetime",
    );
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /DSA Yatra/i })).toBeVisible(
      { timeout: 15_000 },
    );
  });

  test("checkout shows invalid message without required params", async ({
    platformPage: page,
  }) => {
    const response = await page.goto("/checkout");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: /checkout link is incomplete/i }),
    ).toBeVisible();
  });
});
