import { GetSEOMetaResponseType, PageSlug } from '@/interfaces';
import { routes } from '../routes';
import { programs } from '..';

const commonMeta = {
  type: 'website',
  robots: 'follow, index',
  image: 'https://theboringeducation.com/images/large-og.png',
};

const adminMeta = {
  ...commonMeta,
  robots: 'nofollow, noindex',
};

const getSEOMeta = (basePath: PageSlug): GetSEOMetaResponseType => {
  const meta = {
    '/': {
      title: 'The Boring Education',
      siteName: 'The Boring Education',
      description: 'Tech Education for Everyone',
      url: routes.home,
      keywords:
        'the boring education, boring education, learn frontend engineering, learn webdev, web dev free resources',
      ...commonMeta,
    },
    '/admin': {
      title: 'Admin | The Boring Education',
      siteName: 'Admin | The Boring Education',
      description: 'Tech Education for Everyone',
      url: routes.admin.base,
      ...adminMeta,
    },
    '/shiksha': {
      title: 'Shiksha by The Boring Education',
      siteName: 'Shiksha by The Boring Education',
      description: 'Free Tech Education for Everyone',
      url: routes.shiksha,
      keywords:
        'shiksha, tech shiksha, shiksha by the boring education, boring education, learn frontend engineering, learn webdev, web dev free resources',
      ...commonMeta,
    },
    [programs.juniorInWebEngineering.slug]: {
      title: `${programs.juniorInWebEngineering.label} | The Boring Education`,
      siteName: programs.juniorInWebEngineering.label,
      description: programs.juniorInWebEngineering.description,
      url: routes.microCampLanding(programs.juniorInWebEngineering.slug),
      ...commonMeta,
    },
    [programs.beFrontendMaster.slug]: {
      title: `${programs.beFrontendMaster.label} | The Boring Education`,
      siteName: programs.beFrontendMaster.label,
      description: programs.beFrontendMaster.description,
      url: routes.microCampLanding(programs.beFrontendMaster.slug),
      ...commonMeta,
    },
    [programs.beBackendMaster.slug]: {
      title: `${programs.beBackendMaster.label} | The Boring Education`,
      siteName: programs.beBackendMaster.label,
      description: programs.beBackendMaster.description,
      url: routes.microCampLanding(programs.beBackendMaster.slug),
      ...commonMeta,
    },
    [programs.twoHourDesign.slug]: {
      title: `${programs.twoHourDesign.label} | The Boring Education`,
      siteName: programs.twoHourDesign.label,
      description: programs.twoHourDesign.description,
      url: routes.workshopLanding(programs.twoHourDesign.slug),
      ...commonMeta,
    },
    [programs.theNextWave.slug]: {
      title: `${programs.theNextWave.label} | The Boring Education`,
      siteName: programs.theNextWave.label,
      description: programs.theNextWave.description,
      url: routes.workshopLanding(programs.theNextWave.slug),
      ...commonMeta,
    },
    '/contact': {
      title: 'Contact | The Boring Education',
      siteName: 'The Boring Education',
      description: 'Contact The Boring Education',
      url: routes.contactUs,
      ...commonMeta,
    },
    '/404': {
      title: 'Lost in Boring Space | The Boring Education',
      siteName: 'Lost in Boring Space',
      description: 'Tech Education for Everyone',
      url: routes[404],
      ...commonMeta,
    },
  };

  return meta[basePath];
};

export { getSEOMeta };
