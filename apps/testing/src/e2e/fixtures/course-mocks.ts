import type { Page } from "@playwright/test";

import { mockCourses } from "./api-mocks";

const COURSE_SLUG = "logic-building-for-everyone";

const baseChapters = [
  {
    _id: "ch-1",
    name: "Introduction to Logic",
    content: "# Introduction\n\nWelcome to logic building fundamentals.",
    isCompleted: false,
    order: 1,
  },
  {
    _id: "ch-2",
    name: "Variables and Data Types",
    content: "# Variables\n\nLearn about variables and data types.",
    isCompleted: false,
    order: 2,
  },
  {
    _id: "ch-3",
    name: "Control Flow",
    content: "# Control Flow\n\nIf/else statements and loops.",
    isCompleted: false,
    order: 3,
  },
];

const baseCourse = {
  _id: "course-1",
  name: "Logic Building for Everyone",
  slug: COURSE_SLUG,
  description:
    "Build a strong foundation in programming logic with hands-on exercises.",
  coverImageURL: "https://placehold.co/400x300",
  meta: "# Course Overview\n\nThis course teaches logic building from scratch.",
  liveOn: "2024-01-01T00:00:00.000Z",
  isPremium: false,
  isCompleted: false,
  certificateId: null,
};

const baseSeoMeta = {
  title: "Logic Building for Everyone | Shiksha | The Boring Education",
  siteName: "Shiksha The Boring Education",
  description: baseCourse.description,
  url: `/shiksha/${COURSE_SLUG}`,
};

/**
 * Unenrolled: user is logged in but hasn't enrolled yet.
 * Chapters are present but content is locked.
 */
export const unenrolledCourse = {
  pageProps: {
    slug: `/shiksha/${COURSE_SLUG}`,
    seoMeta: baseSeoMeta,
    course: {
      ...baseCourse,
      isEnrolled: false,
      chapters: baseChapters,
    },
    meta: baseCourse.meta,
    currentChapterId: "ch-1",
  },
  __N_SSP: true,
};

/**
 * Enrolled: user has enrolled, all chapters accessible but none completed.
 */
export const enrolledCourse = {
  pageProps: {
    slug: `/shiksha/${COURSE_SLUG}`,
    seoMeta: baseSeoMeta,
    course: {
      ...baseCourse,
      isEnrolled: true,
      chapters: baseChapters.map((ch) => ({ ...ch, isCompleted: false })),
    },
    meta: baseChapters[0].content,
    currentChapterId: "ch-1",
  },
  __N_SSP: true,
};

/**
 * Partially completed: first two chapters done, last one pending.
 */
export const partiallyCompletedCourse = {
  pageProps: {
    slug: `/shiksha/${COURSE_SLUG}`,
    seoMeta: baseSeoMeta,
    course: {
      ...baseCourse,
      isEnrolled: true,
      chapters: baseChapters.map((ch, i) => ({
        ...ch,
        isCompleted: i < 2,
      })),
    },
    meta: baseChapters[2].content,
    currentChapterId: "ch-3",
  },
  __N_SSP: true,
};

/**
 * Fully completed: all chapters done, certificate exists.
 */
export const completedCourseWithCertificate = {
  pageProps: {
    slug: `/shiksha/${COURSE_SLUG}`,
    seoMeta: baseSeoMeta,
    course: {
      ...baseCourse,
      isEnrolled: true,
      isCompleted: true,
      certificateId: "cert-abc-123",
      chapters: baseChapters.map((ch) => ({ ...ch, isCompleted: true })),
    },
    meta: baseChapters[0].content,
    currentChapterId: "ch-1",
  },
  __N_SSP: true,
};

export { COURSE_SLUG };

// ─── Route helpers ───────────────────────────────────────────────────────────

/**
 * Mock the shiksha explore page API so course cards render.
 */
export async function mockShikshaExploreAPI(page: Page) {
  await page.route("**/api/proxy/shiksha", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, json: mockCourses });
    }
    return route.continue();
  });
}

