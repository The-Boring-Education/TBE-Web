import { expect, test } from "../fixtures/auth.fixture";

test.describe("Platform — Learn Space & Dashboard E2E", () => {
  test.beforeEach(async ({ authedPage: page }) => {
    // Mock Shiksha courses catalog
    await page.route("**/api/proxy/shiksha**", (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: [
              {
                _id: "course-1",
                name: "Zero to One Frontend Development",
                slug: "zero-to-one-frontend",
                status: "PUBLISHED",
                description: "Comprehensive frontend path",
                chapters: [{ _id: "ch-1", name: "Introduction to HTML" }],
              },
            ],
          },
        });
      }
      return route.continue();
    });

    // Mock Interview Prep sheets catalog
    await page.route("**/api/proxy/interview-prep**", (route) => {
      const url = route.request().url();
      if (
        route.request().method() === "GET" &&
        !url.includes("user/interview-prep")
      ) {
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: [
              {
                _id: "sheet-1",
                name: "React Interview Questions",
                slug: "react-interview-questions",
                roadmap: "Frontend",
                description: "Top React questions",
                questions: [
                  {
                    _id: "q-1",
                    name: "What is JSX?",
                    question: "What is JSX?",
                    answer: "JSX is syntax extension",
                  },
                ],
              },
            ],
          },
        });
      }
      return route.continue();
    });

    // Mock enrolled courses
    await page.route("**/api/proxy/user/shiksha**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              _id: "course-1",
              title: "Zero to One Frontend Development",
              slug: "zero-to-one-frontend",
              isCourse: true,
              progress: { completed: 2, total: 10, percentage: 20 },
            },
          ],
        },
      });
    });

    // Mock enrolled sheets
    await page.route("**/api/proxy/user/interview-prep**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              _id: "sheet-1",
              title: "React Interview Questions",
              slug: "react-interview-questions",
              progress: { completed: 4, total: 15, percentage: 27 },
            },
          ],
        },
      });
    });

    // Mock quiz categories
    await page.route("**/api/proxy/quiz/categories**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              _id: "cat-1",
              categoryName: "Frontend Development",
              quizzesCount: 5,
            },
          ],
        },
      });
    });
  });

  test("loads learn dashboard with greetings and enrolled learning cards", async ({
    authedPage: page,
  }) => {
    await page.goto("/learn", { waitUntil: "domcontentloaded" });

    // Assert dashboard layout renders
    await expect(
      page.getByText(/Good (morning|afternoon|evening)/i),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("My learning")).toBeVisible();
    await expect(
      page.getByText("React Interview Questions").first(),
    ).toBeVisible();
  });

  test("sidebar navigation buttons switch active space tabs", async ({
    authedPage: page,
  }) => {
    await page.goto("/learn", { waitUntil: "domcontentloaded" });

    // Navigate to Shiksha
    const shikshaBtn = page.getByRole("button", { name: "Shiksha" });
    await expect(shikshaBtn).toBeVisible();
    await shikshaBtn.click();
    await expect(page).toHaveURL(/\/learn\/shiksha/);

    // Navigate to Interview Prep
    const prepBtn = page.getByRole("button", { name: "Interview Prep" });
    await expect(prepBtn).toBeVisible();
    await prepBtn.click();
    await expect(page).toHaveURL(/\/learn\/interview-prep/);

    // Navigate to Quizzes
    const quizzesBtn = page
      .locator("aside")
      .getByRole("button", { name: /quizzes/i });
    await expect(quizzesBtn).toBeVisible();
    await quizzesBtn.click();
    await expect(page).toHaveURL(/\/learn\/quizzes/);

    // Navigate back to Dashboard
    const dashboardBtn = page.getByRole("button", { name: "Dashboard" });
    await expect(dashboardBtn).toBeVisible();
    await dashboardBtn.click();
    await expect(page).toHaveURL(/\/learn\/?$/);
  });

  test("Catalog button fails or resets when clicked (Identified Bug)", async ({
    authedPage: page,
  }) => {
    await page.goto("/learn", { waitUntil: "domcontentloaded" });

    // Find and click the 'Explore Catalog' button on the bulb card or 'Catalog' on sidebar
    const exploreCatalogBtn = page.getByRole("button", {
      name: /explore catalog/i,
    });
    if (await exploreCatalogBtn.isVisible()) {
      await exploreCatalogBtn.click();
      // Because router.asPath remains /learn, the sync effect forces activeTab back to dashboard
      // Catalog heading "Explore Courses, Sheets & Resources" does NOT persist
      const catalogHeading = page.getByText(
        /explore courses, sheets & resources/i,
      );
      const isCatalogOpen = await catalogHeading.isVisible().catch(() => false);
      expect(isCatalogOpen).toBe(false);
    }
  });

  test("Resume Sheet button on dashboard fails to keep sheet learning space open (Identified Bug)", async ({
    authedPage: page,
  }) => {
    await page.goto("/learn", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("React Interview Questions").first(),
    ).toBeVisible({
      timeout: 10_000,
    });

    const resumeBtn = page
      .getByRole("button", { name: /resume sheet/i })
      .first();
    if (await resumeBtn.isVisible()) {
      await resumeBtn.click();
      // Because it only set state without router.push, the URL sync effect resets it back to /learn dashboard
      await page.waitForTimeout(1000);
      // The SheetLearningSpace questions view is not opened; URL is still /learn
      await expect(page).toHaveURL(/\/learn\/?$/);
    }
  });
});
