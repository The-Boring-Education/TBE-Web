import {
  FooterNavigationDataProps,
  MicroCampFeatureCardContentProps,
  OpportunityCardProps,
  SkillsProps,
  TestimonialCardProps,
  WeGuideDifferentlyCardProps,
  MicroCampPricingCardProps,
  SkillProps,
  WorkshopDataProps,
  MicrocampDataProps,
  MicrocampOfferingsProps,
  TopNavbarContainerProps,
  CohortCardProps,
  AdminDashboardCardProps,
  CohortLeadStatus,
  ChooseTechCohortItem,
} from '@/interfaces';
import { LINKS, programs, STATIC_FILE_PATH } from '../global';
import { routes } from '../routes';
import { v4 } from 'uuid';

const TOP_NAVIGATION: TopNavbarContainerProps = {
  cohorts: [
    {
      id: v4(),
      name: programs.beFrontendMaster.label,
      description: programs.beFrontendMaster.description,
      href: routes.microCampLanding(programs.beFrontendMaster.slug),
    },
    {
      id: v4(),
      name: programs.juniorInWebEngineering.label,
      description: programs.juniorInWebEngineering.description,
      href: routes.microCampLanding(programs.juniorInWebEngineering.slug),
    },
  ],
  links: [
    {
      id: v4(),
      name: 'Contact us',
      href: routes.contactUs,
      description: 'Talk to our co-founders directly.',
    },
  ],
};

const PROGRAMS: CohortCardProps[] = [
  {
    id: 'JWE',
    image: `${STATIC_FILE_PATH.svg}/junior-in-web-engineering-banner.svg`,
    imageAltText: programs.juniorInWebEngineering.label,
    title: programs.juniorInWebEngineering.label,
    content: programs.juniorInWebEngineering.description,
    href: routes.microCampLanding(programs.juniorInWebEngineering.slug),
    active: true,
    bestSuitedFor: ['student', 'college-student'],
    isCohort: true,
  },
  {
    id: 'BFM',
    image: `${STATIC_FILE_PATH.svg}/be-front-end-master-banner.svg`,
    imageAltText: programs.beFrontendMaster.label,
    title: programs.beFrontendMaster.label,
    content: programs.beFrontendMaster.description,
    href: routes.microCampLanding(programs.beFrontendMaster.slug),
    active: true,
    bestSuitedFor: ['college-student', 'working-professional'],
    isCohort: true,
  },
  {
    id: 'BBM',
    image: `${STATIC_FILE_PATH.svg}/be-back-end-master-banner.svg`,
    imageAltText: programs.beBackendMaster.label,
    title: programs.beBackendMaster.label,
    content: programs.beBackendMaster.description,
    href: routes.microCampLanding(programs.beBackendMaster.slug),
    active: false,
    bestSuitedFor: ['working-professional'],
    isCohort: true,
  },
];

