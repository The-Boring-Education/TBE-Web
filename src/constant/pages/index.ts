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
  ProgramCardProps,
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

const PROGRAMS: ProgramCardProps[] = [
  {
    image: `${STATIC_FILE_PATH.svg}/junior-in-web-engineering-banner.svg`,
    imageAltText: programs.juniorInWebEngineering.label,
    title: programs.juniorInWebEngineering.label,
    content: programs.juniorInWebEngineering.description,
    href: routes.microCampLanding(programs.juniorInWebEngineering.slug),
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/be-front-end-master-banner.svg`,
    imageAltText: programs.beFrontendMaster.label,
    title: programs.beFrontendMaster.label,
    content: programs.beFrontendMaster.description,
    href: routes.microCampLanding(programs.beFrontendMaster.slug),
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/the-boring-workshop-banner.svg`,
    imageAltText: programs.theBoringWorkshops.label,
    title: programs.theBoringWorkshops.label,
    content: programs.theBoringWorkshops.description,
    href: `#${routes.internals.workshops}`,
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/be-back-end-master-banner.svg`,
    imageAltText: programs.beBackendMaster.label,
    title: programs.beBackendMaster.label,
    content: programs.beBackendMaster.description,
    href: routes.microCampLanding(programs.beBackendMaster.slug),
    active: false,
  },
];

const WORKSHOP_CARDS: ProgramCardProps[] = [
  {
    image: `${STATIC_FILE_PATH.svg}/2_hour-design_banner.svg`,
    imageAltText: programs.twoHourDesign.label,
    title: programs.twoHourDesign.label,
    content: programs.twoHourDesign.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/getting_started_with_typescript_banner.svg`,
    imageAltText: programs.gettingStartedWithTypescipt.label,
    title: programs.gettingStartedWithTypescipt.label,
    content: programs.gettingStartedWithTypescipt.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/nextjs_for_web_developer_banner.svg`,
    imageAltText: programs.theNextWave.label,
    title: programs.theNextWave.label,
    content: programs.theNextWave.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/head_to_tailwind_banner.svg`,
    imageAltText: programs.headToTailwind.label,
    title: programs.headToTailwind.label,
    content: programs.headToTailwind.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/api_development_with_postman_banner.svg`,
    imageAltText: programs.apiDevWithPostman.label,
    title: programs.apiDevWithPostman.label,
    content: programs.apiDevWithPostman.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/getting_started_with_github_banner.svg`,
    imageAltText: programs.gettingStartedWithGithub.label,
    title: programs.gettingStartedWithGithub.label,
    content: programs.gettingStartedWithGithub.description,
    href: LINKS.workshopRegistration,
    active: true,
  },
  {
    image: `${STATIC_FILE_PATH.svg}/intro_to_web3_banner.svg`,
    imageAltText: programs.introToWeb3.label,
    title: programs.introToWeb3.label,
    content: programs.introToWeb3.description,
    href: LINKS.workshopRegistration,
    active: true,
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
    image: `https://lh3.googleusercontent.com/fife/AKsag4N3HB1P7ECtZtvwSAZvjXgk8c8F3H3l_cHUJFnFdKsrzQ_1r4HaFXUsVQOWMFIMkFxdKBEmYxIXE4erRRsDMGeUCWFDDWErppF1gizTh44B7P7SJ7IDAUGvxwJa0XJqut_orh7h8WeLGOUHQpFUsxLtisJn4lkufNEUerMaCuc__EYvESE6WOvm_CLihg57Vt02JqMMfKhY41ARFL_snaAHYWevZpPit7pWqiV_LEmzIoHq_N6SktIE2BRwKTM71an8X2T3c6Xs679r-6a_umhha7Ua8H8TOlt91qe0iBaO5PCXlaC4n0KzSP5YoBf5TZLw4Jh9gGVWLk4N91Tr2OlyXZkYq8NRKCcd8uQAd2WsKe0L24gqKFBTMklsrqSt3i-n0rNAsDU-2PjcMgeabgNjNjNrdXFwswSvlVjI_IkfHVPs3gZz8hIIwrKRjNU_vJeDbJlDKmp_3jFBAxQ35A3CuJaNCTqhX4aYzx3iBiedNgtOGp7XIt_KLXeCCqg6r_k7kXo6SCRZFcDk4L98v_MsYmc65sJj4vxMR6EPpDMksz4-RBomCAek3BuR-e2qw5shxy7sYmCK_46mokHAATln1kPKY4_nsRIwXMrnSJ3L_vSH9gnnfbj-8fTJ3jJ8tWC275gUsUF-T_TRjG0f0mhO7mV0CUbTg5UsU94B0h5UfLEbq5XPpUuxnZUvLGbDvbQdBDVuFStltwaCuIkltoqyauazNpDBpQ8YNGZP0eji4W21-dcYkjF_cPBd7k0Y4s5-3OepwHIiwXYotuhKOlwp71e4UBhaxfrDLqg7-rF4PXVo2ZqJMi8L9RQm0MdYCgBh_tBuy9k_qVahBDRSS3rh_iTzFNUfswdPCWN5wTx0gGjY9pNhXIDWWzt-DdhW7B0ZjUhgOG8kZXuVn9BwzT9CXPwps2lbOj_B1lbafvg4xNfb_9Zm1TLCDUeKN0XEPCBr43jq8eVUsvzdUZaeRqo3tBkdzrGUFXGrmIfsdjMJiXPWF72nL_8w2ahwJKPQeIpJHbZ1DKfCXdkvw0N4g64IiYAf1eQH4DjySjaftkPpJh7CUHGcvoemj9D24MRCuShMrfkJIOi_aJLkyOjBlSFQrgrb84wYklWfSOmDZ-GMcOuei6U4EwagvwKJdl0rZuoMlKM1I7oDBnYL08_YB4RYlsxDimjDasRI1kIdUXPilJDeY8OlKAc8eyqNc5YXGjSsvA_sLQsTrKbXMTi6iVtleC4Z9iiI5Xr8Wsc671ScFhzQqlgJNONV7QAKLr2YwFy-7JeGcDoicXDyFS3J9MVCkSJeYBBWIHy1kr78TSp7OlyLby9aclIpQxhhk4Kte2kqnE5Rb70QkbXszf7A82rW-t4pIXzzoGtSYfSEyrVqKj9I9hSRnVgip5lE62TNuV3QAylQju1ZZIx_X7lBpPvL2xBrge2SOJBxUaVe8RTyhh6Ik6vvG31_pewWAhr9OFzIsAHVm4LAXrdSP-CxK5rVJq7N5_rpv7FoJdes--njyv30IpNLrhitlkwBBd0=w2880-h1370`,
    imageAltText: `profile image`,
    work: 'Software Engineer at Infosys',
  },
  {
    id: v4(),
    title: `Nancy Sharma`,
    content: `Thanks to The Boring Education's Front-end Cohort, my confidence in Web Dev skills has soared. Hands-on learning and supportive instructors made JavaScript accessible and rewarding.`,
    image: `https://lh3.googleusercontent.com/fife/AKsag4Oq9_9-xZMIsidg2eC65Ici6hoxqNtTZKbHVi2bhU6QGyKLxUG6hFdn0ZC9YmTL4JKwdBTFjgzaGbL9nm_Dx3F-UslnaJdc8jZ05ZdACY29Qrgp4AAxKFdSrdQikbHfAkHn-Ip6S6G65cZBBe_Xf2aVNcZzAWfQBl2gddQhaSAj8Sj9u6GBCx9GERfflOB7SgxFV5juX9noiTOwVydgdsDnGROfuORT6da0fSVYOAMtqaojnVn-QMZRBt5USU1WhDNK9H97Get4DKI8qFt-El73lpzMSMl02aul1EzFbs9WWMPXzJCMgjD-9OXxECMXJQxuqVEyrTF7OSi3SkaN7LEErs804TGNcJabH53jzGakAG5DRjO0pvrtHM8Uci_gJPlujvfHkmflhpeY2YyESH01dZQrYqo-KbzKEcqJA7JuPjIU0_NCvoDx2Zq9BZGyuy39PgaP1KkDOJJDkunZYcK9WgUlOP9VrUrwQf966KhzTBUXpoD22mv2rWKo3rsCHGYKJnsIvfl4oksN433rTeeU1xSE06VRdZLv_K_dSOdTC-bs8JIZ_LOCqgC4j17ztLyRTtoCO5IIm5qHIAUxCRuq9b1yHPG_so9PTgAYGm6nITdaXlTcOKfWWJxk-YmdbF1pk7ImwIU61hOmOxe7kXeS1WzwRMQLGk6jwaaOjSEEAbHZQixwGuSTj9sUuPy6om_w96DLWc16VdW-9VhagSAZws-sZId8_iXo0N4j7fVNO1MLoRloyA5AKsLp7E7OeKMJQ9gvlHCXp5lz5djY5xNgECqw5tugqfMIsBQpav6ITFovzA-cBMi0ggVzs-QaS_fTeRKWgoN4kvfuioiJ_WHRIsNlM58O4iF8jziamtXfWBK4SU3-_tpiR5psb6R7pEyqRbEylkykZb59m_qQoEMgivp8u-F1G9BruCD7Y2bFT2QKunYIMLD2_9erjTTyjgKLvt-_QhCj650jVM3lG9rOBDrIIwyvecRDTOyCBiZXJGpBCobFYG6ojFZbw6JY9Sy7g5dgaW_RsbuY60NODoH0O3XHm3HlE5IHb2WezKwZCdaHqcnDLAmVYftz0XC-10BCWrtdp5oIXwyxYv5pvUlvwURscGtNCf1VxyBE6cdvAIK3-hWJnCpZHa_qLxlAg20UeL1JMqKg_GNgCYXSPyvhjOgq6ZGZBAZOOsj0gqRNfrm-WSkEjnYHO-8rGq1csfWGOiOzqgykzc2e_YGelsKXEgClOJ8fqaMi2jsdVIv6A8N6oBiLRjWowdMZBrWollrgMsMrcAhbSo_OulC5E7KdNhKbR23L02Gqkkj7VeVrrqCTqqUExcLJzhrlXN5jWnL_fYTX5PW-xUW-46Sh2QCMN3ID93HXQzlVmSz0mIExhfKa4Gnj-NtwrM4qylOQfHQRUKqyg_2ziifdb2rVP-SKhNWTOwmvhKNiDysendiVe9t9i56V0tDQeqTsz9ZJJby1vHhLWYzGCxzQWaugVlL3IiNx79eaL6FWOXZocqeD9iRcW2xY8U5WEgc-le4=w2880-h832`,
    imageAltText: `profile image`,
    work: 'Software Engineer at Cognizant',
  },
  {
    id: v4(),
    title: `Gautom Das`,
    content: `I highly recommend The Boring Education's Front-end cohort! Clear explanations, real-world examples, and challenging projects strengthened my understanding of Front-end Engineering.`,
    image: `https://lh3.googleusercontent.com/fife/AKsag4MlMCxs-kX3ZBfZDXZZemBHGsMP2s29xrQ00UDyBtHbiLNMGKIfMvPL91q-O-NxysS2_C-5dF-al7J8yeXi2kXBGZRYsNBU06KQ1Apbrt4hHOzPgkxjl-oHdI5D5-vKwAJRvXX-ifXosMVLMYnryzT3lBKa53HJqmd-_bp5zK0bEb6IyxiYPz_c2Zm3nvdk3zVofLQtl66VVL3lrOowwCFxVYGVA8U6vPFUyhCyFqMLPPx6zvkIjeZXVTXQd_537wilT3s9UOIJTvWyMr1JaOMUPCdJpz-RfVZlFFNrqSsIlyUf-yq_-MvIPcGhfzdUEw6LcqpKAY2kvDVSryM3OA3nBqBcUmNnLTsu3gmkIdlGwSII-6PmvobGTO_mLj5kX3nnTjzzJC0ErlqcqqGDLElhph5SbXpsJ1cCPhRE0BVoqOLDLcCZC_FfDeSG8J0yaiDhMvnUVRkGIItumeGsiKETo81X9hvM71RkSGGtcqBSkvl2MP-X-tfoxicrNpHoZ9xxQcTq8QMqMBUJqJiK4gq_o7K1sKxZvgU1klo6PBy01JHMnGA-i8DzWYdjPAfLCnr56kRKcnFjzWnTE4XwXBosOUF8mmqIS_ghYn61BR1lj_BWDMrllJPWuVMVFIA-iaeX_TbcK5NLTJ8ZyLMGTz1vmc9Ztg_TXPuZyvDg7cnkDAxGFMRyjBeDsdUMp6OwcPSmTT9UV9eEpF9xcR37Z2Ydt9Iy212hVAvvMYhbhaxYn7Pm9sGFz10VZjItmnnQe3kyv22SpmMx4i3C8-JlFyY-x34Rt_T70wnTVlAqkorD20YE-RTUNkHzoj2y15sENHRm3HfeSpcSmD3BbyNqWu6koKGWqF_0tlR0z61fjYTXzj6LuUDZ1FNMLbSuoTQ8kdlf0OZIbNYP-U-Ag1ciR0UnUIYa8KKcnK5wu7nYgVSawQ0evSPdwK30qRU8BcBRtPgjSj478sVUjb6843iuANJmKZyYJ1vaPjUfsd8CNTvx5Ugy-SQji0fQpOmM_PjvxzBEM4qfVhOXfGtBx7USznqU8NVPFkATgh7XJbiD6BnET45FHzmM7PpZBXGt3Wu5IhAoowgLRkVfjyMr3IGwIQoAgO6ylFuS72kMAQerowWnAljjiFEo4xHMMEJXbHBoZZIoxw4zzdU5D8zIJ1xEXDGG8CKSKo1BmvdHJBdyE5qxs2oCZ3rv-jETCoJRgCZblO2Sgaprf7iLzr4f9UauFNJdiq4NjHFoiCraE5NF415rtW1YWdi7tov8vENLmCx2UlEe5fmUrgCBtjJWI8qPkU_QDiPlMYuW35O8yTXshteJiBGDjaQupw15r1I4mEcyr5KhkKfhy3HSEJ4IRAokbNN1OKSs1Kf1EjIiBcoTAuhxpgtxM35g3-vxdEl5U26800uwE-azJ9DD-OLb4LsyyIRBdd45bdCPpiWOhvytU3nkJcLnNrPErlC4i0n4_N6GSpIYj3g4PSq9BfmJPlhKqmBzAbO4tA-WLFlrlpTaxp0tyc48ImJIHM8iS89EE10=w2880-h832`,
    imageAltText: `profile image`,
    work: 'College Passed Out',
  },
  {
    id: v4(),
    title: `Mohammad Sufyan`,
    content: `A fantastic tech learning platform for aspiring web developers, providing a pathway to explore and excel in this exciting career.`,
    image: `https://lh3.googleusercontent.com/fife/AKsag4M5nB8Uy3ne8WuyVZpiT0hAgk4slxA4ccfBvn5kcFzxOkeaWo38S4TzXuxtLTfq3dQEPabMVwzuRsr-skcyxRg_T1B9xzHzz8sgc2BRYjbVPdmKdAWw4IKP51ge0RuWvUTfksysKiPjTtZbIlxcnwys_jSjOYrNvuxuRXasqp85UM4gsUSLMnmN7BYdFE0lrhvApwluOzGP04zJiQ20slBuI0hCDvlflBmCmdCWnTJZQFpvPJzu3YyYpbYskZ5qjuNCse2PzwDDgewXJAKtSjQvxFeLOE-JlWDKTCEHsEY8A_tLywGSGK13a7c147RYQ0mJ9sL8m2rxGT7YMPjBDQYM1gMGer47hj8ZJXR04IscWyOlx3My7WWCliDwhsJIWBbnE77C7gCkKb853a0qWhneMh2HCChkRyqp4EbbrNuDWx6tRIp96KPynJwr8SCcjyXNjUh9FBo7Hwp014_InF6ELBAcEq7FfcN7LL3ltBMIRvAk2j34no_EYlaxe7caOWby2a4JD9Km4zw2fO2yf7oVqkJLybShnwiUQ4kvjzM-5jHH4fwmHgBo3-DHoDhDeK3ObKXCHNvQlMFGsAdzQ4ybX1zoXMdZQbBh-w80MJt2KihMLNojwUlng40LebmkCl7FRS0njBoJCXXopN_YVY3R-uiIIy89x9lhK_5NovoBKe69ETuvBdOlvWc5rvsdBIsnrji8Hasm0YMuV3jK_inQM8wFeuXBW0raPnsOXKI8cYG1UhF2HVVypkfwD4mdmJrybA4Md0nAE_uI1DR1p16W_LoqD2Tj20l8ZNNL3DkzDTTLhdoa18EQcmX2_GS3_a9SKKvzswHzbHEgGJtJXAQblQWH87MXDP46xsBPbCi7lMsA3tDGxxC-3HZajT0VPKXi9SaaQnymISB0tRJG3zg_gAMFpgLhxmv2XzjL3Ivliu-ZWOohMU7if7TnyH9WeLYpXQuMZxTT7dLmkmpZEXQvvQ6_BSDiGJD_kJhUMFobv7EqOMS2CXOoNBww2kgMdEocXU3xF8tfSxIDffVZPwMvMJUM3D0Q0wNKiESnEz7oXfgjARVxMdI3Drzs2S6DH7xD9HKMrAxIiA14rOEQe9_p6_zn_2vwjisw7wAZfJDOYRo7ZZcwFyUNEA_fikx30BbyoFmNLEAGZgSKdXuChokX-kLDsSJSVAFmn2l4ynzfdTX0rT8BLmvMM7nXKeCPAfEFPJmID8jBG-4tx8vRZWczRKji7w9SCNwrGbUHrO2vuWTygVuz-EvbsKSAjRQeqYwBaeW4cNIAjmcf_5C-W4bxGcWaR3HfsvLvYKkNtElY1dybEhDRVtl5ZU7bekrBf28fnvV2DM9z-DKbCrzDbXx7y9mVIvj3946DSKYWDi9NP_zV2de-wWI62HTJ2SfkGnwFKEFBu5AYtWemdk3B29Q48ff1zr6fdTq1hQziJAUKxxpJ0Okqykfo_HttfoxbBj_YAb8x6iAztFw3e5N2lal_1ubE8hRAXJgqm7RAd9dDNRAFw5Pov2Uyxra7zY0=w2880-h832`,
    imageAltText: `profile image`,
    work: '12th completed',
  },
  {
    id: v4(),
    title: `Eshan Mishra`,
    content: `I'm extremely grateful to be part of The Boring Education as a learner, acquiring valuable web development skills.`,
    image: `https://lh3.googleusercontent.com/fife/AKsag4PK32ik7iw1wFlLdeWtTzz2cXNLRn21TDR3ooJNdG2Z53GLPfT3iEBOqlfrOHnCtq2bmecvvgjyyLrY1d8fSF-VxEr7Hc6BQ5Bx9BGSxXSqb7MXnG88-VpizD43cZVcvnydIycyno5GpbQYx0Z98JTo4QCN5eld2EnZy-rnj6KLknibVEn-gapBsIUsf5lhAPaVNJTHoC4Sv4yncEpJCzlzO5NY8X1s7wMz-ShMmcrDzALxdCRhrpHY_-5l2gaZvjAwj8RwrejznvrK_m29wTGZS-FCEGQvP_D3LdGx48Nc9HF--wi9Btr8zLZcULaAa43IYxVm35ehUlBZ7Hd0BHrxzeCZ6JQmjTpE8mHbeANdqAOXuK_OehQJN8_0ehY-dpCs_HX-YQExjQaO-Ov-wNMFUDuORtGnhmHqMA5Z0h_w1CL-uNuoRNOKfkv6IHOA85NEXXs4c-3JAdtB9JfeJzFEKs6OeOk_i36-xTqjYdm9W2ucAg56HzPAvo7ziHbob0vDc0BwAthAdXC8FVaxTBryTIPk_tZQuPV_IV65WvPQ_WSwT6a57PTmvgm4fJ2r3x7PXFn_Bjkwx1DbSKh6LSWLbVRoR241_qLgXzKtGLCserCwAyw57AgJmwLDZiY4Z1Wsx86tgyCD1R7Hp5HZIE7w3MAYvJvP8Wqd8ZZ7fnzkYu4cwDJ4Br5GvKSY6vAarHq5xKmGbTL4btBGZ9Hq777YIJxy-5M0aML8rCiK1slyRQI1Y7SKl0RmqfDb3oe3AMrh7hzfZq1mZYwpdWr_OSDTVsJwWxfak9UodPofQLOvajlGoXtr372lq_GwnUVM5Zck5U6jzxjEoMYJ3m-yoYG-DAgyKKVpNGSHzlw5OT_xT6BY56pR9yyByH28doMqc8sZZiMkZu6zCSHrT9yRUxYmmLr6LZaRSU2kp9QsVVasBMogUQKDbWFks_Iv45gcD6qz_R-TMxG3R4NxB4BG3ABDvYsvr4tXLd5nfOBIMuyxU19UDMOxt6RnzAxZ5Qa32B388JEs6rUO7Z6qpUgS_2UXCXWl0Ih95snYMzB5vbEvUTHkt4ICW8mM7LWHvapu9OkAQzA0SEsW9cQ06xn2pjT15BRV-OfnQXOz_N5RBFckuROqs-bK6eHNHLSOO9cMw00WsPkvm6NkHrO-9feM9kz4opDddSCGnkbxJqON3PdTFVpD2vU8voswt9baRwPdCoGiqoukE7LDSJgH5HBzeGHosDXE2k-b2vUbqf3NoBF-voAhYctW5YlpRMrTVLt2IlEO2btTs-E4PIvLM7JSDMFSP-t4zPdMHgFG3DQfUJNzUAwwQ7wCiZHVA6KK4d_Sx6Q6JACPgyyWDF1SYwZ2WxdVeHeJrYSXCeH11sO7QGDVG7YokSKg8N8zxvVGAIbbx4ADNn6cJX5d8cx-TD3zlNQKq92vNDCHfY1C1YschFXOfa0beI8xr-Lw0HkXyDQSa6XWHYsRPj9Hn_GFkHB5U6DBaqazLNOjflgzdBY0XOnyhaDjdOeHMYMfWVlA3XA=w2880-h832`,
    imageAltText: `profile image`,
    work: 'College Student',
  },
  {
    id: v4(),
    title: `Kusum Sahani`,
    content: `I'm grateful to be part of The Boring Education as a learner, acquiring Front-end Engineering skills with exceptional faculty.`,
    image: `https://lh3.googleusercontent.com/fife/AKsag4Pobo6ABjwyex_-djSFwArM90QTnSR7ctUJG9_QrpU9GYqvpo56TmLXghD5ffJbPn8hxFyfm59pAVBSH-g0Yrjf4sbqd5nryx8puQqT16TW_xUPtpVtdIhdagnR8BcsOG-XMLJ6925XbTHFAG0KKCpvcPhN6l-8hWEBSUWQzIjNfw5Oqigrf51vamw26mPSiIT5i16jn3NWlW2236GQRyToKCF6fdZ1_4avhrE5-yedMKlyqN_3c8AcRHQsFdYTbCXvzx-H0gPE9ymVih8IbHvyGucnsHAOXBqpwPvD48-f5U8XPkgu8C9eZaNrFV2zUCz8V5rvUdpjAUpILXJA2MiLZuwWwTrSoULmz4sX9-PJSH1xbCZm5Mh1sSYdWAWfnOG-aNqVAm43b215AFmuw_Bp1FyBFiFuHIvNzyIypfEosuEJNbbcQHHxkWeE26JpZOCnkKX3U0tDsLpzL38w50Asskrz6MvKUlG5C9aN6ZRNz9uCB4eb4XtKj2uJborlU7x7Lm-OraSC8so_cKPBW9aJreluOwRfSDW2HGYTJP0w_vt9EsBp8Hci9LnCJLaMKgslEVZrJRSh-hHuUdl5jrGzEhvdasqEYfp6TC1exF4_BP2vYF_329H03uYRzQpnUo1MMNa-Kdf6Pkqr8B3-k_dxPLDq9N_aO6ImK9KwZ9-qyVLZizt3z_ddlT9Gn3B7I-IUAAAiHpxJOoU3t2yd5BQMf4re5r_KdZZzixwJy7J6m7kX9hh8S4HF0kvsj8Zs4gzviuoVImUZjhDHDuWx58FLJgj86VQ-Alfphi19EqeySkS7rbtCND30nnnNoSMNYe1v6y7R6AgoBo9FXGe0P5QtPKzXrTiGQPFeEymwAsm4bUHHb9jxMRKt7JXDWbqp1ZyOb8xWcIVfCWQBKXp0u57L23UXzouCa0e3G2SVAmiuvniLnGqp2OGJXlGz3GoUQjhQ6XkaOPKbuZrHZ1SbXMwSikwiZ5ZU8LpC4QrJg9fR8stEB0n3ADYDomGNJpCt_LEL54QLuJzY5ZVeX9291yWUXFn7Sex8xgXZyELr09YteFTDMPN9mRDQyPdgsYvGwim0L2eHGYdMEQm-BZbyEUDWx54LtqUNiZumvjvCAyiHLjU2cIwJuaB64UIRfSi83ra4RarCoUQZVnQmRYXrNFbByzeBcD6qyucvYTFs-VudRUcHYcKAzkFV-b8wMywu_O1SZWbdrMmOSl-AdW4RA44M7W_sY0BXZAsrbaAvuVM3MyN-Bc-bhCl-j9WPSPnk7PTeqRhLoFYoyNdUDZ3AJINGUPPGVIe3x7AzY1VvSnrz56sBIRz8Dah7BexDk3Dgb3_AnYyJQNzkn7gu6tnOeTy_0sstV2vImEAgZwD5pdXc5u-gRX1nxGGKq2kHWp7D--QvrTPkY3uGr8MzMxop6EO4DApt7h4mRFrhD_WUjqU_AkJg9qx39bhZJGvRny9YjBb3Ezg5fy69jX2L2ana8coiug7CK87ApHW1EagDnZC-Tn4oagNlAY0C50lj0BE=w2880-h1370`,
    imageAltText: `profile image`,
    work: 'College Passed Out',
  },
  {
    id: v4(),
    title: `Nikhil Maurya`,
    content: `The Boring workshop made UI design easy and accessible. They explained complex concepts in a simple and understandable manner.`,
    image: `https://lh3.googleusercontent.com/fife/AKsag4MlSUjVDX_Uf72nEDH8PzR9xzt8e9YCjMkf2ky4gvmgHFHBBXfaeyG3dan3ljuOYGtflmH9bkbBeVJimXYW1DId2CYYE-S-vK7pFWAEO7kslxtkM1VfPIXqvJSfZgyKugCf0vO2nH3rkzSNHOlfVqCkgBYiWqsHtqXXshwBxsS5BcX1IWxN8_Xbc3qePGl8Ls4zh1yszNKiwejmoCoab0m1M5UALZ5kish8qGC714OamOdbvNmhDOdwOtAG0vxjjoyV2gnpDO08cA50_QyxhZdfDXQiU6AvoOC_j020qbY_M5HvyJPVGcU--7NtS7aG2hjZNqNpw2d3FDAQaJohmfLPeezDsNGQScmE-6KFvoTsny8SjIzZ0R9yEPDALnRWAs5eFXLfSEHJU1Zkzp4AlCuDe7tVVM2s5XY9mvxo3DsK4bBTVaL-gFXx7qfp-kY5zPDtl8u2YmkXip5va9PSUwZqOiE8dPXB7tsjjROPIVQmq32rzZC3O3iKybEkKo2WfcMxgseNQ12F8KwZjSmc6lNEkWLRElR8HO9UOugqe_iLC5rqRMkW64cbqBCFU6ab3rvbCDdf4cbJOeCh6P6fu7XzF-1EweC3anA3tmUv4gCnyFAn_H3wEivUs1dKcDAEmt9b5PJND98TmWlP95KeczVq1VaUYWhlW8GaagUPtymBHqyWht1lEZ0kfn0FBu5NbubX6GhCZ5O3kgIBav1rJT5hoGsCgNGd4ILHwCW-jPi6j-3zRHWgfSRLkzfml1-WFz5MJuHJj5o4d5_FegDAcHuA4MWjXSUIQjm75tl2shSpLds00cYBCjAvjlJ4pwulod3MPzfgs3NMJc63Tpxkw4pobBQ3S_mvRoeNNET-8-_926UFsm-JPp-alI0FWZ0XxRzfMurWOLdfdTeJQn9a_v2X1pegjF4Eo2kATtH8ul1Qdzn_4Xa6Fr7h4O5CGMBzd1dzxCyS7ejTG9BY-0vdsNp0lPV71ShBhtVS3lRMcT9mAGBap6GL72QZdOgNViq_nLfjkgS0alEjcZQQ6qAglTp6v87uW8E-812id7lydd2kum_vAQaIzeTLtXK8PSG7OrFSzyqI3sakd6Tn0D3xjk7SS4_AunqvM_XXLb7yDzNXiwzGm0sir0H96rMHZ03DWZbtNzPUNWHRzj5IQ1tYGRIRqQZrigwMpg6e2ZhqnsfpR3p3uRZ9XWn0HMZqF60bKomc3Ii6vLVqehopAzzybFRYBeTcD0NAv_2kCG0DD5mXvb_AbqCv9whUkcjE48k0OcngDipSE5fKW6aeZM_w1gsGP6sni5zrCrCZ9il8KOTreOcsNfgXTt_qG8SdD3n_4ts8Ih-TL6x0_uTA0ywmGIhBJzLkpZlNTxtwy2LjRCZnbUlAYcjp6-Mco55HVxYADPuuO9NOJxetNKc5FQQaxyvQRHQdm56vE0aRE_-H1953JiwFNadINHzMia1-XpWUVTKz7t34xzVU9aPnKsOUTsWlS1YcI9KIlVrWkfecQq1I85CVqgIgaovT7mtI8Oc=w2880-h832`,
    imageAltText: `profile image`,
    work: 'College Student',
  },
  {
    id: v4(),
    title: `Satish Daraboina`,
    content: `The workshop at The Boring Education elevated my design skills. From Figma basics to creating and connecting screens, I gained hands-on experience to apply in real projects.`,
    image: `https://lh3.googleusercontent.com/fife/AKsag4MwpZNCGvRhxcsvuSU_fMgWi5tT2i0Ks2xl7kwwiRiqbjpvNiZi006AysbCUv_kleL5GP6u2ncqNHT0KfxhpJvyZI53m4OJteix1CBVWu3vnZAKE8wCHX2lz8gZPRHfA05aVJXntv-t6ifXNLTAKGwQR1FxBqbRaQIdV-BCIzQruN2j7pj-wHWWVx_yoCnJx8xW-ejt7dm7P5n80aPrRfro6Ujgafzz25qZ-DyVgt6bguEHsITR3DAXR3dg8vuedApwjMkSKsKcaItt4Lf44vNQq_KANZt7ssLYmeJAkAOcSZEHm4IsalzTWblZNLIiaiBbQ8gVCywQ_VXUdJ4xv10hgQtfuLTU7FdAUf9bK_NmW1lbmK6Vs43zTUf-yBLCK_h7W9uTMY3P3sH2bODd_z6dogm95rKA3qSAIm1f_ERYk4vmpEiOnE5qpY93Gusvr5ljjRHjPM8dZXxqzb4ySqkf85KPiwOmr2ICouhHxtFvFtH3Vdw9yGDKkPNI6WXVXk-NkEKc7yXSLpiuIimhB4qfpreOfbvNGWQzqDf1C9hmssi7AUms_c0Nt_4kVHim9c4G1ud_TSiuGReLpqzOvQBmq-G0WdabB6UJis0GxCguXlnUAl6w7mfdC0uP4lYT0_ii83KsnlPPEjCefs8osoWe_bCw9mpEZuooyGqgUH9Kkfb1hBXnIEYyfEXLoplPtdU6ydiGgBeJh_15YkPG-JbIdYSQR8eJX8OjNCwzjU4046mi91Uo4KHsW8hKc7CXnDcXyFXPYvnWB6K1AonCo8B1NQD8W2HQ7d8c76uJyhtXZOQH74BmOlGClNRoIzrmxU4FjdLBXfT0K3zrbMrHyOU1h8M4BR902raDWYvY4IpxCAPGUxmI3piDFkwbmb6SFpyb-Hti28r0AXAMzQ7W93ud4ruby6A4TnHNUX3i6SWBVH_MZvq9lNhtlMDSlglyOhNMkcZ9WQzikxMuS6fq0F5w-d33s0ePHP_Yrz9nwU8sNcAgc21VkCAts0LbJJ960TY4FCxLjl3iTb7cnwjGPZkwZLM289vFQQGgTTcwVXrM2N7qv035JhKWLkTsedBS62Px9L3nDSdfYtUCFADZ0tQQAo5RtPuxNlsKvG9oIs7KpxLHmRzDM6UOcgVCDyeawjtZdD-_ahySnvvrBFiR7CbitzsKIGz1BicMhUeDGSZe-y6fAr2n0EHXuVmK-6toKIvm8bV6HtBRzRfSTcGgCc3J0PE3cji8spKERjBPR-u5Nc-AsludDkfZn_hzt-xlHT4u_i3dtyiXfD3AFRQ0hnpvaW9NTAX-OHCxKblALB1C8oCk82xT81rmTvrpapb2lZhGfmKl6ib073XBtLNW-MGc6_fQOj60fMfI9rnORCyqltVEmiVb6DM1e5J_ydbDQeIscd3TGioebfn3Y4Rt01eu75vwrL0F7BoBEw2yFrXgLoeixMmZyzp6splK0knkOXS6MjAVuC4jV5ynRCxcZmlrXpgLo5S2WIgBsVHnqP1cO7Bqm4uohfWNfrG2dSo=w2880-h832`,
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

const MICROCAMPS: MicrocampDataProps[] = [
  {
    slug: programs.juniorInWebEngineering.slug,
    header: {
      heading: {
        primary: 'Junior in',
        secondary: 'Web Engineering',
      },
      subheading:
        'Learn Fundamentals of Web dev with industry experts in live sessions.',
      cta: {
        primary: LINKS.juniorInWebEngineeringRegistrationLink,
      },
    },
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
    header: {
      heading: {
        primary: 'Be',
        secondary: 'Front-end Master',
      },
      subheading:
        'Learn Core of Front-end Engineering with Placement Assistance in 8 Weeks.',
      cta: {
        primary: LINKS.bootcamp,
      },
    },
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
};
