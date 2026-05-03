import {
  type AppIdentifier,
  envConfig,
  getSEOMeta,
  IN_DEV_PAGES,
  routes,
  seoCommonMeta,
} from "@tbe/constants";
import type {
  BaseInterviewSheetResponseProps,
  BaseShikshaCourseResponseProps,
  ProjectPickedPageProps,
} from "@tbe/interface";

import {
  fetchAPIData,
  formatDate,
  getSelectedProjectChapterMeta,
  getSelectedSheetQuestionMeta,
  getYoufocusSkillName,
  isProgramActive,
  isUserAuthenticated,
} from ".";

/**
 * Get pre-fetch props for Next.js pages with SEO support
 *
 * @param slug - Route slug (e.g., routes.home, routes.login)
 * @param appId - App identifier (optional, defaults to 'platform')
 * @returns Next.js getStaticProps/getServerSideProps compatible object
 */
const getPreFetchProps = async ({
  slug,
  appId = "platform" as AppIdentifier,
}: {
  slug?: string;
  appId?: AppIdentifier;
}) => {
  let baseSlug = routes.home;

  if (slug) {
    baseSlug = slug.split("?")[0] || routes.home;
  }

  const seoMeta = getSEOMeta(baseSlug, appId);

  const redirect = !seoMeta && {
    destination: routes.home,
  };

  return {
    props: { slug, seoMeta },
    redirect,
  };
};