const WORKSHOP_CARDS: CohortCardProps[] = [
  {
    id: '2HD',
    image: `${STATIC_FILE_PATH.svg}/2_hour-design_banner.svg`,
    imageAltText: programs.twoHourDesign.label,
    title: programs.twoHourDesign.label,
    content: programs.twoHourDesign.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    id: 'GSTS',
    image: `${STATIC_FILE_PATH.svg}/getting_started_with_typescript_banner.svg`,
    imageAltText: programs.gettingStartedWithTypescipt.label,
    title: programs.gettingStartedWithTypescipt.label,
    content: programs.gettingStartedWithTypescipt.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    id: 'NWD',
    image: `${STATIC_FILE_PATH.svg}/nextjs_for_web_developer_banner.svg`,
    imageAltText: programs.theNextWave.label,
    title: programs.theNextWave.label,
    content: programs.theNextWave.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    id: 'HTW',
    image: `${STATIC_FILE_PATH.svg}/head_to_tailwind_banner.svg`,
    imageAltText: programs.headToTailwind.label,
    title: programs.headToTailwind.label,
    content: programs.headToTailwind.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    id: 'ADP',
    image: `${STATIC_FILE_PATH.svg}/api_development_with_postman_banner.svg`,
    imageAltText: programs.apiDevWithPostman.label,
    title: programs.apiDevWithPostman.label,
    content: programs.apiDevWithPostman.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    id: 'GSG',
    image: `${STATIC_FILE_PATH.svg}/getting_started_with_github_banner.svg`,
    imageAltText: programs.gettingStartedWithGithub.label,
    title: programs.gettingStartedWithGithub.label,
    content: programs.gettingStartedWithGithub.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    id: 'IWEB3',
    image: `${STATIC_FILE_PATH.svg}/intro_to_web3_banner.svg`,
    imageAltText: programs.introToWeb3.label,
    title: programs.introToWeb3.label,
    content: programs.introToWeb3.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
];

const ADMIN_DASHBOARD_CARDS: AdminDashboardCardProps[] = [
  {
    heading: 'Program Leads',
    subtitle: 'Manage all program leads',
    link: routes.admin.leads.programLeads,
  },
];

const [
  HTML,
  CSS,
  JavaScript,
  ReactJS,
  Redux,
  Tailwind,
  Bootstrap,
  NextJS,
  NodeJS,
  MongoDB,
  Figma,
  TypeScript,
]: SkillProps[] = [
  {
    id: v4(),
    name: `HTML`,
    image: `${STATIC_FILE_PATH.svg}/html.svg`,
    imageAltText: `HTML`,
  },
  {
    id: v4(),
    name: `CSS`,
    image: `${STATIC_FILE_PATH.svg}/css.svg`,
    imageAltText: `CSS`,
  },
  {
    id: v4(),
    name: `JavaScript`,
    image: `${STATIC_FILE_PATH.svg}/js.svg`,
    imageAltText: `JavaScript`,
  },
  {
    id: v4(),
    name: `ReactJS`,
    image: `${STATIC_FILE_PATH.svg}/reactjs.svg`,
    imageAltText: `ReactJS`,
  },
  {
    id: v4(),
    name: `Redux`,
    image: `${STATIC_FILE_PATH.svg}/redux.svg`,
    imageAltText: `Redux`,
  },
  {
    id: v4(),
    name: `Tailwind`,
    image: `${STATIC_FILE_PATH.svg}/tailwind.svg`,
    imageAltText: `Tailwind`,
  },
  {
    id: v4(),
    name: `Bootstrap`,
    image: `${STATIC_FILE_PATH.svg}/bootstrap.svg`,
    imageAltText: `Bootstrap`,
  },
  {
    id: v4(),
    name: `NextJs`,
    image: `${STATIC_FILE_PATH.svg}/nextjs.svg`,
    imageAltText: `NextJS`,
  },
  {
    id: v4(),
    name: `NodeJS`,
    image: `${STATIC_FILE_PATH.svg}/nodejs.svg`,
    imageAltText: `NodeJS`,
  },
  {
    id: v4(),
    name: `MongoDB`,
    image: `${STATIC_FILE_PATH.svg}/mongodb.svg`,
    imageAltText: `MongoDB`,
  },
  {
    id: v4(),
    name: `Figma`,
    image: `${STATIC_FILE_PATH.svg}/figma.svg`,
    imageAltText: `Figma`,
  },
  {
    id: v4(),
    name: `TypeScript`,
    image: `${STATIC_FILE_PATH.svg}/typescript.svg`,
    imageAltText: `TypeScript`,
  },
];

const landingPageSkills: SkillsProps[] = [
  {
    id: v4(),
    title: `Front-end Engineering`,
    details: [JavaScript, ReactJS, NextJS],
  },
  {
    id: v4(),
    title: `Back-end Engineering`,
    details: [NodeJS, MongoDB],
  },
  {
    id: v4(),
    title: `Extra Skills for Placements`,
    details: [Figma, TypeScript],
  },
];

const juniorInWebEngineeringSkills: SkillsProps[] = [
  {
    id: v4(),
    title: `Basic of Web Engineering`,
    details: [HTML, CSS],
  },
  {
    id: v4(),
    title: `Programming Language`,
    details: [JavaScript],
  },
];

const beFrontendMasterSkills: SkillsProps[] = [
  ...juniorInWebEngineeringSkills,
  {
    id: v4(),
    title: `Front-end Engineering`,
    details: [ReactJS, Redux, NextJS],
  },
  {
    id: v4(),
    title: `UI Dev in React`,
    details: [Tailwind, Bootstrap],
  },
  {
    id: v4(),
    title: `Extra Skills for Placements`,
    details: [Figma, TypeScript],
  },
];

const USP: WeGuideDifferentlyCardProps[] = [
  {
    id: v4(),
    title: `Mentorship`,
    content: `You'll mentored by Industry Experts. From Code Review to 1:1, You'll be in touch them every week.`,
    image: `${STATIC_FILE_PATH.svg}/mentorship.svg`,
    imageAltText: `mentorship`,
  },
  {
    id: v4(),
    title: `Peer Learning`,
    content: `You learn by practicing and also from your batchmates. Do Pair programming in our Discord community.`,
    image: `${STATIC_FILE_PATH.svg}/peer-to-peer-learning.svg`,
    imageAltText: `peer learning`,
  },
  {
    id: v4(),
    title: `Weekend Workshop`,
    content: `Learn skill over weekend that spreads your horizon in Tech Opportunities.`,
    image: `${STATIC_FILE_PATH.svg}/workshop.svg`,
    imageAltText: `weekend workshop`,
  },
  {
    id: v4(),
    title: `Doubt Clearing Sessions`,
    content: `Clear all your doubts over weekend and discuss any issue you're facing.`,
    image: `${STATIC_FILE_PATH.svg}/peer-to-peer-learning.svg`,
    imageAltText: `doubt session`,
  },
];

const TESTIMONIALS: TestimonialCardProps[] = [
  {
    id: v4(),
    title: `Manish Kumar`,
    content:
      'The Front-end cohort at The Boring Education transformed my web development skills. Their comprehensive curriculum and engaging teaching style made learning Front-end enjoyable and practical.',
    image: `https://ik.imagekit.io/tbe/webapp/manish-kumar-testimonial.png`,
    imageAltText: `profile image`,
    work: 'Software Engineer at Infosys',
  },
  {
    id: v4(),
    title: `Nancy Sharma`,
    content: `Thanks to The Boring Education's Front-end Cohort, my confidence in Web Dev skills has soared. Hands-on learning and supportive instructors made JavaScript accessible and rewarding.`,
    image: `https://ik.imagekit.io/tbe/webapp/nancy-sharma-testimonial.png`,
    imageAltText: `profile image`,
    work: 'Software Engineer at Cognizant',
  },
  {
    id: v4(),
    title: `Gautom Das`,
    content: `I highly recommend The Boring Education's Front-end cohort! Clear explanations, real-world examples, and challenging projects strengthened my understanding of Front-end Engineering.`,
    image: `https://ik.imagekit.io/tbe/webapp/gautom-das-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Passed Out',
  },
  {
    id: v4(),
    title: `Mohammad Sufyan`,
    content: `A fantastic tech learning platform for aspiring web developers, providing a pathway to explore and excel in this exciting career.`,
    image: `https://ik.imagekit.io/tbe/webapp/mohammad-sufyan-testimonial.png`,
    imageAltText: `profile image`,
    work: '12th completed',
  },
  {
    id: v4(),
    title: `Eshan Mishra`,
    content: `I'm extremely grateful to be part of The Boring Education as a learner, acquiring valuable web development skills.`,
    image: `https://ik.imagekit.io/tbe/webapp/eshan-mishra-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Student',
  },
  {
    id: v4(),
    title: `Kusum Sahani`,
    content: `I'm grateful to be part of The Boring Education as a learner, acquiring Front-end Engineering skills with exceptional faculty.`,
    image: `https://ik.imagekit.io/tbe/webapp/kusum-sahani-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Passed Out',
  },
  {
    id: v4(),
    title: `Nikhil Maurya`,
    content: `The Boring workshop made UI design easy and accessible. They explained complex concepts in a simple and understandable manner.`,
    image: `https://ik.imagekit.io/tbe/webapp/nikhil-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Student',
  },
  {
    id: v4(),
    title: `Satish Daraboina`,
    content: `The workshop at The Boring Education elevated my design skills. From Figma basics to creating and connecting screens, I gained hands-on experience to apply in real projects.`,
    image: `https://ik.imagekit.io/tbe/webapp/satish-testimonial.png`,
    imageAltText: `profile image`,
    work: 'College Student',
  },
];

const FOOTER_NAVIGATION: FooterNavigationDataProps[] = [
  {
    id: v4(),
    title: `Our Products`,
    isShow: true,
    urls: [
      {
        id: v4(),
        label: programs.beFrontendMaster.label,
        href: routes.microCampLanding(programs.beFrontendMaster.slug),
      },
      {
        id: v4(),
        label: programs.juniorInWebEngineering.label,
        href: routes.microCampLanding(programs.juniorInWebEngineering.slug),
      },
      // {
      //   id: v4(),
      //   label: programs.beBackendMaster.label,
      //   href: routes.microCampLanding(programs.beBackendMaster.slug),
      // },
    ],
  },
  {
    id: v4(),
    title: `Company`,
    isShow: true,
    urls: [
      // { id: v4(), label: `About US`, href: `#` },
      { id: v4(), label: `Contact Us`, href: routes.contactUs },
      // { id: v4(), label: `Refund Policy`, href: `#` },
    ],
  },
  // {
  //   id: v4(),
  //   title: `Resources`,
  //   isShow: false,
  //   urls: [
  //     { id: v4(), label: `Overview`, href: `#` },
  //     { id: v4(), label: `Overview`, href: `#` },
  //     { id: v4(), label: `Overview`, href: `#` },
  //   ],
  // },
  {
    id: v4(),
    title: `Connect With Us`,
    isShow: true,
    urls: [
      {
        id: v4(),
        label: `Discord`,
        href: `https://discord.com/invite/ypkKNsEFqU`,
        target: 'BLANK',
      },
      {
        id: v4(),
        label: `Instagram`,
        href: `https://www.instagram.com/theboringeducation/`,
        target: 'BLANK',
      },
    ],
  },
  // {
  //   id: v4(),
  //   title: `Legal`,
  //   isShow: false,
  //   urls: [
  //     { id: v4(), label: `Overview`, href: `#` },
  //     { id: v4(), label: `Overview`, href: `#` },
  //     { id: v4(), label: `Overview`, href: `#` },
  //   ],
  // },
];

const BACKEND_MICROCAMP_CURRICULUM: MicroCampFeatureCardContentProps[] = [
  {
    id: v4(),
    title: `8 Weeks`,
    content: `Duration`,
  },
  {
    id: v4(),
    title: `1:1 Mentorship`,
    content: `Weekly Session with Mentors`,
  },
  {
    id: v4(),
    title: `Only Projects`,
    content: `Learn by Building`,
  },
  {
    id: v4(),
    title: `Code Review`,
    content: `Weekly code reviews by mentors`,
  },
  {
    id: v4(),
    title: `Tech Workshops`,
    content: `Workshops on Tech every weekend`,
  },
  {
    id: v4(),
    title: `Be Job Ready`,
    content: `Project & Resume to Job, All in one`,
  },
];

const JUNIOR_CAMP_FEATURES: MicroCampFeatureCardContentProps[] = [
  {
    id: v4(),
    title: `5-6 Weeks`,
    content: `Duration`,
  },
  {
    id: v4(),
    title: `Live Classes`,
    content: `Evening classes with Experts`,
  },
  {
    id: v4(),
    title: `4+ Projects`,
    content: `Build projects on HTML, CSS, JS`,
  },
  {
    id: v4(),
    title: `Doubt Sessions`,
    content: `Clear your doubts on Sunday`,
  },
  {
    id: v4(),
    title: `Assignments Everyday`,
    content: `Build websites everyday`,
  },
  {
    id: v4(),
    title: `24x7 Support`,
    content: `Ask your Mentors anytime`,
  },
];

const FRONTEND_CAMP_FEATURES: MicroCampFeatureCardContentProps[] = [
  {
    id: v4(),
    title: `8 Weeks`,
    content: `Duration`,
  },
  {
    id: v4(),
    title: `Live Classes`,
    content: `Evening Session with Experts`,
  },
  {
    id: v4(),
    title: `7+ Projects`,
    content: `Learn by Building`,
  },
  {
    id: v4(),
    title: `Mock Interviews`,
    content: `Prepare with Mocks by Experts`,
  },
  {
    id: v4(),
    title: `Resume Building`,
    content: `Show Your Skills Correctly`,
  },
  {
    id: v4(),
    title: `Job Profile Building`,
    content: `Learn Where to Look for Jobs`,
  },
  {
    id: v4(),
    title: `Code Review`,
    content: `Weekly code reviews by mentors`,
  },
  {
    id: v4(),
    title: `Tech Workshops`,
    content: `Workshops on Tech every weekend`,
  },
  {
    id: v4(),
    title: `Learn in Community`,
    content: `Learn and Build with Peers`,
  },
];

const JUNIOR_CAMP_PRICING: MicroCampPricingCardProps[] = [
  {
    id: v4(),
    content: `Live Sessions with Experts`,
  },
  {
    id: v4(),
    content: `Sunday Doubt Session`,
  },
  {
    id: v4(),
    content: `Only Project-based learning`,
  },
  {
    id: v4(),
    content: `Extra Skills in Tech Workshops`,
  },
  {
    id: v4(),
    content: `Community based learning`,
  },
];

const FRONTEND_CAMP_PRICING: MicroCampPricingCardProps[] = [
  {
    id: v4(),
    content: `Live Sessions with Experts`,
  },
  {
    id: v4(),
    content: `Build 7+ Projects`,
  },
  {
    id: v4(),
    content: `Mock Interviews`,
  },
  {
    id: v4(),
    content: `Resume Building`,
  },
  {
    id: v4(),
    content: `Placement Training`,
  },
  {
    id: v4(),
    content: `Community based learning`,
  },
  {
    id: v4(),
    content: `Tech Workshops Every Weekend`,
  },
];

const JUNIOR_CAMP_OFFERINGS: MicrocampOfferingsProps[] = [
  {
    id: v4(),
    title: `Live Classes`,
    content: `Attend Evening classes after your work and prepare yourself for the future.`,
    image: `${STATIC_FILE_PATH.svg}/live_mock_interview.svg`,
    imageAltText: `Live Classes`,
  },
  {
    id: v4(),
    title: `Sunday Doubt Sessions`,
    content: `Ask any doubt you've while preparing on Sunday. We also have 24x7 Support on our Discord community.`,
    image: `${STATIC_FILE_PATH.svg}/doubt_session.svg`,
    imageAltText: `Sunday Doubt Sessions`,
  },
  {
    id: v4(),
    title: `Build Projects with Peers`,
    content: `Don't just learn, Apply the coding skills into real-life projects.`,
    image: `${STATIC_FILE_PATH.svg}/project_with_peers.svg`,
    imageAltText: `Build Projects with Peers`,
  },
  {
    id: v4(),
    title: `Some "Boring" Skills`,
    content: `On Weekend workshops with "The Boring Workshop", You’ll get hands-on experience in Tech topics.`,
    image: `${STATIC_FILE_PATH.svg}/some_boring_skills.svg`,
    imageAltText: `Some Boring Skills`,
  },
];

const FRONTEND_CAMP_OFFERINGS: MicrocampOfferingsProps[] = [
  {
    id: v4(),
    title: `Live Classes`,
    content: `Attend Evening classes after your work and prepare yourself for the future.`,
    image: `${STATIC_FILE_PATH.svg}/live_mock_interview.svg`,
    imageAltText: `Live Classes`,
  },
  {
    id: v4(),
    title: `Sunday Doubt Sessions`,
    content: `Ask any doubt you've while preparing on Sunday. We also have 24x7 Support on our Discord community.`,
    image: `${STATIC_FILE_PATH.svg}/doubt_session.svg`,
    imageAltText: `Sunday Doubt Sessions`,
  },
  {
    id: v4(),
    title: `Build Projects with Peers`,
    content: `Don't just learn, Apply the coding skills into real-life projects.`,
    image: `${STATIC_FILE_PATH.svg}/project_with_peers.svg`,
    imageAltText: `Build Projects with Peers`,
  },
  {
    id: v4(),
    title: `Resume Building`,
    content: `We build your resume that gets you shortlisted for the interviews.`,
    image: `${STATIC_FILE_PATH.svg}/resume_building.svg`,
    imageAltText: `Resume Building`,
  },
  {
    id: v4(),
    title: `Job Profile Building`,
    content: `A good job profile is needed for a good, and we make sure that you've one.`,
    image: `${STATIC_FILE_PATH.svg}/job_profile_building.svg`,
    imageAltText: `Job Profile Building`,
  },
  {
    id: v4(),
    title: `Linkedin Optimization`,
    content: `We guide your way of using LinkedIn to get interview calls and pitch yourself in front of HRs.`,
    image: `${STATIC_FILE_PATH.svg}/linkedin_optimization.svg`,
    imageAltText: `Linkedin Optimization`,
  },
  {
    id: v4(),
    title: `Some "Boring" Skills`,
    content: `On Weekend workshops with "The Boring Workshop", You'll get hands-on experience in Tech topics.`,
    image: `${STATIC_FILE_PATH.svg}/some_boring_skills.svg`,
    imageAltText: `Some Boring Skills`,
  },
];

const WE_TAUGHT = [
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

const NOT_ANOTHER_TECH_COURSE = [
  {
    id: v4(),
    title: `Context based learning`,
    content: `ChatGPT writes better code than us so we make sure your learnings are relevant.`,
    image: `${STATIC_FILE_PATH.svg}/context_learning.svg`,
    imageAltText: `context based learning`,
  },
  {
    id: v4(),
    title: `Arjuna Needed Drona.`,
    content: `You can learn anything from Internet but you can’t do it in shortest way possible.`,
    image: `${STATIC_FILE_PATH.svg}/arjun_needed_drona.svg`,
    imageAltText: `arjun needed drona`,
  },
  {
    id: v4(),
    title: `Minimal Learning`,
    content: `We make sure you start small, on each topic, every week so you don’t feel to much.`,
    image: `${STATIC_FILE_PATH.svg}/minimal_learning.svg`,
    imageAltText: `minimal learning`,
  },
];

const TALK_ABOUT_OPPORTUNITIES: OpportunityCardProps[] = [
  {
    id: v4(),
    heading: `Avg. Salary`,
    title: `8-20 LPA`,
    content: `Source: Glassdoor`,
  },
  {
    id: v4(),
    heading: `Jobs In Market`,
    title: `55000+`,
    content: `Source: Glassdoor`,
  },
];

const WORKSHOPS: WorkshopDataProps[] = [
  {
    meta: {
      slug: programs.twoHourDesign.slug,
      title: programs.twoHourDesign.label,
      image: `${STATIC_FILE_PATH.image}/coding_bg.png`,
      imageAltText: `is programming for you`,
      description: programs.twoHourDesign.description,
      date: '2023-05-29', // YYYY-MM-DD
      time: '5 PM',
      instructor: {
        name: `Sachin Kr. Shukla`,
        designation: `Co-Founder, The Boring Education`,
        image: `${STATIC_FILE_PATH.image}/sachin_shukla.png`,
        imageAltText: 'sachin shukla',
        about: [
          '1. Built Ed-tech startups since college.',
          '2. Worked with Newton School, Masai, Pesto & CueMath.',
          '3. Senior Software Engineer @PW.',
        ],
      },
      link: '#',
    },
    aboutWorkshop: {
      descriptions: [
        "Programming is becoming everyone's need these days. You want to build a software, You need programming. You want to get a job, you need programming.",
        'First thing as a learner you do, is look for an online programs. There are so many programs available in the market.',
        "With lot of options in market, You will be confused to choose an option, and with that you'll choose an expensive program that'll cost you lakhs.",
        "Everybody has a spending capacity and with a “Job in 6 Months” scheme, you'll be prompted to buy a program.",
        "Should you buy or should you not? We'll discuss it in our programs.",
      ],
      whatWillYouLearn: [
        "1. You'll learn with your background, will programming be helpful for you?",
        '2. Decide if you should be okay buying expensive bootcamps',
        '3. Understand what it takes to break into Tech',
      ],
    },
  },
  {
    meta: {
      slug: programs.theNextWave.slug,
      title: programs.theNextWave.label,
      image: `${STATIC_FILE_PATH.image}/coding_bg.png`,
      imageAltText: `is programming for you`,
      description:
        'Understand why everybody wants to be in Tech and should you learn Tech or not.',
      date: '2023-05-29', // YYYY-MM-DD
      time: '5 PM',
      instructor: {
        name: `Sachin Kr. Shukla`,
        designation: `Co-Founder, The Boring Education`,
        image: `${STATIC_FILE_PATH.image}/sachin_shukla.png`,
        imageAltText: 'sachin shukla',
        about: [
          '1. Built Ed-tech startups since college.',
          '2. Worked with Newton School, Masai, Pesto & CueMath.',
          '3. Senior Software Engineer @PW.',
        ],
      },
      link: '#',
    },
    aboutWorkshop: {
      descriptions: [
        "Programming is becoming everyone's need these days. You want to build a software, You need programming. You want to get a job, you need programming.",
        'First thing as a learner you do, is look for an online programs. There are so many programs available in the market.',
        "With lot of options in market, You will be confused to choose an option, and with that you'll choose an expensive program that'll cost you lakhs.",
        "Everybody has a spending capacity and with a “Job in 6 Months” scheme, you'll be prompted to buy a program.",
        "Should you buy or should you not? We'll discuss it in our programs.",
      ],
      whatWillYouLearn: [
        "1. You'll learn with your background, will programming be helpful for you?",
        '2. Decide if you should be okay buying expensive bootcamps',
        '3. Understand what it takes to break into Tech',
      ],
    },
  },
];

const CHOOSE_COHORT_HEADER_TITLES = {
  default: 'Choose best suited Tech Program',
  juniorInWebEngineering: 'Web Engineering for Beginners',
  beFrontendMaster: 'Job-ready Front-end Skills in 8 Weeks',
};

const MICROCAMPS: MicrocampDataProps[] = [
  {
    slug: programs.juniorInWebEngineering.slug,
    name: 'Junior in Web Engineering',
    header: {
      heading: {
        primary: 'Junior in',
        secondary: 'Web Engineering',
      },
      subheading:
        'Learn Fundamentals of Web dev with industry experts in live sessions.',
      cta: {
        primary: routes.internals.microCampLanding.register,
      },
    },
    chooseCohortHeaderTitle: CHOOSE_COHORT_HEADER_TITLES.juniorInWebEngineering,
    instructor: {
      name: 'Sachin Kr. Shukla',
      about:
        'Co-founder @ The Boring Education | Ex-Physics Wallah, Pesto, Masai & Newton School',
      imageLink: `${STATIC_FILE_PATH.image}/frontend_camp_instructor_dp.png`,
      linkedInProfile: 'https://www.linkedin.com/in/imsks/',
    },
    inThisCohort: {
      label: 'Web Engineering',
      features: JUNIOR_CAMP_FEATURES,
    },
    skills: juniorInWebEngineeringSkills,
    offerings: JUNIOR_CAMP_OFFERINGS,
    pricing: {
      basePrice: 5999,
      sellingPrice: 2999,
      valueProvided: JUNIOR_CAMP_PRICING,
    },
  },
  {
    slug: programs.beFrontendMaster.slug,
    name: 'Be Front-end Master',
    header: {
      heading: {
        primary: 'Be',
        secondary: 'Front-end Master',
      },
      subheading:
        'Learn Core of Front-end Engineering with Placement Assistance in 8 Weeks.',
      cta: {
        primary: routes.internals.microCampLanding.register,
      },
    },
    chooseCohortHeaderTitle: CHOOSE_COHORT_HEADER_TITLES.beFrontendMaster,
    instructor: {
      name: 'Sachin Kr. Shukla',
      about:
        'Co-founder @ The Boring Education | Ex-Physics Wallah, Pesto, Masai & Newton School',
      imageLink: '/images/frontend_camp_instructor_dp.png',
      linkedInProfile: 'https://www.linkedin.com/in/imsks/',
    },
    inThisCohort: {
      label: 'Front-end Engineering',
      features: FRONTEND_CAMP_FEATURES,
    },
    opportunities: {
      heading: 'Front-end Engineering',
      cards: [
        {
          label: 'Avg. Salary',
          value: '5-8 LPA',
          subtitle: 'Source: Glassdoor',
        },
        {
          label: 'Jobs in Market',
          value: '55000+',
          subtitle: 'Source: Glassdoor',
        },
      ],
    },
    skills: beFrontendMasterSkills,
    offerings: FRONTEND_CAMP_OFFERINGS,
    pricing: {
      basePrice: 11999,
      sellingPrice: 8999,
      valueProvided: FRONTEND_CAMP_PRICING,
    },
  },
];

const programLeadStatusList: CohortLeadStatus[] = [
  'Pending',
  'Connected',
  'Interested',
  'Callback',
  'Not Interested',
];

const chooseTechCohortItems: ChooseTechCohortItem[] = [
  {
    id: 'working-professional',
    label: 'Working Professional',
  },
  {
    id: 'college-student',
    label: 'College Student',
  },
  {
    id: 'student',
    label: 'School Student',
  },
];

export {
  FOOTER_NAVIGATION,
  PROGRAMS,
  juniorInWebEngineeringSkills,
  beFrontendMasterSkills,
  landingPageSkills,
  TESTIMONIALS,
  TOP_NAVIGATION,
  USP,
  FRONTEND_CAMP_FEATURES,
  JUNIOR_CAMP_OFFERINGS,
  FRONTEND_CAMP_OFFERINGS,
  BACKEND_MICROCAMP_CURRICULUM,
  JUNIOR_CAMP_FEATURES,
  WE_TAUGHT,
  NOT_ANOTHER_TECH_COURSE,
  TALK_ABOUT_OPPORTUNITIES,
  JUNIOR_CAMP_PRICING,
  FRONTEND_CAMP_PRICING,
  WORKSHOPS,
  MICROCAMPS,
  WORKSHOP_CARDS,
  ADMIN_DASHBOARD_CARDS,
  programLeadStatusList,
  chooseTechCohortItems,
  CHOOSE_COHORT_HEADER_TITLES,
};
