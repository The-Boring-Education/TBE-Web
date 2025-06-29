import type { GetSEOMetaResponseType } from '@/interfaces';

import { INTERVIEW_PREP_SHEETS, products, TBP_PROJECTS } from '..';
import { routes } from '../routes';

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
    [`${routes.login}`]: {
      title: 'Login | The Boring Education',
      siteName: 'The Boring Education',
      description:
        'The Boring Education offers tech education for everyone with online courses, interview prep, open source projects, and webinars.',
      url: routes.login,
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
        ' Interview Preparation, Coding Sheet, React Interview Questions, Tech Interviews, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
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
    [`${routes.refund}`]: {
      title: 'Refund | The Boring Education',
      siteName: 'The Boring Education',
      description: 'Refund Policies for purchases made on The Boring Education',
      url: routes.refund,
      keywords:
        'Refund Policy, The Boring Education, Customer Service, Help Desk, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.termsAndConditions}`]: {
      title: 'Terms and Conditions | The Boring Education',
      siteName: 'The Boring Education',
      description:
        'Terms and Conditions Policies for purchases made on The Boring Education',
      url: routes.termsAndConditions,
      keywords:
        'Terms and Conditions Policy, The Boring Education, Customer Service, Help Desk, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
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
    [`${routes.user.dashboard}`]: {
      title: 'Dashboard | The Boring Education',
      siteName: 'User Dashboard at The Boring Education',
      description:
        'Access your courses, projects, and interview preparation sheets at The Boring Education.',
      url: routes.user.dashboard,
      keywords:
        'Dashboard, Online Learning, The Boring Education, User Dashboard, Learning Platform, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.user.profile}`]: {
      title: 'Your Profile | The Boring Education',
      siteName: 'Your Profile at The Boring Education',
      description:
        'Access your courses, projects, and interview preparation sheets at The Boring Education.',
      url: routes.user.profile,
      keywords:
        'Dashboard, Online Learning, The Boring Education, User Dashboard, Learning Platform, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
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
    [`${routes.youfocus}`]: {
      title: 'YouFocus | The Boring Education',
      siteName: 'Focus at The Boring Education',
      description: 'Focus on your study keeping distractions aside.',
      url: routes.youfocus,
      keywords:
        'Focus,concentration, The Boring Education, Online Learning, Programming, College Students, Working professional, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.youfocusAddPlaylist}`]: {
      title: 'Add Playlist | The Boring Education',
      siteName: 'Add Playlist at The Boring Education',
      description:
        'Add your YouTube playlist to YouFocus to enhance your study experience without distractions.',
      url: routes.youfocusAddPlaylist,
      keywords:
        'YouTube Playlist, Focus, Study, Productivity, The Boring Education, Online Learning, Distraction-Free Learning, Study Tools, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.cohort.bringYourIdea}`]: {
      title: 'Bring Your Idea | The Boring Education',
      siteName: 'Bring Your Idea at The Boring Education',
      description: 'Bring your idea to The Boring Education.',
      url: routes.cohort.bringYourIdea,
      keywords:
        'Bring Your Idea, Tech Idea, Cohort, The Boring Education, Online Learning, Programming, College Students, Working professional, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.youfocusPlaylist}`]: {
      title: 'YouFocus - Playlist | The Boring Education',
      siteName: 'YouFocus Playlist at The Boring Education',
      description:
        'Access and manage your YouTube playlist in YouFocus to enhance your study experience without distractions.',
      url: routes.youfocusPlaylist,
      keywords:
        'YouTube Playlist, Focus, Study, Productivity, The Boring Education, Online Learning, Distraction-Free Learning, Study Tools, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },

    [`${routes.user.playlists}`]: {
      title: 'My Playlist | The Boring Education',
      siteName: 'My Playlist at The Boring Education',
      description:
        'Access your playlists and continue learning at The Boring Education.',
      url: routes.user.playlists,
      keywords:
        'My Playlist, Hands-on Learning, The Boring Education, Personal Playlists, Learning Platform, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.explorePlaylist}`]: {
      title: 'Explore Playlists | YouFocus | The Boring Education',
      siteName: 'Explore Playlists at YouFocus',
      description:
        'Discover and explore various playlists to enhance your study experience without distractions.',
      url: routes.explorePlaylist,
      keywords:
        'Explore Playlists, Focus, Study, Productivity, The Boring Education, Online Learning, Distraction-Free Learning, Study Tools, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.explorePlaylistSkill}`]: {
      title: 'Explore Playlist | YouFocus | The Boring Education',
      siteName: 'Explore Playlist at YouFocus',
      description:
        'Discover and explore various playlists to enhance your study experience without distractions.',
      url: routes.explorePlaylistSkill,
      keywords:
        'Explore Playlists, Focus, Study, Productivity, The Boring Education, Online Learning, Distraction-Free Learning, Study Tools, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.unskilled}`]: {
      title: 'UnSkilled | The Boring Education',
      siteName: 'UnSkilled at The Boring Education',
      description:
        'UnSkilled is a platform to help Job Seekers find the Missing Skills. It provides insights into the most in-demand skills, job roles, and tech hubs.',
      url: routes.unskilled,
      keywords:
        'UnSkilled, Job Seekers, Missing Skills, In-demand Skills, Job Roles, Tech Hubs, The Boring Education, Online Learning, Programming, College Students, Working professional, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.onboarding}`]: {
      title: 'Onboarding | The Boring Education',
      siteName: 'Onboarding at The Boring Education',
      description:
        'Complete your onboarding process and start your learning journey with The Boring Education.',
      url: routes.onboarding,
      keywords:
        'Onboarding, Online Learning, The Boring Education, User Onboarding, Learning Platform, The Boring Education, College Students, Working Professionals, Career Development, Skill Enhancement, GitHub, Instagram, Twitter, LinkedIn',
      ...seoCommonMeta,
    },
    [`${routes.contribute}`]: {
      title: 'Open Source Contribution | The Boring Education',
      siteName: 'Contribute at The Boring Education',
      description:
        'Contribute to open source projects at The Boring Education. Collaborate, learn, and grow your skills by building real-world projects with our community.',
      url: routes.contribute,
      keywords:
        'Open Source, Contribute, GitHub, Programming Projects, The Boring Education, Real-world Projects, College Students, Working Professionals, Developer Community, Career Growth, Skill Enhancement',
      ...seoCommonMeta,
    },
    [`${routes.prepYatra}`]: {
      title:
        'PrepYatra - Complete Interview Preparation Platform | The Boring Education',
      siteName: 'PrepYatra at The Boring Education',
      description:
        'Master your interviews with PrepYatra. Get personalized questions, mock interviews, and expert guidance to land your dream job.',
      url: routes.prepYatra,
      keywords:
        'PrepYatra, Interview Preparation, Mock Interviews, Personalized Questions, Job Preparation, The Boring Education, Career Development, Skill Enhancement, Interview Tips, Job Search',
      ...seoCommonMeta,
    },
  };

  return meta[basePath];
};

export { getSEOMeta };
