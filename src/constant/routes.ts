import { GenerateSectionPathProps, PageSlug } from '@/interfaces';

const routes = {
  home: '/',
  microCamps: '/micro-camps',
  workshops: '/workshops',
  contactUs: '/contact',
  microCampLanding: function (microCampSlug: PageSlug | string) {
    return this.microCamps + microCampSlug;
  },
  internals: {
    landing: {
      programs: 'programs',
    },
    microCampLanding: {
      explore: 'explore',
    },
    workshops: 'workshops',
  },
  workshopLanding: function (workshopSlug: PageSlug | string) {
    return this.workshops + workshopSlug;
  },
  404: '/404',
};

const generateSectionPath = ({
  basePath,
  sectionID,
}: GenerateSectionPathProps) => {
  return basePath + '#' + sectionID;
};

export { routes, generateSectionPath };
