import { getSEOMeta, IN_DEV_PAGES, routes, seoCommonMeta } from '@/constant';
import type {
  BaseInterviewSheetResponseProps,
  BaseShikshaCourseResponseProps,
  ProjectPickedPageProps,
} from '@/interfaces';

import {
  checkUserCourseEnrollment,
  fetchAPIData,
  formatDate,
  getSelectedCourseChapterMeta,
  getSelectedProjectChapterMeta,
  getSelectedSheetQuestionMeta,
  getYoufocusSkillName,
  isProgramActive,
  isUserAuthenticated,
} from '.';

const getPreFetchProps = async ({ slug }: any) => {
  let baseSlug = routes.home;

  if (slug) {
    baseSlug = slug.split('?')[0];
  }

  const seoMeta = getSEOMeta(baseSlug);

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
  const { projectSlug, projectId, sectionId, chapterId } = query;

  let slug = routes.home;

  if (projectSlug) {
    slug = `/projects/${projectSlug}`;
  }

  const seoMeta = getSEOMeta(slug);

  if (projectId && seoMeta) {
    try {
      // Authenticate user
      const user = await isUserAuthenticated(req);

      // Fetch project data using the new route builder function
      const { status, data } = await fetchAPIData(
        routes.api.projectByIdWithUser(projectId, user?.id)
      );

      // If the project data is not found, redirect to
      if (!status) {
        return {
          redirect: {
            destination: routes.home,
          },
          props: { slug },
        };
      }

      const project: ProjectPickedPageProps = data;
      let { meta } = project;
      let currentChapterId = '';

      // If section and chapter IDs are provided, get specific chapter metadata
      if (sectionId && chapterId) {
        currentChapterId = chapterId;

        const selectedChapterMeta = getSelectedProjectChapterMeta(
          project,
          sectionId,
          chapterId
        );

        if (selectedChapterMeta) {
          meta = selectedChapterMeta;
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
      console.error('Error fetching project data:', error);
    }
  }

  // Redirect to  if projectId is missing or seoMeta is not set
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
      routes.api.youfocusUserPlaylistById(playlistId, user?.id)
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
  } catch (error) {
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
  const { courseSlug, courseId, chapterId } = query;

  let slug = routes.home;

  if (courseSlug) {
    slug = `/shiksha/${courseSlug}`;
  }

  if (courseId) {
    try {
      const user = await isUserAuthenticated(req);

      const { status, data } = await fetchAPIData(
        routes.api.courseByIdWithUser(courseId, user?.id)
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
        siteName: 'Shiksha The Boring Education',
        description,
        url: `${routes.shiksha}/${slug}`,
        keywords:
          'Shiksha online courses, advanced programming tutorials, free tech education, career development for professionals, skill enhancement programs, coding bootcamps, tech webinars, online learning for college students, GitHub projects, tech career growth, free certifications, free courses',
        ...seoCommonMeta,
      };

      let { meta } = course;
      let currentChapterId = '';

      if (chapterId) {
        currentChapterId = chapterId;

        const selectedChapterMeta = getSelectedCourseChapterMeta(
          course,
          chapterId
        );

        if (selectedChapterMeta) meta = selectedChapterMeta;
      }

    const isEnrolled = await checkUserCourseEnrollment(courseId, user?.id);
    course.isEnrolled = isEnrolled;

      return {
        props: {
          slug,
          seoMeta,
          course,
          meta,
          currentChapterId,
          isEnrolled,
        },
      };
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  }

  return {
    redirect: {
      destination: routes.home,
    },
    props: { slug },
  };
};

const getSheetPageProps = async (context: any) => {
  const { req, query } = context;
  const { sheetSlug, sheetId, questionId } = query;

  let slug = routes.home;

  if (sheetSlug) {
    slug = `/interview-prep/${sheetSlug}`;
  }

  const seoMeta = getSEOMeta(slug);

  if (sheetId && seoMeta) {
    try {
      const user = await isUserAuthenticated(req);

      // Fetch sheet data with user ID if available
      const { status, data } = await fetchAPIData(
        routes.api.sheetByIdWithUser(sheetId as string, user?.id)
      );

      // Redirect if the sheet data is not found
      if (!status) {
        return {
          redirect: {
            destination: routes.home,
          },
          props: { slug },
        };
      }

      const sheet: BaseInterviewSheetResponseProps = data;
      let { meta } = sheet;
      let currentQuestionId = '';

      // If a specific question is selected, get its metadata
      if (questionId) {
        currentQuestionId = questionId as string;

        const selectedQuestionMeta = getSelectedSheetQuestionMeta(
          sheet,
          currentQuestionId
        );

        if (selectedQuestionMeta) meta = selectedQuestionMeta;
      }

      return {
        props: {
          slug,
          seoMeta,
          sheet,
          meta,
          currentQuestionId,
        },
      };
    } catch (error) {
      console.error('Error fetching sheet data:', error);
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

  const { status, data: jobData } = await fetchAPIData(routes.api.unskilled);

  if (!status) {
    return {
      redirect: {
        destination: routes.home,
      },
    };
  }

  const isDev = IN_DEV_PAGES.some((page) => page === slug);

  return {
    props: {
      seoMeta,
      jobData,
      isDev,
    },
  };
};

const getCertificatePageProps = async ({ query: { certificateId } }: any) => {
  const { status, data: certificate } = await fetchAPIData(
    routes.api.certificateById(certificateId)
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
    siteName: 'The Boring Education',
    description: 'Certificate',
    url: `${routes.certificate}/${certificateId}`,
    keywords:
      'Certificate, The Boring Education, Tech Education, Online Learning',
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
    routes.api.webinarBySlug(slug)
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
    recordedVideoUrl = '',
  } = webinar;

  const { date, time } = formatDate({
    dateAndTime,
  });

  const isWebinarStarted = isProgramActive(dateAndTime);

  const seoMeta = {
    title: `${name} | The Boring Webinars`,
    siteName: 'The Boring Education',
    description,
    url: `${routes.webinar}/${slug}`,
    keywords:
      'Tech Education, Online Learning, Programming, Free Courses, Open Source, Webinars, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
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
        'https://wallpapers.com/images/hd/coding-background-9izlympnd0ovmpli.jpg',
    },
  };
};

const getSkillPlaylistPageProps = async (context: any) => {
  const { query } = context;
  const { q } = query;
  const skillQuery = typeof q === 'string' ? q : '';

  const { status, data: playlists } = await fetchAPIData(
    routes.api.playlistByQuery(skillQuery)
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
      skillQuery
    )} Playlists | YouFocus| The Boring Education`,
    siteName: 'YouFocus The Boring Education',
    description: `Explore ${skillQuery} playlists and start learning`,
    url: `${routes.explorePlaylistSkill}?q=${skillQuery}`,
    keywords:
      'Tech Education, Online Learning, Programming, Free Courses, Open Source, Webinars, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
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
