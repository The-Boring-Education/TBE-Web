import { GetSEOMetaResponseType } from '@/interfaces';
import { routes } from '../routes';
import {
  SHIKSHA_COURSES,
  TBP_PROJECTS,
  products,
  INTERVIEW_PREP_SHEETS,
} from '..';

export const seoCommonMeta = {
  type: 'website',
  robots: 'follow, index',
  image: 'https://theboringeducation.com/images/large-og.png',
  author: 'The Boring Education Team',
  publisher: 'The Boring Education',
  linkedIn: 'https://www.linkedin.com/company/theboringeducation',
  instagram: 'https://www.instagram.com/theboringeducation',
  github: 'https://github.com/The-Boring-Education',
};

const getSEOMeta = (basePath: any): GetSEOMetaResponseType => {
  const meta = {
    [`${routes.home}`]: {
      title: 'The Boring Education | Tech Education for Everyone',
      siteName: 'The Boring Education',
      description:
        'The Boring Education offers tech education for everyone with online courses, interview prep, open source projects, and webinars.',
      url: routes.home,
      keywords:
        'Tech Education, Online Learning, Programming, Free Courses, Open Source, Webinars, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.roadmaps}`]: {
      title: `${products.roadmaps.label} | The Boring Education`,
      siteName: products.roadmaps.label,
      description: `${products.roadmaps.description} - Find the best learning paths and programming guides at The Boring Education.`,
      url: products.roadmaps.slug,
      keywords:
        'Roadmaps, Learning Paths, Programming Guides, Career Paths, Developer Roadmaps, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.projects}`]: {
      title: `${products.projects.label} | The Boring Education`,
      siteName: products.projects.label,
      description: `${products.projects.description} - Engage in hands-on learning with real-world programming projects.`,
      url: products.projects.slug,
      keywords:
        'Projects, Hands-on Learning, Programming Projects, Real-world Projects, Coding Projects, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.projectsExplore}`]: {
      title: `${products.projects.label} | The Boring Education`,
      siteName: products.projects.label,
      description: `${products.projects.description} - Explore various programming projects and enhance your skills.`,
      url: products.projects.slug,
      keywords:
        'Projects, Hands-on Learning, Programming Projects, Real-world Projects, Coding Projects, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.allProjects.pharmashiftI}`]: {
      title: `${TBP_PROJECTS[0].title} | The Boring Education`,
      siteName: TBP_PROJECTS[0].title,
      description: `${TBP_PROJECTS[0].content} - Dive into PharmaShift Project I and learn through practical coding experience.`,
      url: routes.allProjects.pharmashiftI,
      keywords:
        'PharmaShift, Project I, Programming Projects, Healthcare Projects, Coding Projects, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.allProjects.pharmashiftII}`]: {
      title: `${TBP_PROJECTS[1].title} | The Boring Education`,
      siteName: TBP_PROJECTS[1].title,
      description: `${TBP_PROJECTS[1].content} - Continue your journey with PharmaShift Project II and gain more practical experience.`,
      url: routes.allProjects.pharmashiftII,
      keywords:
        'PharmaShift, Project II, Programming Projects, Healthcare Projects, Coding Projects, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.shiksha}`]: {
      title: `${products.shiksha.label} | The Boring Education`,
      siteName: products.shiksha.label,
      description: `${products.shiksha.description} - Access a variety of online courses and enhance your tech skills.`,
      url: products.shiksha.slug,
      keywords:
        'Shiksha, online tech courses, programming tutorials for beginners, free tech education, career development for professionals, skill enhancement programs, coding bootcamps, tech webinars, online learning for college students, GitHub projects, tech career growth, free certifications, free courses',
      ...seoCommonMeta,
    },
    [`${routes.interviewPrep}`]: {
      title: `${products.interviewPrep.label} | The Boring Education`,
      siteName: products.interviewPrep.label,
      description: `${products.interviewPrep.description} - Prepare for your tech interviews with our comprehensive interview prep resources.`,
      url: products.interviewPrep.slug,
      keywords:
        'Interview Preparation, Coding Interviews, Tech Interviews, Interview Questions, Job Preparation, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.allCourses.logicBuildingForEveryone}`]: {
      title: `${SHIKSHA_COURSES[0].title} | The Boring Education`,
      siteName: SHIKSHA_COURSES[0].title,
      description: `${SHIKSHA_COURSES[0].content} - Learn the basics of programming and logic building with this beginner-friendly course.`,
      url: routes.allCourses.logicBuildingForEveryone,
      keywords:
        'Logic Building, Programming Basics, Online Course, Beginner Programming, Coding Fundamentals, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.allCourses.basicsOfProgrammingWithJS}`]: {
      title: `${SHIKSHA_COURSES[1].title} | The Boring Education`,
      siteName: SHIKSHA_COURSES[1].title,
      description: `${SHIKSHA_COURSES[1].content} - Master the basics of programming with JavaScript in this comprehensive course.`,
      url: routes.allCourses.basicsOfProgrammingWithJS,
      keywords:
        'JavaScript, Programming Basics, Online Course, JavaScript Fundamentals, Coding for Beginners, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.allInterviewSheets.javascriptInterviewSheet}`]: {
      title: `${INTERVIEW_PREP_SHEETS[0].title} | The Boring Education`,
      siteName: INTERVIEW_PREP_SHEETS[0].title,
      description: `${INTERVIEW_PREP_SHEETS[0].content} - Prepare for JavaScript interviews with our detailed interview sheet.`,
      url: routes.allInterviewSheets.javascriptInterviewSheet,
      keywords:
        'JavaScript, Interview Preparation, Coding Sheet, JavaScript Interview Questions, Tech Interviews, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.allInterviewSheets.reactInterviewSheet}`]: {
      title: `${INTERVIEW_PREP_SHEETS[1].title} | The Boring Education`,
      siteName: INTERVIEW_PREP_SHEETS[1].title,
      description: `${INTERVIEW_PREP_SHEETS[1].content} - Get ready for React interviews with our comprehensive interview sheet.`,
      url: routes.allInterviewSheets.reactInterviewSheet,
      keywords:
        'React, Interview Preparation, Coding Sheet, React Interview Questions, Tech Interviews, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.allInterviewSheets.nodeInterviewSheet}`]: {
      title: `${INTERVIEW_PREP_SHEETS[2].title} | The Boring Education`,
      siteName: INTERVIEW_PREP_SHEETS[2].title,
      description: `${INTERVIEW_PREP_SHEETS[2].content} - Ace your Node.js interviews with our detailed interview sheet.`,
      url: routes.allInterviewSheets.nodeInterviewSheet,
      keywords:
        'Node.js, Interview Preparation, Coding Sheet, Node.js Interview Questions, Tech Interviews, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.allInterviewSheets.dbInterviewSheet}`]: {
      title: `${INTERVIEW_PREP_SHEETS[3].title} | The Boring Education`,
      siteName: INTERVIEW_PREP_SHEETS[3].title,
      description: `${INTERVIEW_PREP_SHEETS[3].content} - Prepare for database interviews with our comprehensive interview sheet.`,
      url: routes.allInterviewSheets.dbInterviewSheet,
      keywords:
        'Database, Interview Preparation, Coding Sheet, Database Interview Questions, Tech Interviews, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.contactUs}`]: {
      title: 'Contact | The Boring Education',
      siteName: 'The Boring Education',
      description:
        'Get in touch with The Boring Education for support and inquiries.',
      url: routes.contactUs,
      keywords:
        'Contact, Support, The Boring Education, Customer Service, Help Desk, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes[404]}`]: {
      title: 'Lost in Boring Space | The Boring Education',
      siteName: 'Lost in Boring Space',
      description:
        'The page you are looking for cannot be found. Explore more tech education resources at The Boring Education.',
      url: routes[404],
      keywords:
        '404, Page Not Found, The Boring Education, Error Page, Lost Page, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.register}`]: {
      title: 'Register | The Boring Education',
      siteName: 'Register at The Boring Education',
      description:
        'Create an account and join The Boring Education to access a variety of tech education resources.',
      url: routes.register,
      keywords:
        'Register, Sign Up, The Boring Education, Create Account, Join Now, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.shikshaExplore}`]: {
      title: 'Explore Courses | The Boring Education',
      siteName: 'Explore Courses at The Boring Education',
      description:
        'Browse and explore a wide range of tech courses at The Boring Education.',
      url: routes.shikshaExplore,
      keywords:
        'Explore Courses, Online Learning, The Boring Education, Course Catalog, Learning Platform, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.interviewPrepExplore}`]: {
      title: 'Explore Sheets | The Boring Education',
      siteName: 'Explore Sheets at The Boring Education',
      description:
        'Discover and explore various interview preparation sheets at The Boring Education.',
      url: routes.interviewPrepExplore,
      keywords:
        'Explore Sheets, Interview Preparation, The Boring Education, Coding Sheets, Job Preparation, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.portfolio}`]: {
      title: 'The Boring Portfolio | The Boring Education',
      siteName: 'Explore Portfolio Templates at The Boring Education',
      description:
        'Find and use portfolio templates to showcase your projects and skills at The Boring Education.',
      url: routes.portfolio,
      keywords:
        'Portfolio Templates, Online Learning, The Boring Education, Developer Portfolio, Portfolio Examples, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    // Implement User Shiksha Route
    [`${routes.user.courses}`]: {
      title: 'My Courses | The Boring Education',
      siteName: 'My Courses at The Boring Education',
      description:
        'Access your enrolled courses and start learning at The Boring Education.',
      url: routes.user.courses,
      keywords:
        'My Courses, Online Learning, The Boring Education, Enrolled Courses, Learning Platform, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    // Implement User Projects Route
    [`${routes.user.projects}`]: {
      title: 'My Projects | The Boring Education',
      siteName: 'My Projects at The Boring Education',
      description:
        'Access your projects and continue learning at The Boring Education.',
      url: routes.user.projects,
      keywords:
        'My Projects, Hands-on Learning, The Boring Education, Personal Projects, Learning Platform, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    // Implement User Interview Prep Route
    [`${routes.user.sheets}`]: {
      title: 'My Sheets | The Boring Education',
      siteName: 'My Sheets at The Boring Education',
      description:
        'Access your interview preparation sheets and prepare for tech interviews at The Boring Education.',
      url: routes.user.sheets,
      keywords:
        'My Sheets, Interview Preparation, The Boring Education, Personal Sheets, Job Preparation, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    // Implement Webinar Route
    [`${routes.webinar}`]: {
      title: 'Webinars | The Boring Education',
      siteName: 'Webinars at The Boring Education',
      description:
        'Join our live workshops and learn trending tech skills with The Boring Education.',
      url: routes.webinar,
      keywords:
        'Webinars, Live Workshops, The Boring Education, Online Learning, Programming, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
  };

  return meta[basePath];
};

export { getSEOMeta };
