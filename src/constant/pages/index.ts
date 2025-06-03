import {
  TestimonialCardProps,
  PrimaryCardProps,
  TopNavbarContainerProps,
  PrimaryCardWithCTAProps,
  CohortRoadmapProps,
  CohortUserCategoryProps,
} from '@/interfaces';
import { cohorts, LINKS, products, STATIC_FILE_PATH } from '../global';
import { v4 } from 'uuid';
import { routes } from '..';

const TOP_NAVIGATION: TopNavbarContainerProps = {
  cohorts: [
    {
      id: v4(),
      name: cohorts.bringYourIdea.label,
      description: cohorts.bringYourIdea.description,
      href: cohorts.bringYourIdea.slug,
    },
  ],
  tools: [
    {
      id: v4(),
      name: products.unskilled.label,
      description: products.unskilled.description,
      href: products.unskilled.slug,
    },
  ],
  products: [
    {
      id: v4(),
      name: products.shiksha.label,
      description: products.shiksha.description,
      href: products.shiksha.slug,
    },
    {
      id: v4(),
      name: products.interviewPrep.label,
      description: products.interviewPrep.description,
      href: products.interviewPrep.slug,
    },
    {
      id: v4(),
      name: products.youfocus.label,
      description: products.youfocus.description,
      href: products.youfocus.slug,
    },
    {
      id: v4(),
      name: products.webinar.label,
      description: products.webinar.description,
      href: products.webinar.slug,
    },
    {
      id: v4(),
      name: products.portfolio.label,
      description: products.portfolio.description,
      href: products.portfolio.slug,
    },
    {
      id: v4(),
      name: products.projects.label,
      description: products.projects.description,
      href: products.projects.slug,
    },
  ],
  links: [
    {
      id: v4(),
      name: 'Tech Mentorship',
      description: 'Get Book Tech Consultation',
      href: LINKS.bookTechConsultation,
      target: '_blank',
    },
    {
      id: v4(),
      name: 'Follow us on Instagram',
      description: 'Follow us on Instagram',
      href: LINKS.followUsOnInstagram,
      target: '_blank',
    },
    {
      id: v4(),
      name: 'Join Our Community',
      description: 'Join our WhatsApp Community',
      href: LINKS.whatsappCommunity,
      target: '_blank',
    },
  ],
  user: [
    {
      id: v4(),
      name: 'Dashboard',
      href: routes.user.dashboard,
    },
  ],
};

