import { HTMLInputTypeAttribute, MouseEventHandler, ReactNode } from 'react';
import {
  AddALeadRequestPayload,
  AuthUserType,
  CohortLeadStatus,
  CohortNameType,
  GetSEOMetaResponseType,
  MicrocampOfferingsProps,
  PageSlug,
  SkillProps,
  SkillsProps,
} from '.';

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export interface LinkProps {
  children?: React.ReactNode;
  className?: string;
  href: string;
  target?: 'BLANK';
  active?: boolean;
}

export interface TextProps {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';
  children: React.ReactNode;
  variant?: 'SUCCESS' | 'ERROR';
  className?: string;
  textCenter?: boolean;
}

export interface ImageContainerProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fullHeight?: boolean;
  fullWidth?: boolean;
}

export interface LogoProps {
  className?: string;
  isDark?: boolean;
}

export interface LinkButtonProps extends LinkProps {
  buttonProps: ButtonProps;
  href: string;
  className?: string;
}

export interface ButtonProps {
  variant: 'PRIMARY' | 'OUTLINE' | 'GHOST';
  className?: string;
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  isLoading?: boolean;
}

export interface WorkshopDataProps {
  meta: WorkshopMetaDataProps;
  aboutWorkshop: WorkshopAboutProps;
}

export interface WorkshopMetaDataProps {
  slug: PageSlug | string;
  title: string;
  description: string;
  date: string;
  time: string;
  image: string;
  imageAltText: string;
  instructor: WorkshopInstructorDataProps;
  link: string;
}

export interface WorkshopInstructorDataProps {
  name: string;
  designation: string;
  image: string;
  imageAltText: string;
  about: string[];
}

export interface WorkshopHeaderCountDownProps {
  id: string;
  heading: string;
  timerList: string;
}

export interface WorkshopAboutProps {
  // heading: string;
  // schedule: WorkshopAboutScheduleProps;
  descriptions: string[];
  whatWillYouLearn: string[];
}

export interface WorkshopAboutScheduleProps {
  date: string;
  dateIcon: string;
  dateIconAltText: string;
  time: string;
  timeIcon: string;
  timeIconAltText: string;
}

export interface WorkshopWhatWillYouLearnProps {
  id: string;
  heading: string;
  content: WorkshopWhatWillYouLearnContentProps[];
}

export interface WorkshopWhatWillYouLearnContentProps {
  id: string;
  paragraph: string;
}

export type BestSuitedForType =
  | 'working-professional'
  | 'college-student'
  | 'student';

export interface ChooseTechCohortItem extends RadioOptionProps {
  id: BestSuitedForType;
}

export interface CohortCardProps {
  id: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  href: string;
  active: boolean;
  bestSuitedFor?: BestSuitedForType[];
  isCohort?: boolean;
}

export interface ChooseTechCohortCardProps extends CohortCardProps {
  onSelected: (cohortId: string) => void;
}

export interface PageLayoutProps {
  children: React.ReactNode;
}

