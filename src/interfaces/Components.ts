import type {
  ChangeEvent,
  ElementType,
  HTMLInputTypeAttribute,
  MouseEventHandler,
  ReactNode,
  RefObject,
} from 'react';
import type { BaseShikshaCourseResponseProps,  } from '@/interfaces';
import type { FeedbackType } from '@/constant';

import type {
  CertificateType,
  CohortRoadmapProps,
  GetSEOMetaResponseType,
  QuestionFrequencyType,
  TopNavbarLinkProps,
} from '.';

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  isDev?: boolean;
}

export interface LinkProps {
  children?: ReactNode;
  className?: string;
  href: string;
  target?: '_blank' | '';
  active?: boolean;
  scroll?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface TextProps {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';
  children: ReactNode;
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
  variant: 'PRIMARY' | 'OUTLINE' | 'GHOST' | 'SUCCESS' | 'SECONDARY';
  className?: string;
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  isLoading?: boolean;
  animationClasses?: string;
  icon?: React.ReactNode;
  isFullWidth?: boolean;
}

export interface PageLayoutProps {
  children: ReactNode;
}

export interface SectionHeaderProps {
  heading: string;
  focusText: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  flexContainerProps?: FlexContainerProps;
  subtext?: string;
}

export interface CardSectionContainerProps {
  children: ReactNode;
  isWidthFull?: boolean;
  className?: string;
  gap?: string;
}

export interface GradientContainerProps {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
  childrenClassName?: string;
}

export interface PrimaryCardProps {
  id?: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PortfolioCardProps {
  index: number;
  imageUrl: string;
  title: string;
  description: string;
}

export interface PortfolioTemplateProps {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  repo: string;
  developer: {
    name: string;
    link: string;
  };
  previewLink: string;
}

export interface FlexContainerProps {
  children?: ReactNode;
  itemCenter?: boolean;
  justifyCenter?: boolean;
  className?: string;
  direction?: 'row' | 'col';
  wrap?: boolean;
  fullWidth?: boolean;
  id?: string;
  disabled?: boolean;
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
  target?: '_blank';
}

export interface FooterLinksContainerProps {
  title: string;
  urls: FooterLinkProps[];
}

export interface GridContainerProps {
  children: ReactNode;
  className?: string;
}

export type GenerateSectionPathProps = {
  basePath: string;
  sectionID: string;
};

export interface SEOProps {
  seoMeta: GetSEOMetaResponseType;
}

export interface PillProps {
  text: string;
  variant: 'PRIMARY' | 'SECONDARY' | 'GHOST';
  textStyleClasses?: string;
  containerClasses?: string;
  widthFull?: boolean;
}

export interface IconPillProps {
  iconPath: string;
  iconAltText: string;
  label: string;
  className?: string;
  backgroundColor?: string;
  labelColor?: string;
}

export interface WeTaughtAtCardProps {
  image: string;
  imageAltText: string;
}

export interface PopoverContainerProps {
  label: string;
  children: ReactNode;
  panelClasses?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export interface ImageLinkProps {
  linkProps: LinkProps;
  imageProps: ImageContainerProps;
}

export interface SelectInputProps {
  list: any[];
  onChange: (value: string) => void;
  selectedItem: string;
  className?: string;
}

export interface InputFieldContainerProps {
  label: string;
  type: HTMLInputTypeAttribute;
  onChange: (value: string) => void;
  className?: string;
  value?: string;
  labelClass?: string;
  isOptional?: boolean;
}

export interface LoadingSpinnerProps {
  height?: number;
  width?: number;
  marginClass?: string;
  className?: string;
  borderColour?: string;
}

export interface NavbarDropdownContainerProps {
  links: TopNavbarLinkProps[];
}

export interface MobileNavbarLinksContainerProps {
  title: string;
  links: TopNavbarLinkProps[];
  onLinkClick: () => void;
}

export interface PrimaryCardWithCTAProps {
  id: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  href: string;
  active?: boolean;
  ctaText?: string;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
  target?: '_blank';
  launchingOn?: string;
}

export interface LandingPageHeroProps {
  sectionHeaderProps: SectionHeaderProps;
  primaryButton: ReactNode;
  secondaryButton?: ReactNode;
  backgroundImageUrl: string;
  heroText: string;
}

interface BaseCardContainerProps {
  heading: string;
  focusText: string;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
  subtext?: string;
}

export interface CardContainerAProps extends BaseCardContainerProps {
  cards: PrimaryCardProps[];
  subtext?: string;
}

export interface CardContainerBProps extends BaseCardContainerProps {
  cards: PrimaryCardWithCTAProps[];
  id?: string;
  sectionClassName?: string;
}

export interface RadioButtonOptionsProps {
  label: string;
  value: string;
}

export interface UserLevel {
  name: string;
  value: string;
  minPoints: number;
  level: number;
}

export interface InputRadioContainerProps {
  radioItems: RadioButtonOptionsProps[];
  onChange: (itemId: string) => void;
  selectedItemValue?: string;
  className?: string;
}

export interface CheckboxGroupProps {
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export interface RadioInputFieldProps extends RadioButtonOptionsProps {
  onChange: (itemId: string) => void;
  selected?: boolean;
  className?: string;
}

export interface ProjectHeroMetaContainerProps {
  subtitle: string;
  title: string;
  titleClassName?: string;
}

export interface ProjectHeroContainerProps {
  id: string;
  name: string;
  roadmap: string;
  difficultyLevel: string;
  isEnrolled?: boolean;
}

export interface LevelInfoProps {
  level: number;
  pointsNeeded: number;
  currentLevel: string;
  nextLevel: string;
}
export interface CourseHeroContainerProps {
  name: string;
  isEnrolled?: boolean;
  id: string;
  isPremium:boolean
}

export interface SheetHeroContainerProps {
  name: string;
  isEnrolled?: boolean;
  id: string;
}

export interface AccordionProps {
  title: string;
  children: ReactNode;
  open?: boolean;
}

export interface AccordionLinkItemProps {
  label: string;
  href: string;
  className?: string;
  isCompleted?: boolean;
  isActive: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export interface MDXContentProps {
  mdxSource: string;
}

export interface LoginWithGoogleBtnProps {
  text?: string;
}

export interface ChapterLinkProps {
  href: string;
  chapterId: string;
  name: string;
  content: string;
  isCompleted: boolean;
  currentChapterId: string;
  handleChapterClick: (content: string) => void;
  isLocked?: boolean;
}

export interface QuestionLinkProps {
  href: string;
  questionId: string;
  title: string;
  question: string;
  isCompleted: boolean;
  currentQuestionId: string;
  handleQuestionClick: (question: string) => void;
  frequency: QuestionFrequencyType;
}

export interface MDXRendererProps {
  mdxSource: string;
  actions?: ReactNode[];
}

export interface AlertProps {
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  className?: string;
}

export interface LinerProgressBarProps {
  totalChapters: number;
  completedChapters: number;
}

export interface CertificateBannerProps {
  backgroundColor: string;
  heading: string;
  subtext: string;
  icon: ElementType;
  isLocked: boolean;
  onClick?: () => void;
}

export interface CertificateContentProps {
  userName: string;
  courseName: string;
  date: string;
  type: CertificateType;
  certificateRef: RefObject<HTMLDivElement>;
}

export interface BackgroundImageProps {
  bannerImageUrl: string;
  classNames?: string;
}

export interface BannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  variant?: 'VARIANT_A' | 'VARIANT_B';
}

export interface ActionBannerProps {
  backgroundColor: string;
  heading: string;
  subtext: string;
  icon: React.ElementType;
  isLocked: boolean;
  onClick: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  children: ReactNode;
}

export interface CertificateModalProps {
  isOpen: boolean;
  closeModal: () => void;
  courseName: string;
  certificateId: string;
}

export interface ToggleButtonProps {
  options: string[];
  activeColor: string;
  inactiveColor: string;
  onToggle: (activeOption: string) => void;
  textColors?: string[];
}

export interface PlaylistCardProps {
  title: string;
  description: string;
  thumbnail: string;
  isStartedLearningFromPlaylist?: boolean;
  videoId?: string;
}

export interface PrimaryLongCardProps {
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  href?: string;
  active?: boolean;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
  target?: '_blank';
  launchingOn?: string;
}

export interface PlaylistVideoCardProps {
  title: string;
  image: string;
  imageAltText: string;
  href?: string;
  onClick?: () => void;
}
interface Video {
  title: string;
  thumbnail: string;
  videoId: string;
}

export interface PlaylistVideoTimeCard {
  usertime: number;
  userId: string;
  playlistId: string;
}

export interface PlaylistCantainerCardProps {
  id: string;
  playlistName: string;
  description: string;
  thumbnail: string;
  videos: Video[];
  learningTime?: number;
  isRecommended?: boolean;
  playlistId?: string;
}

export interface MentorshipCardProps {
  heading: string;
  description: string;
  link: string;
}

export interface CarouselProps {
  items: any[];
  renderItem: (item: any) => ReactNode;
}

export interface IconCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  bgColor?: string;
  key: number;
}

export interface HeaderLabelProps {
  label: string;
  className?: string;
}

export interface PlaylistRecommendProps {
  playlistId: string;
  userId: string;
  recommend?: boolean;
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  duration?: number;
  onClose?: () => void;
}

export interface RadioButtonProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface CheckboxButtonProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface RadioGroupProps {
  options: RadioButtonOptionsProps[];
  selectedValue: string | null;
  onChange: (value: string) => void;
}

export interface PlaylistSkillCardProps {
  _id: string;
  thumbnail: string;
  playlistName: string;
  referrerBy: number;
  videos?: Video[];
  noOfVideos: number;
}

export interface ExploreCantainerCardProps {
  heading: string;
  focusText: string;
  subtext: string;
  isCenterAligned?: boolean;
}

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export interface TabProps {
  tabLabels: string[];
  tabPanels: React.ReactNode[];
}

export interface ProgressRingProps {
  progress: number;
  point: number;
}

export interface LevelProgressCardProps {
  points: number;
  currentLevel: number;
  currentLevelName: string;
  nextLevelName?: string;
  pointsLeftToNextLevel: number;
  percentageProgress: number;
}

export interface LoginRedirectButtonProps {
  text?: string;
  className?: string;
}

export interface OnboardingLayoutProps {
  children: ReactNode;
}

export interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export interface StepNavigationProps {
  currentStep: number;
  isValid: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export interface StepOccupationProps {
  value: string;
  onChange: (value: string) => void;
}

export interface StepPhoneNumberProps {
  countryCode: string;
  phoneNumber: string;
  onChangeCode: (code: string) => void;
  onChangeNumber: (number: string) => void;
}

export interface StepUsageProps {
  selected: string[];
  onChange: (updated: string[]) => void;
}

export type StepUsernameProps = {
  userName: string;
  onChange: (value: string) => void;
  setIsUsernameAvailable: (value: boolean) => void;
};

export interface CohortJourneySectionProps {
  weeks: CohortRoadmapProps[];
}

export interface StarRatingCardProps {
  rating: number;
  onClick: (value: number) => void;
}

export interface FeedbackPopupProps {
  type: FeedbackType;
  refId?: string;
  position?: 'bottom-right' | 'bottom-center';
  onSubmit?: () => void;
}
export interface UploadFileInputProps {
  label?: string;
  file?: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  accept?: '*' | 'pdf';
  className?: string;
  placeholder?: string;
}

export interface CircularProgressBarProps {
  percentage: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  bg?: string;
  className?: string;
}

export interface ResumeEvaluationSectionProps {
  title: string;
  subtitle?: string;
  items: {
    skill?: string;
    name?: string;
    percentage: number;
    frequency?: number;
    count?: number;
  }[];
  colorScheme: {
    text: string;
    ring: string;
    bg: string;
  };
}

export interface PaymentCardProps {
  course: BaseShikshaCourseResponseProps;
  onClose: () => void;
  productType:string;
}