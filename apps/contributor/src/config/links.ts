import {
  LINKS as TBE_LINKS,
  seoCommonMeta,
  toPlatformUrl,
} from "@tbe/constants";

export const LINKS = {
  joinDevRelAdvocate: TBE_LINKS.joinDevRelAdvocate,
  viewSessionDetails: "https://bit.ly/TBECampusConnect",
  home: toPlatformUrl(""),
  products: toPlatformUrl("/products"),
  community: toPlatformUrl("/community"),
  about: toPlatformUrl("/about"),
  github: seoCommonMeta.github,
  instagram: TBE_LINKS.instagram,
  youtube: TBE_LINKS.youtube,
  linkedin: TBE_LINKS.officialLinkedIn,
};

export const SITE = {
  name: seoCommonMeta.publisher,
  programName: "TBE Contributor Program",
  baseUrl: "https://contributors.theboringeducation.com",
};