export interface SectionHeaderProps {
  heading: string;
  focusText: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export interface CardSectionContainerProps {
  children: React.ReactNode;
  isWidthFull?: boolean;
  className?: string;
  gap?: string;
}

export interface GradientContainerProps {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  childrenClassName?: string;
}

export interface SkillCardProps {
  skilledDetails: SkillProps[];
  title: string;
}

export interface WeGuideDifferentlyCardProps {
  id?: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
}

export interface NotAnotherTechCourseCardProps {
  id?: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
}

export interface FlexContainerProps {
  children?: React.ReactNode;
  itemCenter?: boolean;
  justifyCenter?: boolean;
  className?: string;
  direction?: 'row' | 'col';
  wrap?: boolean;
  fullWidth?: boolean;
  id?: string;
}

export interface WorkshopDescriptionProps {
  paragraphs: string[];
  flexProps: FlexContainerProps;
}

export interface TestimonialCardProps {
  id?: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  work: string;
}

export interface FooterLinkProps {
  id?: string;
  label: string;
  href: string;
  target?: 'BLANK';
}

export interface FooterLinksContainerProps {
  title: string;
  urls: FooterLinkProps[];
}

export interface MicroCampBGGradientContainerProps {
  children: React.ReactNode;
}

export interface MicroCampFeatureCardProps {
  title: string;
  content: string;
}

export interface MicroCampPricingCardProps {
  id: string;
  content: string;
}

export interface TechEducationForEveryoneProps {
  heading: string;
  title: string;
  content: string;
}

export interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export interface OpportunityCardProps {
  id?: string;
  heading: string;
  title: string;
  content: string;
}

export interface WhatWeDoForYouCardProps {
  image: string;
  imageAltText: string;
  title: string;
  content: string;
}

export interface WeToughtAtCardProps {
  id?: string;
  image: string;
  imageAltText: string;
}

export type GenerateSectionPathProps = {
  basePath: string;
  sectionID: string;
};

export interface SEOProps {
  seoMeta: GetSEOMetaResponseType;
}

export interface SkillsContainerProps {
  skills: SkillsProps[];
}

export interface PillProps {
  text: string;
  variant: 'PRIMARY' | 'SECONDARY';
  textStyleClasses?: string;
  containerClasses?: string;
}

export interface CountdownTimerContainerProps {
  date: string;
}

export interface TimerItemProps {
  timer: string;
}

export interface IconPillProps {
  iconPath: string;
  iconAltText: string;
  label: string;
  className?: string;
  backgroundColor?: string;
  labelColor?: string;
}

export interface WorkshopAboutInstructorProps {
  containerClasses?: string;
  imagePath: string;
  imageAltText: string;
  name: string;
  position: string;
  linkedInURL?: string;
}

export interface WeTaughtAtCardProps {
  image: string;
  imageAltText: string;
}

export interface CountdownTimerProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AboutWorkshopContainerProps
  extends WorkshopAboutProps,
    WorkshopMetaDataProps {}

export interface WorkshopRegisterContainerProps {
  link: string;
}

export interface WhatWeDoForYouProps {
  offerings: MicrocampOfferingsProps[];
}

export interface PopoverContainerProps {
  label: string;
  children: ReactNode;
}

export interface MicrocampInstructorProps {
  name: string;
  about: string;
  imageLink: string;
  linkedInProfile: string;
}

export interface ImageLinkProps {
  linkProps: LinkProps;
  imageProps: ImageContainerProps;
}

export interface UserTypeConfig {
  userType: AuthUserType;
  loginUrl?: string;
  redirectTo?: string;
}

export interface CohortLeadCard {
  _id: string;
  name: string;
  email?: string;
  contactNo: string;
  cohortName?: CohortNameType;
  status: CohortLeadStatus;
  profession?: BestSuitedForType;
  school?: string;
  college?: string;
  workExperience?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectInputProps {
  list: any[];
  onChange: (value: string) => void;
  selectedItem: string;
}

export interface RadioOptionProps {
  id: string;
  label: string;
  description?: string;
}

export interface InputRadioContainerProps {
  radioItems: RadioOptionProps[];
  onChange: (itemId: string) => void;
  selectedItemId?: string;
  className?: string;
}

export interface RadioInputFieldProps extends RadioOptionProps {
  onChange: (itemId: string) => void;
  selected?: boolean;
  className?: string;
}

export interface InputFieldContainerProps {
  label: string;
  type: HTMLInputTypeAttribute;
  onChange: (value: string) => void;
  className?: string;
  value?: string;
  isOptional?: boolean;
}

export interface ChooseTechCohortInitialFormDataType
  extends AddALeadRequestPayload {
  profession?: BestSuitedForType | '';
}

export type ChooseTechCohortFormFields =
  | 'name'
  | 'email'
  | 'contactNo'
  | 'profession'
  | 'cohortName'
  | 'school'
  | 'college'
  | 'workExperience'
  | 'all';

export type ChooseTechCohortActionType = {
  type: 'UPDATE_FIELD' | 'RESET_FIELDS';
  value?: string;
  field: ChooseTechCohortFormFields;
};

export interface LoadingSpinnerProps {
  height?: number;
  width?: number;
  marginClass?: string;
  className?: string;
}

export interface ChooseTechCohortProps {
  id?: string;
  headerTitle?: string;
  preSelectedCohortName?: CohortNameType;
}