const PRODUCTS: PrimaryCardWithCTAProps[] = [
  {
    id: 'shiksha',
    image: `${STATIC_FILE_PATH.svg}/shiksha.svg`,
    imageAltText: products.shiksha.label,
    title: products.shiksha.label,
    content: products.shiksha.description,
    href: products.shiksha.slug,
    active: true,
    ctaText: 'Explore Free Courses',
  },
  {
    id: 'interview Prep',
    image: `${STATIC_FILE_PATH.svg}/interview.svg`,
    imageAltText: products.interviewPrep.label,
    title: products.interviewPrep.label,
    content: products.interviewPrep.description,
    href: products.interviewPrep.slug,
    active: true,
    ctaText: 'Free Interview Prep',
  },
  {
    id: 'webinar',
    image: `${STATIC_FILE_PATH.svg}/webinar-hero.svg`,
    imageAltText: products.webinar.label,
    title: products.webinar.label,
    content: products.webinar.description,
    href: routes.webinar,
    active: true,
    ctaText: 'Explore Webinars',
  },
  {
    id: 'youfocus',
    image: `${STATIC_FILE_PATH.svg}/youfocus.svg`,
    imageAltText: products.youfocus.label,
    title: products.youfocus.label,
    content: products.youfocus.description,
    href: routes.youfocus,
    active: true,
    ctaText: 'Explore YouFocus',
  },
  {
    id: 'unskilled',
    image: `${STATIC_FILE_PATH.svg}/unskilled.svg`,
    imageAltText: products.unskilled.label,
    title: products.unskilled.label,
    content: products.unskilled.description,
    href: routes.unskilled,
    active: true,
    ctaText: 'Explore Unskilled',
  },
  {
    id: 'portfolio',
    image: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-hero.svg`,
    imageAltText: products.portfolio.label,
    title: products.portfolio.label,
    content: products.portfolio.description,
    href: products.portfolio.slug,
    active: true,
    ctaText: 'Explore Portfolios',
  },
  {
    id: 'projects',
    image: `${STATIC_FILE_PATH.svg}/projects.svg`,
    imageAltText: products.projects.label,
    title: products.projects.label,
    content: products.projects.description,
    href: products.projects.slug,
    active: true,
    ctaText: 'Explore Free Projects',
  },
  {
    id: 'os',
    image: `${STATIC_FILE_PATH.svg}/open-source.svg`,
    imageAltText: products.os.label,
    title: products.os.label,
    content: products.os.description,
    href: products.os.slug,
    ctaText: 'Start Contributing',
    active: true,
  },
  {
    id: 'roadmaps',
    image: `${STATIC_FILE_PATH.svg}/roadmaps.svg`,
    imageAltText: products.roadmaps.label,
    title: products.roadmaps.label,
    content: products.roadmaps.description,
    href: products.roadmaps.slug,
    active: false,
    ctaText: 'Explore Roadmaps',
  },
];

const TBP_PROJECTS: PrimaryCardWithCTAProps[] = [
  {
    id: 'pharmasift-i',
    image: `${STATIC_FILE_PATH.svg}/tbp-pharmasift-1.svg`,
    imageAltText: 'The Boring Projects Pharmasift Part I',
    title: 'Pharmasift Part I',
    content:
      'Design and Develop A Medicine App that compares Med Prices with HTML & CSS.',
    href: routes.allProjects.pharmashiftI,
    active: true,
    ctaText: 'Start The Project',
  },
];

const INTERVIEW_PREP_SHEETS: PrimaryCardWithCTAProps[] = [
  {
    id: 'javascript-interview-sheet',
    image: `${STATIC_FILE_PATH.svg}/javascript-interview-questions.svg`,
    imageAltText: 'Prepare for JavaScript interviews with essential questions.',
    title: 'JavaScript Interview Sheet',
    content: 'Prepare for JavaScript interviews with essential questions.',
    href: routes.allInterviewSheets.javascriptInterviewSheet,
    active: true,
    ctaText: 'View Sheet',
  },
  {
    id: 'react-interview-sheet',
    image: `${STATIC_FILE_PATH.svg}/react-interview-questions.svg`,
    imageAltText: 'Prepare for React.js interviews with essential questions.',
    title: 'React.js Interview Sheet',
    content: 'Prepare for React.js interviews with essential questions.',
    href: routes.allInterviewSheets.reactInterviewSheet,
    active: true,
    ctaText: 'View Sheet',
  },
  {
    id: 'node-interview-sheet',
    image: `${STATIC_FILE_PATH.svg}/node-interview-questions.svg`,
    imageAltText: 'Prepare for Node.js interviews with essential questions.',
    title: 'Node.js Interview Sheet',
    content: 'Prepare for Node.js interviews with essential questions.',
    href: routes.allInterviewSheets.nodeInterviewSheet,
    active: true,
    ctaText: 'View Sheet',
  },
  {
    id: 'database-interview-sheet',
    image: `${STATIC_FILE_PATH.svg}/database-interview-questions.svg`,
    imageAltText: 'Prepare for Database interviews with essential questions.',
    title: 'Database Interview Sheet',
    content: 'Prepare for Database interviews with essential questions.',
    href: routes.allInterviewSheets.dbInterviewSheet,
    active: true,
    ctaText: 'View Sheet',
  },
];

const USP: PrimaryCardProps[] = [
  {
    id: v4(),
    title: `Personalised Roadmap`,
    content: `You can create your version of Roadmap and follow along. You don't need old hardcoded roadmaps.`,
    image: `${STATIC_FILE_PATH.svg}/mentorship.svg`,
    imageAltText: `mentorship`,
  },
  {
    id: v4(),
    title: `Build Real Life Projects`,
    content: `Stop Building Clone Projects. Build Something that People would Love to use and also Add into your Resume.`,
    image: `${STATIC_FILE_PATH.svg}/peer-to-peer-learning.svg`,
    imageAltText: `peer learning`,
  },
  // {
  //   id: v4(),
  //   title: `Learn Skills in Workshops`,
  //   content: `Learn skill over weekend that spreads your horizon in Tech Opportunities.`,
  //   image: `${STATIC_FILE_PATH.svg}/workshop.svg`,
  //   imageAltText: `weekend workshop`,
  // },
  {
    id: v4(),
    title: `Tech Mentorship Sessions`,
    content: `We Provide Tech Mentorship Sessions. Take Tech Guidance or Get Your Resume Reviewed.`,
    image: `${STATIC_FILE_PATH.svg}/peer-to-peer-learning.svg`,
    imageAltText: `doubt session`,
  },
];

