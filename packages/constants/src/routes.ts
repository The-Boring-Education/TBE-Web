import type { GenerateSectionPathProps } from "@tbe/types";

const routes = {
  home: "/",
  login: "/login",
  onboarding: "/onboarding",
  learn: "/learn",
  // Topmate Sessions
  topmateSessions: "/topmate-sessions",
  // Shiksha
  shiksha: "/shiksha",
  shikshaExplore: "/shiksha/explore",
  allCourses: {
    logicBuildingForEveryone: "/shiksha/logic-building-for-everyone",
    basicsOfProgrammingWithJS: "/shiksha/basics-of-programming-with-js",
    zeroToOneFrontend: "/shiksha/zero-to-one-frontend-development",
    zeroToOneBackend: "/shiksha/zero-to-one-backend-development",
  },
  roadmaps: "/roadmaps",
  workshops: "/workshops",
  webinar: "/webinar",
  portfolio: "/portfolio",
  // Projects
  projects: "/projects",
  projectsExplore: "/projects/explore",
  allProjects: {
    pharmashiftI: "/projects/pharmasift-i",
  },
  // Interview Prep
  interviewPrep: "/interview-prep",
  interviewPrepExplore: "/interview-prep/explore",
  allInterviewSheets: {
    javascriptInterviewSheet: "/interview-prep/javascript-interview-questions",
    reactInterviewSheet: "/interview-prep/react-interview-questions",
    nodeInterviewSheet: "/interview-prep/node-interview-questions",
    dbInterviewSheet: "/interview-prep/db-interview-questions",
    pythonInterviewSheet: "/interview-prep/python-interview-questions",
    javaInterviewSheet: "/interview-prep/java-interview-questions",
    dsaInterviewSheet: "/interview-prep/dsa-interview-questions",
  },
  // PrepYatra
  prepYatra: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    pricing: "/pricing",
    journey: (username: string) => `/journey/${username}`,
    baseUrl: "https://prepyatra.theboringeducation.com",
  },
  // DSAYatra
  dsayatra: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    pricing: "/pricing",
    patternQuiz: "/pattern-quiz",
    /** Public shareable progress page */
    journey: (username: string) => `/journey/${encodeURIComponent(username)}`,
    baseUrl: "https://dsayatra.theboringeducation.com",
  },
  // Quizes
  quizes: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    pricing: "/pricing",
    baseUrl: "https://quiz.theboringeducation.com",
  },
  // TechYatra
  techyatra: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    pricing: "/pricing",
    baseUrl: "https://techyatra.theboringeducation.com",
  },
  // ResumeYatra
  resumeYatra: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    pricing: "/pricing",
    baseUrl: "https://resumeyatra.theboringeducation.com",
  },
  devRels: "https://devrel.theboringeducation.com/",

  certificate: "/certificate",
  contactUs: "/contact",
  refund: "/refund",
  termsAndConditions: "/terms-and-conditions",
  contribute: "/contribute",
  user: {
    profile: "/user/profile",
    dashboard: "/dashboard",
    courses: "/shiksha/my-courses",
    projects: "/projects/my-projects",
    sheets: "/interview-prep/my-sheets",
    playlists: "youfocus/my-playlist",
  },
  register: "/register",
  internals: {
    landing: {
      products: "products",
      portfolio: "portfolio",
      webinar: "webinar",
      upload: "upload",
      explore: "explore",
    },
  },
  // YouFocus
  youfocus: "/youfocus",
  youfocusAddPlaylist: "/youfocus/add",
  youfocusPlaylist: "/youfocus/playlist",
  explorePlaylist: "/youfocus/explore",
  explorePlaylistSkill: "/youfocus/explore/skill",
  youfocusPlaylistPageById: (playlistId: string) =>
    `/youfocus/playlist/${playlistId}`,
  // Cohort
  cohort: {
    bringYourIdea: "/cohort/bring-your-idea",
  },
  //oncampus
  oncampus: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    pricing: "/pricing",
    dsa: "/sheets",
    interviewPrep: "/dashboard/interview-prep",
    quizes: "/dashboard/interview-prep",
    aptitude: "/aptitude",
    patternQuiz: "/pattern-quiz",
  },
  unskilled: "/unskilled",
  /** Shareable, minimal payment entry (query: productType, productId, optional coupon, next) */
  checkout: "/checkout",
  paymentStatus: "/payment/status",
  404: "/404",
  api: {
    base: "",
    projects: "/projects",
    webinar: "/webinar",
    project: (project: string) => `/projects/${project}`,
    shiksha: "/shiksha",
    onboard: "/user/onboarding",
    user: "/user",
    myCourses: "/user/shiksha",
    myProjects: "/user/projects",
    mySheets: "/user/interview-prep",
    myPlaylists: "/user/playlists",
    interviewPrep: "/interview-prep",
    coreSubjects: "/interview-prep/core-subjects",
    dsaSheet: "/interview-prep/dsa-sheet",
    dsaSync: "/interview-prep/dsa-sheet/sync",
    dsaQuestionNote: "/interview-prep/dsa-sheet/question/note",
    studyGuide: (topicId: string) =>
      `/interview-prep/dsa-sheet/study-guide?topic=${topicId}`,
    enrollCourse: "/user/shiksha/enroll",
    enrollProject: "/user/projects/enroll",
    enrollSheet: "/user/interview-prep/enroll",
    markCourseChapterAsCompleted: "/user/shiksha/course",
    markProjectChapterAsCompleted: "/user/projects/project",
    markSheetQuestionAsCompleted: "/user/interview-prep/sheet",
    markAptitudeQuestionProgress: "/user/interview-prep/aptitude/progress",
    dsaYatraProgress: "/user/dsayatra/progress",
    oncampusPrefs: "/user/oncampus/preferences",
    submitUserFeedback: "/feedback",
    contentFeedback: "/content-feedback",
    createOrder: "/payment/create-order",
    checkStatus: "/payment/checkstatus",
    paymentQuote: "/payment/quote",
    paymentOrderStatus: "/payment/order-status",
    subscriptionPlans: "/subscription-plans",
    validateCoupon: "/coupon/validate",
    couponPricingBanners: "/coupon/pricing-banners",
    courseById: (course: string) => `/shiksha/${course}`,
    courseByIdWithUser: (course: string, userId?: string) => {
      let url = `/shiksha/${course}`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      return url;
    },
    courseBySlugWithUser: (slug: string, userId?: string) => {
      let url = `/shiksha?slug=${slug}`;
      if (userId) url += `&userId=${userId}`;
      return url;
    },
    sheetByIdWithUser: (slug: string, userId?: string, sheetId?: string) => {
      let url = `/interview-prep?slug=${slug}`;
      if (userId) url += `&userId=${userId}`;
      if (sheetId) url += `&sheetId=${sheetId}`;
      return url;
    },

    projectById: (project: string) => `/projects/${project}`,
    projectByIdWithUser: (project: string, userId?: string) => {
      let url = `/projects/${project}`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      return url;
    },
    projectBySlugWithUser: (slug: string, userId?: string) => {
      let url = `/projects?slug=${slug}`;
      if (userId) url += `&userId=${userId}`;
      return url;
    },
    gamification: "/gamification",
    webinarBySlug: (webinar: string) => `/webinar/${webinar}`,
    certificate: "/certificate",
    certificateById: (certificate: string) => `/certificate/${certificate}`,
    youfocusPlaylist: "/youfocus",
    youfocusExplore: "/youfocus/explore",
    youfocusUserPlaylistById: (playlistId: string, userId?: string) => {
      let url = `/youfocus/${playlistId}`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      return url;
    },
    playlistByQuery: (query: string) => `/youfocus/explore?q=${query}`,
    userDashboard: "/user/dashboard",
    notification: "/notification",
    unskilled: "/unskilled",
    unskilledEvaluation: "/api/v1/evaluate",
    unskilledEvaluationHealth: "/api/v1/evaluate/health",
    markSheetQuestionAsStarred: "/user/interview-prep/starred",
    leaderboard: "/leaderboard",
    personalization: "/user/personalization",
  },
};

const generateSectionPath = ({
  basePath,
  sectionID,
}: GenerateSectionPathProps) => `${basePath}#${sectionID}`;

/** Build a shareable checkout URL for any supported product line. */
const buildCheckoutUrl = (params: {
  productType: string;
  productId: string;
  coupon?: string;
  /** Relative path after successful payment (optional) */
  next?: string;
}): string => {
  const qs = new URLSearchParams({
    productType: params.productType,
    productId: params.productId,
  });
  if (params.coupon) qs.set("coupon", params.coupon);
  if (params.next) qs.set("next", params.next);
  return `${routes.checkout}?${qs.toString()}`;
};

export { buildCheckoutUrl, generateSectionPath, routes };