const getProjectPageProps = async (context: any) => {
  const { req, query } = context;
  const { projectSlug, sectionId, chapterId } = query;

  let slug = routes.home;

  if (projectSlug) {
    slug = `/projects/${projectSlug}`;
  }

  if (projectSlug) {
    try {
      const user = await isUserAuthenticated(req);

      const { status, data } = await fetchAPIData(
        routes.api.projectBySlugWithUser(projectSlug, user?.id),
      );

      // If the project data is not found, return the message
      if (!status) {
        return {
          redirect: {
            destination: routes.home,
          },
          props: { slug },
        };
      }

      const project: ProjectPickedPageProps = data;

      const seoMeta = getSEOMeta(slug);

      // Determine which chapter to show
      let meta = project.meta || "";
      let currentChapterId = "";

      // If section and chapter IDs are provided in URL, use those
      if (sectionId && chapterId) {
        currentChapterId = chapterId;

        const selectedChapterMeta = getSelectedProjectChapterMeta(
          project,
          sectionId,
          chapterId,
        );

        if (selectedChapterMeta) {
          meta = selectedChapterMeta;
        }
      } else {
        // No specific chapter requested - find the first incomplete chapter or first chapter
        const allChapters = project.sections.flatMap(
          (section) => section.chapters,
        );
        const firstIncompleteChapter = allChapters.find(
          (chapter) => !chapter.isCompleted,
        );

        if (firstIncompleteChapter) {
          // Show first incomplete chapter
          currentChapterId = firstIncompleteChapter.chapterId.toString();
          meta = firstIncompleteChapter.content;
        } else if (allChapters.length > 0) {
          // All chapters completed, show first chapter
          const firstChapter = allChapters[0];
          if (firstChapter) {
            currentChapterId = firstChapter.chapterId.toString();
            meta = firstChapter.content;
          }
        }
      }

      return {
        props: {
          slug,
          seoMeta,
          project,
          meta,
          currentChapterId,
        },
      };
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  }

  return {
    redirect: {
      destination: routes.home,
    },
    props: { slug },
  };
};

const getPlaylistPageProps = async (context: any) => {
  const { req, query } = context;
  const { playlistId } = query;
  const user = await isUserAuthenticated(req);

  let slug = routes.home;

  if (playlistId) {
    slug = routes.youfocusPlaylist;
  }

  const seoMeta = getSEOMeta(slug);

  if (!playlistId || !seoMeta) {
    return {
      redirect: {
        destination: routes.home,
        permanent: false,
      },
      props: { slug },
    };
  }

  try {
    const { status, data } = await fetchAPIData(
      routes.api.youfocusUserPlaylistById(playlistId, user?.id),
    );

    if (!status || !data) {
      return {
        redirect: {
          destination: routes.home,
          permanent: false,
        },
      };
    }
    return {
      props: {
        slug,
        seoMeta,
        playlist: data,
      },
    };
  } catch {
    return {
      redirect: {
        destination: routes.home,
        permanent: false,
      },
      props: { slug },
    };
  }
};

const getCoursePageProps = async (context: any) => {
  const { req, query } = context;
  const { courseSlug } = query;

  let slug = routes.home;

  if (courseSlug) {
    slug = `/shiksha/${courseSlug}`;
  }

  if (courseSlug) {
    try {
      const user = await isUserAuthenticated(req);

      const { status, data } = await fetchAPIData(
        routes.api.courseBySlugWithUser(courseSlug, user?.id),
      );

      // If the course data is not found, return the message
      if (!status) {
        return {
          redirect: {
            destination: routes.home,
          },
          props: { slug },
        };
      }

      const course: BaseShikshaCourseResponseProps = data;

      const { name, description, liveOn } = course;

      const isCourseLive = isProgramActive(liveOn as Date);

      // If Course not LIVE, redirect to home
      if (!isCourseLive) {
        return {
          redirect: {
            destination: routes.home,
          },
        };
      }

      const seoMeta = {
        title: `${name} | Shiksha | The Boring Education`,
        siteName: "Shiksha The Boring Education",
        description,
        url: `${routes.shiksha}/${courseSlug}`,
        keywords:
          "Shiksha online courses, advanced programming tutorials, free tech education, career development for professionals, skill enhancement programs, coding bootcamps, tech webinars, online learning for college students, GitHub projects, tech career growth, free certifications, free courses",
        ...seoCommonMeta,
      };

      // Always show the first chapter by default
      const firstChapter = course.chapters?.[0];
      let meta = course.meta || "";
      let currentChapterId = "";

      if (firstChapter) {
        currentChapterId = firstChapter._id.toString();
        meta = firstChapter.content;
      }

      return {
        props: {
          slug,
          seoMeta,
          course,
          meta,
          currentChapterId,
        },
      };
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  }

  return {
    redirect: {
      destination: routes.home,
    },
    props: { slug },
  };
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSheetPageProps = async (context: any) => {
  const { req, query } = context;
  const { sheetSlug: rawSheetSlug, topic, question: questionParams } = query;
  const sheetSlug = (rawSheetSlug || topic) as string;
  const urlQuestionSlug = Array.isArray(questionParams)
    ? questionParams[0]
    : questionParams;

  let slug = routes.home;

  if (sheetSlug) {
    slug = `/interview-prep/${sheetSlug}`;
  }

  const seoMeta = getSEOMeta(slug) ?? getSEOMeta(routes.interviewPrep);

  if (sheetSlug && seoMeta) {
    try {
      const user = await isUserAuthenticated(req);

      const { status, data } = await fetchAPIData(
        routes.api.sheetByIdWithUser(sheetSlug as string, user?.id),
      );

      if (!status) {
        return {
          redirect: {
            destination: routes.home,
          },
          props: { slug },
        };
      }

      const sheet: BaseInterviewSheetResponseProps = data;

      let meta = sheet.meta ?? "";
      let currentQuestionId = "";

      const firstQuestion = sheet.questions?.[0];

      // Resolve currentQuestionId based on URL slug or default to first question
      if (urlQuestionSlug) {
        const found = sheet.questions?.find(
          (q) => slugify(q.title) === urlQuestionSlug,
        );
        if (found) {
          currentQuestionId = found._id.toString();
        } else if (firstQuestion && firstQuestion._id) {
          currentQuestionId = firstQuestion._id.toString();
        }
      } else if (firstQuestion && firstQuestion._id) {
        currentQuestionId = firstQuestion._id.toString();
      }

      if (currentQuestionId) {
        const selectedQuestionMeta = getSelectedSheetQuestionMeta(
          sheet,
          currentQuestionId,
        );
        if (selectedQuestionMeta) meta = selectedQuestionMeta;
      }

      return {
        props: {
          slug,
          seoMeta,
          sheet,
          meta: meta ?? "",
          currentQuestionId,
          isEnrolled: sheet.isEnrolled ?? null,
        },
      };
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      // Continue to return redirect even on error
    }
  }

  return {
    redirect: {
      destination: routes.home,
    },
    props: { slug },
  };
};

const getWebinarLandingPageProps = async ({ resolvedUrl }: any) => {
  let slug = routes.home;

  if (resolvedUrl) {
    slug = resolvedUrl;
  }

  const seoMeta = getSEOMeta(slug);

  const { status, data: webinars } = await fetchAPIData(routes.api.webinar);

  if (!status) {
    return {
      redirect: {
        destination: routes.home,
      },
    };
  }

  return {
    props: {
      seoMeta,
      webinars,
    },
  };
};

const getUnskilledLandingPageProps = async ({ resolvedUrl }: any) => {
  let slug = routes.home;

  if (resolvedUrl) {
    slug = resolvedUrl;
  }

  const seoMeta = getSEOMeta(slug);
  const isDev = IN_DEV_PAGES.some((page) => page === slug);

  // Fetch graph data directly from Unskilled Platform API
  // Skip API call during build if URL is not available
  if (!envConfig.UNSKILLED_API_URL) {
    return {
      props: {
        seoMeta,
        jobData: null,
        isDev,
      },
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${envConfig.UNSKILLED_API_URL}/graph`, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const apiResponse = await response.json();
    const jobData = apiResponse.data || null;

    return {
      props: {
        seoMeta,
        jobData,
        isDev,
      },
    };
  } catch (error) {
    // Silently fail during build, log in development
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Could not fetch Unskilled data (API may not be running):",
        error instanceof Error ? error.message : error,
      );
    }

    return {
      props: {
        seoMeta,
        jobData: null,
        isDev,
      },
    };
  }
};
const getCertificatePageProps = async ({ query: { certificateId } }: any) => {
  const { status, data: certificate } = await fetchAPIData(
    routes.api.certificateById(certificateId),
  );

  if (!status) {
    return {
      redirect: {
        destination: routes.home,
      },
    };
  }

  const seoMeta = {
    title: `${certificate.programName} | Certificate | The Boring Education`,
    siteName: "The Boring Education",
    description: "Certificate",
    url: `${routes.certificate}/${certificateId}`,
    keywords:
      "Certificate, The Boring Education, Tech Education, Online Learning",
    ...seoCommonMeta,
  };

  return {
    props: {
      seoMeta,
      certificate,
    },
  };
};

const getWebinarPageProps = async (context: any) => {
  const { query } = context;
  const { webinarSlug: slug } = query;

  const { status, data: webinar } = await fetchAPIData(
    routes.api.webinarBySlug(slug),
  );

  if (!status) {
    return {
      redirect: {
        destination: routes.home,
      },
    };
  }

  const {
    _id,
    name,
    description,
    isFree,
    whatYoullLearn,
    about,
    dateAndTime,
    learnings,
    registrationUrl,
    host,
    recordedVideoUrl = "",
  } = webinar;

  const { date, time } = formatDate({
    dateAndTime,
  });

  const isWebinarStarted = isProgramActive(dateAndTime);

  const seoMeta = {
    title: `${name} | The Boring Webinars`,
    siteName: "The Boring Education",
    description,
    url: `${routes.webinar}/${slug}`,
    keywords:
      "Tech Education, Online Learning, Programming, Free Courses, Open Source, Webinars, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn",
    ...seoCommonMeta,
  };

  return {
    props: {
      seoMeta,
      webinarId: _id,
      name,
      slug,
      description,
      whatYoullLearn,
      learnings,
      isFree,
      about,
      host,
      date,
      time,
      isWebinarStarted,
      registrationUrl,
      recordedVideoUrl,
      bannerImageUrl:
        "https://wallpapers.com/images/hd/coding-background-9izlympnd0ovmpli.jpg",
    },
  };
};

const getSkillPlaylistPageProps = async (context: any) => {
  const { query } = context;
  const { q } = query;
  const skillQuery = typeof q === "string" ? q : "";

  const { status, data: playlists } = await fetchAPIData(
    routes.api.playlistByQuery(skillQuery),
  );

  if (!status) {
    return {
      redirect: {
        destination: routes.home,
      },
    };
  }

  const seoMeta = {
    title: `${getYoufocusSkillName(
      skillQuery,
    )} Playlists | YouFocus| The Boring Education`,
    siteName: "YouFocus The Boring Education",
    description: `Explore ${skillQuery} playlists and start learning`,
    url: `${routes.explorePlaylistSkill}?q=${skillQuery}`,
    keywords:
      "Tech Education, Online Learning, Programming, Free Courses, Open Source, Webinars, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn",
    ...seoCommonMeta,
  };

  return {
    props: {
      seoMeta,
      playlists,
      skillQuery,
    },
  };
};

export {
  getCertificatePageProps,
  getCoursePageProps,
  getPlaylistPageProps,
  getPreFetchProps,
  getProjectPageProps,
  getSheetPageProps,
  getSkillPlaylistPageProps,
  getUnskilledLandingPageProps,
  getWebinarLandingPageProps,
  getWebinarPageProps,
};