const TBP_FEATURES: PrimaryCardProps[] = [
  {
    id: v4(),
    title: `Build Real Life Projects`,
    content: `How about Ditching Clone Projects and Build Something Meaningful.`,
    image: `${STATIC_FILE_PATH.svg}/mentorship.svg`,
    imageAltText: `mentorship`,
  },
  {
    id: v4(),
    title: `Free Code Review`,
    content: `Complete the Project and We'll review your code in 1:1 Sessions.`,
    image: `${STATIC_FILE_PATH.svg}/peer-to-peer-learning.svg`,
    imageAltText: `peer learning`,
  },
  {
    id: v4(),
    title: `Book Tech Mentorship`,
    content: `Discuss Every issue you're facing in 1:1 Mentorship Sessions.`,
    image: `${STATIC_FILE_PATH.svg}/workshop.svg`,
    imageAltText: `doubt session`,
  },
];

const TBIP_FEATURES: PrimaryCardProps[] = [
  {
    id: v4(),
    title: `Crisp. No Bullshit Content`,
    content: `Prep One Question at a Time. No Ads. No Course Selling. Only Prep.`,
    image: `${STATIC_FILE_PATH.svg}/mentorship.svg`,
    imageAltText: `mentorship`,
  },
  {
    id: v4(),
    title: `Prep. Apply. Prep More.`,
    content: `Apply What You Learn, Right Away. One Question At A Time.`,
    image: `${STATIC_FILE_PATH.svg}/peer-to-peer-learning.svg`,
    imageAltText: `peer learning`,
  },
  {
    id: v4(),
    title: `Ask Questions`,
    content: `Ask Interview Prep Questions in Community. We’re here to help.`,
    image: `${STATIC_FILE_PATH.svg}/workshop.svg`,
    imageAltText: `doubt session`,
  },
];

