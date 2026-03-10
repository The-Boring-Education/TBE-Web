import type { GetSEOMetaResponseType } from "@tbe/types";

import type {
  BaseInterviewSheetResponseProps,
  BaseShikshaCourseResponseProps,
} from ".";
import type {
  CertificateModel,
  PlaylistModel,
  ProjectDocumentModel,
  UserPlaylistModel,
  WebinarModel,
} from "./database";
import type { UnskilledLandingGraphDataProps } from "./global";

export interface PageProps {
  slug: any;
  isDev?: boolean;
  seoMeta: GetSEOMetaResponseType;
  resolvedUrl?: string;
}

export type ProjectPickedPageProps = Pick<
  ProjectDocumentModel,
  | "_id"
  | "name"
  | "meta"
  | "roadmap"
  | "difficultyLevel"
  | "sections"
  | "requiredSkills"
> & {
  isEnrolled?: boolean;
  _id: string;
};

export interface ProjectPageProps extends PageProps {
  project: ProjectPickedPageProps;
  meta: string;
  currentChapterId: string;
}

export interface PlaylistPageProps extends PageProps {
  playlist: PlaylistPickedPageProps;
  PlaylistId: string;
}

export interface CoursePageProps extends PageProps {
  course: BaseShikshaCourseResponseProps;
  meta: string;
  currentChapterId: string;
}

export interface SheetPageProps extends PageProps {
  sheet: BaseInterviewSheetResponseProps;
  meta: string;
  currentQuestionId: string;
}

export interface WebinarCardProps extends WebinarModel {
  isCompleted: boolean;
}

export interface WebinarsLandingPageProps extends PageProps {
  webinars: WebinarCardProps[];
}

export interface CertificatePageProps extends PageProps {
  certificate: CertificateModel;
}

export interface UnskilledLandingPageProps extends PageProps {
  jobData: {
    jobDomains: UnskilledLandingGraphDataProps[];
    trendingSkills: UnskilledLandingGraphDataProps[];
    companyTypes: UnskilledLandingGraphDataProps[];
    topLocations: UnskilledLandingGraphDataProps[];
    updatedAt: string;
  };
}

export interface CardItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

export type PlaylistPickedPageProps = Pick<
  UserPlaylistModel & { _id: string },
  "_id" | "playlistId" | "isRecommended" | "learningTime"
> &
  Pick<
    PlaylistModel,
    | "playlistName"
    | "description"
    | "thumbnail"
    | "tags"
    | "videos"
    | "referrerBy"
  >;

export interface CohortRoadmapProps {
  week: string;
  title: string;
  description: string;
}

export interface CohortUserCategoryProps {
  key: string;
  label: string;
  data: CohortRoadmapProps[];
  duration: string;
  price: number;
  discount: number;
  slashedPrice: number;
  features: string[];
}
