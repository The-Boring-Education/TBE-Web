import { GenerateSectionPathProps } from '@/interfaces';

const routes = {
  home: '/',
  login: '/login',
  onboarding: '/onboarding',
  // Shiksha
  shiksha: '/shiksha',
  shikshaExplore: '/shiksha/explore',
  allCourses: {
    logicBuildingForEveryone: '/shiksha/logic-building-for-everyone',
    basicsOfProgrammingWithJS: '/shiksha/basics-of-programming-with-js',
    zeroToOneFrontend: '/shiksha/zero-to-one-frontend-development',
    zeroToOneBackend: '/shiksha/zero-to-one-backend-development',
  },
  roadmaps: '/roadmaps',
  workshops: '/workshops',
  webinar: '/webinar',
  portfolio: '/portfolio',
  // Projects
  projects: '/projects',
  projectsExplore: '/projects/explore',
  allProjects: {
    pharmashiftI: '/projects/pharmasift-i',
  },
  // Interview Prep
  interviewPrep: '/interview-prep',
  interviewPrepExplore: '/interview-prep/explore',
  allInterviewSheets: {
    javascriptInterviewSheet: '/interview-prep/javascript-interview-questions',
    reactInterviewSheet: '/interview-prep/react-interview-questions',
    nodeInterviewSheet: '/interview-prep/node-interview-questions',
    dbInterviewSheet: '/interview-prep/db-interview-questions',
  },
  certificate: '/certificate',
  contactUs: '/contact',
  refund:'/refund',
  user: {
    profile: '/user/profile',
    dashboard: '/user/dashboard',
    courses: '/shiksha/my-courses',
    projects: '/projects/my-projects',
    sheets: '/interview-prep/my-sheets',
    playlists: 'youfocus/my-playlist',
  },
  register: '/register',
  internals: {
    landing: {
      products: 'products',
      portfolio: 'portfolio',
      webinar: 'webinar',
      upload: 'upload',
      explore: 'explore',
    },
  },
  // YouFocus
  youfocus: '/youfocus',
  youfocusAddPlaylist: '/youfocus/add',
  youfocusPlaylist: '/youfocus/playlist',
  explorePlaylist: '/youfocus/explore',
  explorePlaylistSkill: '/youfocus/explore/skill',
  youfocusPlaylistPageById: (playlistId: string) =>
    `/youfocus/playlist/${playlistId}`,
  // Cohort
  cohort: {
    bringYourIdea: '/cohort/bring-your-idea',
  },
  unskilled: '/unskilled',
  404: '/404',
  api: {
    base: '/api/v1',
    projects: '/projects',
    webinar: '/webinar',
    project: (project: string) => `/projects/${project}`,
    shiksha: '/shiksha',
    onboard: '/user/onbording',
    user: '/user',
    myCourses: '/user/shiksha',
    myProjects: '/user/projects',
    mySheets: '/user/interview-prep',
    myPlaylists: 'user/plylists',
    interviewPrep: '/interview-prep',
    enrollCourse: '/user/shiksha/enroll',
    enrollProject: '/user/projects/enroll',
    enrollSheet: '/user/interview-prep/enroll',
    markCourseChapterAsCompleted: '/user/shiksha/course',
    markProjectChapterAsCompleted: '/user/projects/project',
    markSheetQuestionAsCompleted: '/user/interview-prep/sheet',
    submitUserFeedback: '/feedback',
    courseById: (course: string) => `/shiksha/${course}`,
    courseByIdWithUser: (course: string, userId?: string) => {
      let url = `/shiksha/${course}`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      return url;
    },
    sheetByIdWithUser: (sheet: string, userId?: string) => {
      let url = `/interview-prep/${sheet}`;
      if (userId) {
        url += `?userId=${userId}`;
      }
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
    gamification: '/gamification',
    webinarBySlug: (webinar: string) => `/webinar/${webinar}`,
    certificate: '/certificate',
    certificateById: (certificate: string) => `/certificate/${certificate}`,
    youfocusPlaylist: '/youfocus',
    youfocusExplore: '/youfocus/explore',
    youfocusUserPlaylistById: (playlistId: string, userId?: string) => {
      let url = `/youfocus/${playlistId}`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      return url;
    },
    playlistByQuery: (query: string) => `/youfocus/explore?q=${query}`,
    userDashboard: '/user/dashboard',
    notification: '/notification',
    unskilled: '/unskilled',
    unskilledEvaluation: '/unskilled/evaluation',
  },
};

const generateSectionPath = ({
  basePath,
  sectionID,
}: GenerateSectionPathProps) => {
  return basePath + '#' + sectionID;
};

export { routes, generateSectionPath };