const TESTIMONIALS: TestimonialCardProps[] = [
  {
    id: v4(),
    title: `Manish Kumar`,
    content:
      'The Front-end cohort at The Boring Education transformed my web development skills. Their comprehensive curriculum and engaging teaching style made learning Front-end enjoyable and practical.',
    image: `${STATIC_FILE_PATH.svg}/manish-kumar-testimonial.png`,
    imageAltText: `profile image`,
    work: 'Software Engineer at Infosys',
  },
  {
    id: v4(),
    title: `Nancy Sharma`,
    content: `Thanks to The Boring Education's Front-end Cohort, my confidence in Web Dev skills has soared. Hands-on learning and supportive instructors made JavaScript accessible and rewarding.`,
    image: `${STATIC_FILE_PATH.svg}/nancy-sharma-testimonial.png`,
    imageAltText: `profile image`,
    work: 'Software Engineer at Cognizant',
  },
  {
    id: v4(),
    title: `Gautom Das`,
    content: `I highly recommend The Boring Education's Front-end cohort! Clear explanations, real-world examples, and challenging projects strengthened my understanding of Front-end Engineering.`,
    image: `${STATIC_FILE_PATH.svg}/gautom-das-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Passed Out',
  },
  {
    id: v4(),
    title: `Mohammad Sufyan`,
    content: `A fantastic tech learning platform for aspiring web developers, providing a pathway to explore and excel in this exciting career.`,
    image: `${STATIC_FILE_PATH.svg}/mohammad-sufyan-testimonial.png`,
    imageAltText: `profile image`,
    work: '12th completed',
  },
  {
    id: v4(),
    title: `Eshan Mishra`,
    content: `I'm extremely grateful to be part of The Boring Education as a learner, acquiring valuable web development skills.`,
    image: `${STATIC_FILE_PATH.svg}/eshan-mishra-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Student',
  },
  {
    id: v4(),
    title: `Kusum Sahani`,
    content: `I'm grateful to be part of The Boring Education as a learner, acquiring Front-end Engineering skills with exceptional faculty.`,
    image: `${STATIC_FILE_PATH.svg}/kusum-sahani-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Passed Out',
  },
  {
    id: v4(),
    title: `Nikhil Maurya`,
    content: `The Boring workshop made UI design easy and accessible. They explained complex concepts in a simple and understandable manner.`,
    image: `${STATIC_FILE_PATH.svg}/nikhil-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Student',
  },
  {
    id: v4(),
    title: `Satish Daraboina`,
    content: `The workshop at The Boring Education elevated my design skills. From Figma basics to creating and connecting screens, I gained hands-on experience to apply in real projects.`,
    image: `${STATIC_FILE_PATH.svg}/satish-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Student',
  },
];

const MY_PREV_EXPERIENCE = [
  {
    id: v4(),
    image: `${STATIC_FILE_PATH.svg}/pesto.svg`,
    imageAltText: `pesto`,
  },
  {
    id: v4(),
    image: `${STATIC_FILE_PATH.svg}/masai.svg`,
    imageAltText: `masai`,
  },
  {
    id: v4(),
    image: `${STATIC_FILE_PATH.svg}/cuemath.svg`,
    imageAltText: `cuemath`,
  },
  {
    id: v4(),
    image: `${STATIC_FILE_PATH.svg}/newton.svg`,
    imageAltText: `newton`,
  },
];

const YOUFOCUS_FEATURES: PrimaryCardProps[] = [
  {
    id: v4(),
    title: `Distraction-Free Learning Environment`,
    content: `Eliminate irrelevant videos and other distractions to stay fully focused on learning.`,
    image: `${STATIC_FILE_PATH.svg}/mentorship.svg`,
    imageAltText: `Less distraction`,
  },
  {
    id: v4(),
    title: `Integrated Timer`,
    content: `Optimize the learning process fro efficiency and retention using a timer.`,
    image: `${STATIC_FILE_PATH.svg}/peer-to-peer-learning.svg`,
    imageAltText: `Timer based`,
  },
  {
    id: v4(),
    title: `Community Recommended Playlists`,
    content: `Leverage user reviews and ratings to surface the best playlists for any skill.`,
    image: `${STATIC_FILE_PATH.svg}/workshop.svg`,
    imageAltText: `Recommendation`,
  },
];

const UNSKILLED_LANDING_GRAPH_TAB_PARAMS = [
  'Domains',
  'Skills',
  'Companies',
  'Locations',
];

const BYI_BEGINNER_ROADMAP: CohortRoadmapProps[] = [
  {
    week: 'Week 1',
    title: 'Introduction to Cohort + Idea Selection + Roadmap Creation',
    description:
      'Understand the cohort structure, select a project idea, and create a personalized roadmap.',
  },
  {
    week: 'Week 2',
    title: 'Landing Page Creation + Join Waitlist Launch',
    description:
      'Create a landing page and launch the waitlist for your project.',
  },
  {
    week: 'Week 3',
    title: 'Learning Basics + GitHub + Project Features Brainstorming',
    description:
      'Learning Skills, Setting up GitHub and brainstorming project ideas.',
  },
  {
    week: 'Week 4',
    title: 'Basic Impelmentation in Project',
    description: 'Implement basic features in your project.',
  },
  {
    week: 'Week 5-6',
    title: 'Learning Phase II + Project Implementation',
    description: 'Learn advanced skills and implement them in your project.',
  },
  {
    week: 'Week 7',
    title: 'Launching Landing Page + Marketing',
    description: 'Create a landing page and plan marketing strategies.',
  },
  {
    week: 'Week 8-10',
    title: 'Learning Phase III + Project Implementation',
    description: 'Learn advanced skills and implement them in your project.',
  },
  {
    week: 'Week 11',
    title: 'Final Touches + Beta Product Launch',
    description: 'Make final improvements and launch the beta version.',
  },
  {
    week: 'Week 12-14',
    title: 'Learning Phase IV + Project Implementation',
    description: 'Learn advanced skills and implement them in your project.',
  },
  {
    week: 'Week 15',
    title: 'Implementing AI in Project',
    description: 'Implement AI features in your project.',
  },
  {
    week: 'Week 16',
    title: 'Launch V1 + Demo',
    description: 'Launch the final version and demo it to the community.',
  },
  {
    week: 'Week 17',
    title: 'Interview Prep Roadmap Creation',
    description: 'Create a roadmap for interview preparation.',
  },
  {
    week: 'Week 18-19',
    title: 'Mock Interview + Resume Building',
    description: 'Prepare for interviews and build your resume.',
  },
  {
    week: 'Week 20',
    title: 'Wrap Up + Feedback',
    description: 'Wrap up the cohort and provide feedback.',
  },
];

const BYI_INTERMEDIATE_ROADMAP: CohortRoadmapProps[] = [
  {
    week: 'Week 1',
    title: 'Introduction to Cohort + Idea Selection + Roadmap Creation',
    description:
      'Understand the cohort structure, select a project idea, and create a personalized roadmap.',
  },
  {
    week: 'Week 2',
    title: 'Landing Page Creation + Join Waitlist Launch',
    description:
      'Create a landing page and launch the waitlist for your project.',
  },
  {
    week: 'Week 3',
    title: 'Learning Phase I + GitHub + Project Features Brainstorming',
    description:
      'Learning Skills, Setting up GitHub and brainstorming project ideas.',
  },
  {
    week: 'Week 4',
    title: 'Launching Landing Page + Marketing',
    description: 'Create a landing page and plan marketing strategies.',
  },
  {
    week: 'Week 5-6',
    title: 'Learning Phase II + Project Implementation',
    description: 'Learn advanced skills and implement them in your project.',
  },
  {
    week: 'Week 7',
    title: 'Final Touches + Beta Product Launch',
    description: 'Make final improvements and launch the beta version.',
  },
  {
    week: 'Week 8-9',
    title: 'Learning Phase III + Project Final Touches',
    description: 'Learn advanced skills and implement them in your project.',
  },
  {
    week: 'Week 10',
    title: 'Launch V1 + Demo',
    description: 'Launch the final version and demo it to the community.',
  },
  {
    week: 'Week 11',
    title: 'Interview Prep Roadmap Creation',
    description: 'Create a roadmap for interview preparation.',
  },
  {
    week: 'Week 12-13',
    title: 'Mock Interview + Resume Building',
    description: 'Prepare for interviews and build your resume.',
  },
  {
    week: 'Week 14',
    title: 'Wrap Up + Feedback',
    description: 'Wrap up the cohort and provide feedback.',
  },
];

const BYI_SKILLED_ROADMAP: CohortRoadmapProps[] = [
  {
    week: 'Week 1',
    title: 'Introduction to Cohort + Idea Selection + Roadmap Creation',
    description:
      'Understand the cohort structure, select a project idea, and create a personalized roadmap.',
  },
  {
    week: 'Week 2',
    title: 'Launching Landing Page + Join Waitlist Launch',
    description: 'Create a landing page and plan marketing strategies.',
  },
  {
    week: 'Week 3',
    title: 'Learning Advanced Skills + Project Implementation',
    description: 'Learn advanced skills and implement them in your project.',
  },
  {
    week: 'Week 4',
    title: 'Final Touches + Beta Product Launch',
    description: 'Make final improvements and launch the beta version.',
  },
  {
    week: 'Week 5',
    title: 'Learning Phase II + Project Implementation',
    description: 'Learn advanced skills and implement them in your project.',
  },
  {
    week: 'Week 6',
    title: 'Launch V1 + Demo',
    description: 'Launch the final version and demo it to the community.',
  },
  {
    week: 'Week 7',
    title: 'Interview Prep Roadmap Creation',
    description: 'Create a roadmap for interview preparation.',
  },
  {
    week: 'Week 8-9',
    title: 'Mock Interview + Resume Building',
    description: 'Prepare for interviews and build your resume.',
  },
  {
    week: 'Week 10',
    title: 'Wrap Up + Feedback',
    description: 'Wrap up the cohort and provide feedback.',
  },
];

const BYI_COHORT_COMMON_FEATURES = [
  'Weekly 1:1 Live Mentorship',
  'Join with Your Friends(Max 4 people)',
  'Implement Gen AI in Project',
  'Personalised Interview Preparation',
  'Resume Building with AI',
  '7 Days Money Back Guarantee',
  '50% Cashback on Project Completion',
  'Free Project Completion Certificate',
  'Open Source Contributions',
  'Weekly Code Reviews',
  'Access to Builder Community',
  'Access to Free Resources',
  'Lifetime Alumni Network',
  '24x7 QnA with Mentor',
];

const BYI_USER_CATEGORIES: CohortUserCategoryProps[] = [
  {
    key: 'beginner',
    label: '🚀 Pure Beginner',
    data: BYI_BEGINNER_ROADMAP,
    duration: '4-5 Months',
    price: 5999,
    discount: 50,
    slashedPrice: 11999,
    features: [
      '4-5 Months Intensive Program',
      'Personalised Roadmap for All Members',
      'Resume Building & Interview Prep',
      ...BYI_COHORT_COMMON_FEATURES,
    ],
  },
  {
    key: 'confused',
    label: '🤔 Confused Learner',
    data: BYI_INTERMEDIATE_ROADMAP,
    duration: '3-4 Months',
    price: 4999,
    discount: 50,
    slashedPrice: 9999,
    features: [
      '3-4 Months Intensive Program',
      'Resume Building & Interview Prep',
      ...BYI_COHORT_COMMON_FEATURES,
    ],
  },
  {
    key: 'mentorship',
    label: '🧠 Seeking Mentorship',
    data: BYI_SKILLED_ROADMAP,
    duration: '2-3 Months',
    price: 3999,
    discount: 50,
    slashedPrice: 7999,
    features: [
      '2-3 Months Intensive Program',
      'Interview Prep Support',
      ...BYI_COHORT_COMMON_FEATURES,
    ],
  },
];

export {
  PRODUCTS,
  TESTIMONIALS,
  TOP_NAVIGATION,
  USP,
  TBP_FEATURES,
  MY_PREV_EXPERIENCE,
  TBP_PROJECTS,
  INTERVIEW_PREP_SHEETS,
  TBIP_FEATURES,
  YOUFOCUS_FEATURES,
  UNSKILLED_LANDING_GRAPH_TAB_PARAMS,
  BYI_BEGINNER_ROADMAP,
  BYI_INTERMEDIATE_ROADMAP,
  BYI_SKILLED_ROADMAP,
  BYI_USER_CATEGORIES
};
