import {
  TestimonialCardProps,
  PrimaryCardProps,
  TopNavbarContainerProps,
  PrimaryCardWithCTAProps,
} from '@/interfaces';
import { LINKS, products, STATIC_FILE_PATH } from '../global';
import { v4 } from 'uuid';
import { routes } from '..';

const TOP_NAVIGATION: TopNavbarContainerProps = {
  products: [
    {
      id: v4(),
      name: products.projects.label,
      description: products.projects.description,
      href: products.projects.slug,
    },
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
  ],
  links: [
    {
      id: v4(),
      name: 'Tech Mentorship',
      description: 'Get Book Tech Consultation',
      href: LINKS.bookTechConsultation,
      target: 'BLANK',
    },
    {
      id: v4(),
      name: 'Join Community',
      description: 'Join our WhatsApp Community',
      href: LINKS.whatsappCommunity,
      target: 'BLANK',
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
    id: 'workshops',
    image: `${STATIC_FILE_PATH.svg}/workshops.svg`,
    imageAltText: products.workshops.label,
    title: products.workshops.label,
    content: products.workshops.description,
    href: products.workshops.slug,
    active: true,
    ctaText: 'Explore Workshops',
    target: 'BLANK',
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
  {
    id: 'os',
    image: `${STATIC_FILE_PATH.svg}/open-source.svg`,
    imageAltText: products.os.label,
    title: products.os.label,
    content: products.os.description,
    href: products.os.slug,
    active: false,
  },
   {
    id: 'interview Prep',
    image: `${STATIC_FILE_PATH.svg}/shiksha.svg`, 
    imageAltText: products.interviewPrep.label,
    title: products.interviewPrep.label,
    content: products.interviewPrep.description,
    href: products.interviewPrep.slug,
    active: true,
    ctaText: 'Explore Interview Prep',
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
  {
    id: 'pharmasift-ii',
    image: `${STATIC_FILE_PATH.svg}/tbp-pharmasift-2.svg`,
    imageAltText: 'The Boring Projects Pharmasift Part II',
    title: 'Pharmasift Part II',
    content:
      'Design and Develop A Medicine App that Compares Med Prices with JavaScript',
    href: routes.allProjects.pharmashiftII,
    active: false,
    ctaText: 'Start The Project',
  },
];

const SHIKSHA_COURSES: PrimaryCardWithCTAProps[] = [
  {
    id: 'logic-building-for-everyone',
    image: `${STATIC_FILE_PATH.svg}/tbp-pharmasift-1.svg`,
    imageAltText: 'Learn Logic Building with Real-world Coding Challenges.',
    title: 'Logic Building For Everyone',
    content: 'Learn Logic Building with Real-world Coding Challenges.',
    href: routes.allCourses.logicBuildingForEveryone,
    active: true,
    ctaText: 'Start The Course',
  },
  {
    id: 'basics-of-programming-with-js',
    image: `${STATIC_FILE_PATH.svg}/tbp-pharmasift-1.svg`,
    imageAltText: 'Start Your Programming Journey with JavaScript.',
    title: 'Basics of Programming with JS',
    content: 'Start Your Programming Journey with JavaScript.',
    href: routes.allCourses.basicsOfProgrammingWithJS,
    active: false,
    ctaText: 'Start The Course',
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
    image: `${STATIC_FILE_PATH.svg}/workshops.svg`,
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
    image: `${STATIC_FILE_PATH.svg}/workshops.svg`,
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

export {
  PRODUCTS,
  TESTIMONIALS,
  TOP_NAVIGATION,
  USP,
  TBP_FEATURES,
  MY_PREV_EXPERIENCE,
  TBP_PROJECTS,
  SHIKSHA_COURSES,
  TBIP_FEATURES,
};
