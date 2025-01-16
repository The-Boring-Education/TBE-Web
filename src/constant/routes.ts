import { GenerateSectionPathProps } from '@/interfaces';

const routes = {
  home: '/',
  // Shiksha
  shiksha: '/shiksha',
  shikshaExplore: '/shiksha/explore',
  allCourses: {
    logicBuildingForEveryone: '/shiksha/logic-building-for-everyone',
    basicsOfProgrammingWithJS: '/shiksha/basics-of-programming-with-js',
  },
  roadmaps: '/roadmaps',
  register: '/register',
  workshops: '/workshops',
  webinar: '/webinar',
  portfolio: '/portfolio',
  os: '/os',
  // Projects
  projects: '/projects',
  projectsExplore: '/projects/explore',
  allProjects: {
    pharmashiftI: '/projects/pharmasift-i',
    pharmashiftII: '/projects/pharmasift-ii',
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
  user: {
    courses: '/shiksha/my-courses',
    projects: '/projects/my-projects',
    sheets: '/interview-prep/my-sheets',
  },
  internals: {
    landing: {
      products: 'products',
      portfolio: 'portfolio',
      webinar: 'webinar',
    },
  },
  404: '/404',
  api: {
    base: '/api/v1',
    projects: '/projects',
    webinar: '/webinar',
    project: (project: string) => `/projects/${project}`,
    shiksha: '/shiksha',
    myCourses: '/user/shiksha',
    myProjects: '/user/projects',
    mySheets: '/user/interview-prep',
    interviewPrep: '/interview-prep',
    enrollCourse: '/user/shiksha/enroll',
    enrollProject: '/user/projects/enroll',
    enrollSheet: '/user/interview-prep/enroll',
    markCourseChapterAsCompleted: '/user/shiksha/course',
    markProjectChapterAsCompleted: '/user/projects/project',
    markSheetQuestionAsCompleted: '/user/interview-prep/sheet',
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
    webinarBySlug: (webinar: string) => `/webinar/${webinar}`,
    certificate: '/certificate',
    certificateById: (certificate: string) => `/certificate/${certificate}`,
  },
};

const generateSectionPath = ({
  basePath,
  sectionID,
}: GenerateSectionPathProps) => {
  return basePath + '#' + sectionID;
};

export { routes, generateSectionPath };