/**
 * Mock the `_next/data` endpoint that Next.js fetches during SPA navigation
 * to a `getServerSideProps` page. This lets us control the course page props
 * without needing the actual API server.
 */
export async function mockCoursePageSSR(
  page: Page,
  courseData: {
    pageProps: Record<string, unknown>;
    __N_SSP: boolean;
  },
  /**
   * Optional payload used only for the `/learn` route. Lets a spec reach the
   * learning page (which is only linked from an enrolled overview) while the
   * learning page itself still renders the unenrolled state.
   */
  learnPageData?: {
    pageProps: Record<string, unknown>;
    __N_SSP: boolean;
  },
) {
  await page.route(
    (url) => {
      const path = url.pathname;
      return (
        path.includes("/_next/data/") &&
        path.includes("/shiksha/") &&
        path.endsWith(".json")
      );
    },
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          learnPageData &&
            new URL(route.request().url()).pathname.endsWith("/learn.json")
            ? learnPageData
            : courseData,
        ),
      }),
  );
}

/**
 * Mock the `_next/data` endpoint for the learn route the way the server
 * resolves it: a valid `chapterId` renders that chapter, an unrecognised one
 * redirects to the canonical first-chapter URL, and a missing one falls back
 * to the first chapter.
 */
export async function mockCourseLearnSSR(
  page: Page,
  courseData: {
    pageProps: Record<string, unknown>;
    __N_SSP: boolean;
  } = enrolledCourse,
) {
  const chapters = (
    courseData.pageProps.course as {
      chapters: { _id: string; content: string }[];
    }
  ).chapters;
  const firstChapter = chapters[0];

  await page.route(
    (url) => {
      const path = url.pathname;
      return (
        path.includes("/_next/data/") &&
        path.includes("/shiksha/") &&
        path.endsWith(".json")
      );
    },
    (route) => {
      const url = new URL(route.request().url());
      const isLearnRoute = url.pathname.endsWith("/learn.json");
      const requestedChapterId = url.searchParams.get("chapterId");

      const respond = (body: unknown) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(body),
        });

      if (isLearnRoute && requestedChapterId) {
        const chapter = chapters.find((ch) => ch._id === requestedChapterId);

        if (!chapter) {
          // Mirrors how Next.js signals a `getServerSideProps` redirect on the
          // data route during client-side navigation.
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            headers: {
              "x-nextjs-redirect": `/shiksha/${COURSE_SLUG}/learn?chapterId=${firstChapter._id}`,
            },
            body: JSON.stringify({ pageProps: {}, __N_SSP: true }),
          });
        }

        return respond({
          ...courseData,
          pageProps: {
            ...courseData.pageProps,
            meta: chapter.content,
            currentChapterId: chapter._id,
          },
        });
      }

      return respond({
        ...courseData,
        pageProps: {
          ...courseData.pageProps,
          meta: firstChapter.content,
          currentChapterId: firstChapter._id,
        },
      });
    },
  );
}

/**
 * Mock the enrollment POST endpoint.
 */
export async function mockEnrollmentAPI(page: Page) {
  await page.route("**/api/proxy/user/shiksha/enroll", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        json: { status: true, message: "Enrolled successfully" },
      });
    }
    return route.continue();
  });
}

/**
 * Mock the chapter completion PATCH endpoint.
 */
export async function mockChapterCompletionAPI(page: Page) {
  await page.route("**/api/proxy/user/shiksha/course", (route) => {
    if (route.request().method() === "PATCH") {
      return route.fulfill({
        status: 200,
        json: { status: true, message: "Chapter updated" },
      });
    }
    return route.continue();
  });
}

/**
 * Mock the certificate generation POST endpoint.
 */
export async function mockCertificateAPI(page: Page) {
  await page.route("**/api/proxy/certificate", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: { _id: "cert-generated-456" },
        },
      });
    }
    return route.continue();
  });
}
