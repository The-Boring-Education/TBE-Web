import { GenerateSectionPathProps } from '@/interfaces';

const routes = {
  home: '/',
  roadmaps: '/roadmaps',
  projects: '/projects',
  register: '/register',
  projectsExplore: '/projects/explore',
  allProjects: {
    pharmashiftI: '/projects/pharmasift-i',
    pharmashiftII: '/projects/pharmasift-ii',
  },
  shiksha: '/shiksha',
  shikshaExplore: '/shiksha/explore',
  allCourses: {
    logicBuildingForEveryone: '/shiksha/logic-building-for-everyone',
    basicsOfProgrammingWithJS: '/shiksha/basics-of-programming-with-js',
  },
  interviewPrep: '/interview-prep',
  interviewPrepExplore: '/interview-prep/explore',
  workshops: '/workshops',
  os: '/os',
  contactUs: '/contact',
  internals: {
    landing: {
      products: 'products',
    },
  },
  404: '/404',
  api: {
    base: '/api/v1',
    projects: '/projects',
    project: (project: string) => `/projects/${project}`,
    shiksha: '/shiksha',
    myCourses: '/user/shiksha',
    interviewPrep: '/interview-prep',
    enrollCourse: '/user/shiksha/enroll',
    markCourseChapterAsCompleted: '/user/shiksha/course',
    courseById: (course: string) => `/shiksha/${course}`,
    courseByIdWithUser: (course: string, userId?: string) => {
      let url = `/shiksha/${course}`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      return url;
    },
  },
};

const generateSectionPath = ({
  basePath,
  sectionID,
}: GenerateSectionPathProps) => {
  return basePath + '#' + sectionID;
};

export { routes, generateSectionPath };
