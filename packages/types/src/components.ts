/**
 * Component Interface Types
 *
 * Shared component interfaces and props used across TBE platform apps.
 * Includes UI component props, form types, and React-specific interfaces.
 */

import type {
  ChangeEvent,
  CSSProperties,
  ElementType,
  HTMLInputTypeAttribute,
  MouseEventHandler,
  ReactNode,
  RefObject,
} from "react";

import type { CertificateType, QuestionFrequencyType } from "./database";

// ================================
// BASIC COMPONENT PROPS
// ================================

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
  target?: "_blank" | "";
  active?: boolean;
  scroll?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface TextProps {
  level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "label";
  children: ReactNode;
  variant?: "SUCCESS" | "ERROR";
  className?: string;
  textCenter?: boolean;
  style?: CSSProperties;
}

export interface ImageContainerProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fullHeight?: boolean;
  fullWidth?: boolean;
}

export interface LogoProps {
  className?: string;
  isDark?: boolean;
}

// ================================
// BUTTON & LINK COMPONENTS
// ================================

export interface ButtonProps {
  variant:
    | "PRIMARY"
    | "OUTLINE"
    | "GHOST"
    | "SUCCESS"
    | "SECONDARY"
    | "NEUTRAL";
  className?: string;
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  isLoading?: boolean;
  animationClasses?: string;
  icon?: React.ReactNode;
  isFullWidth?: boolean;
  disabled?: boolean;
  animationType?: "DEFAULT" | "BOUNCE" | "GLOW";
}

export interface LinkButtonProps extends LinkProps {
  buttonProps: ButtonProps;
  href: string;
  className?: string;
}

export interface ImageLinkProps {
  linkProps: LinkProps;
  imageProps: ImageContainerProps;
}

export interface LoginRedirectButtonProps {
  text?: string;
  className?: string;
}

export interface LoginWithGoogleBtnProps {
  text?: string;
}

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export interface StarButtonProps {
  isStarred: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  className?: string;
  label?: string;
}

// ================================
// LAYOUT COMPONENTS
// ================================

export interface PageLayoutProps {
  children: ReactNode;
}

export interface FlexContainerProps {
  children?: ReactNode;
  itemCenter?: boolean;
  justifyCenter?: boolean;
  className?: string;
  direction?: "row" | "col";
  wrap?: boolean;
  fullWidth?: boolean;
  id?: string;
  disabled?: boolean;
}

export interface GridContainerProps {
  children: ReactNode;
  className?: string;
}

export interface GradientContainerProps {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
  childrenClassName?: string;
}

export interface CardSectionContainerProps {
  children: ReactNode;
  isWidthFull?: boolean;
  className?: string;
  gap?: string;
}

export interface BackgroundImageProps {
  bannerImageUrl: string;
  classNames?: string;
}

// ================================
// HEADER & SECTION COMPONENTS
// ================================

export interface SectionHeaderProps {
  heading: string;
  focusText: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  flexContainerProps?: FlexContainerProps;
  subtext?: string;
  textCenter?: boolean;
}

export interface ProjectHeroMetaContainerProps {
  subtitle: string;
  title: string;
  titleClassName?: string;
}

export interface HeaderLabelProps {
  label: string;
  className?: string;
}

export interface ExploreCantainerCardProps {
  heading: string;
  focusText: string;
  subtext: string;
  isCenterAligned?: boolean;
}

// ================================
// CARD COMPONENTS
// ================================

export interface PrimaryCardProps {
  id?: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** DSA Yatra landing: alternating text + image placeholder rows */
export interface DsaYatraFeatureSpotlightItem {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  bullets: string[];
  imageSide: "left" | "right";
}

/** Resume Yatra landing: alternating text + interactive visual rows */
export interface ResumeYatraFeatureSpotlightItem {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  bullets: string[];
  imageSide: "left" | "right";
}

/** Prep Yatra landing: alternating text + interactive visual rows */
export interface PrepYatraFeatureSpotlightItem {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  bullets: string[];
  imageSide: "left" | "right";
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
  target?: "_blank";
  launchingOn?: string;
  isPremium?: boolean;
  isPurchased?: boolean;
}

export interface PrimaryLongCardProps {
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  href?: string;
  active?: boolean;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
  target?: "_blank";
  launchingOn?: string;
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

export interface TestimonialCardProps {
  id?: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  work: string;
}

export interface WeTaughtAtCardProps {
  image: string;
  imageAltText: string;
}

export interface IconCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  bgColor?: string;
  index?: number;
}

export interface MentorshipCardProps {
  heading: string;
  description: string;
  link: string;
}

// ================================
// CARD CONTAINER COMPONENTS
// ================================

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

// ================================
// FORM COMPONENTS
// ================================

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

export interface UploadFileInputProps {
  label?: string;
  file?: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  accept?: "*" | "pdf";
  className?: string;
  placeholder?: string;
}

// ================================
// RADIO & CHECKBOX COMPONENTS
// ================================

export interface RadioButtonOptionsProps {
  label: string;
  value: string;
}

export interface InputRadioContainerProps {
  radioItems: RadioButtonOptionsProps[];
  onChange: (itemId: string) => void;
  selectedItemValue?: string;
  className?: string;
}

export interface RadioInputFieldProps extends RadioButtonOptionsProps {
  onChange: (itemId: string) => void;
  selected?: boolean;
  className?: string;
}

export interface RadioButtonProps {
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

export interface CheckboxGroupProps {
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export interface CheckboxButtonProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface ToggleButtonProps {
  options: string[];
  activeColor: string;
  inactiveColor: string;
  onToggle: (activeOption: string) => void;
  textColors?: string[];
}

// ================================
// NAVIGATION COMPONENTS
// ================================

export interface FooterLinkProps {
  id?: string;
  label: string;
  href: string;
  target?: "_blank";
}

export interface FooterLinksContainerProps {
  title: string;
  urls: FooterLinkProps[];
}

export interface TopNavbarLinkProps {
  id: string;
  name: string;
  href: string;
  description?: string;
  target?: "_blank";
  isDevelopment?: boolean;
}

export interface NavbarDropdownContainerProps {
  links: TopNavbarLinkProps[];
}

export interface MobileNavbarLinksContainerProps {
  title: string;
  links: TopNavbarLinkProps[];
  onLinkClick: () => void;
}

export interface NavbarDropdownLink {
  name: string;
  href: string;
  description: string;
  target?: string;
  isDevelopment?: boolean;
}

export interface NavbarDropdownContainerProps {
  links: TopNavbarLinkProps[];
}

export interface NavbarProps {
  username: string;
  onSignOut: () => void;
  userId?: string;
}

// ================================
// PROGRESS & LOADING COMPONENTS
// ================================

export interface LoadingSpinnerProps {
  height?: number;
  width?: number;
  marginClass?: string;
  className?: string;
  borderColour?: string;
  fullPage?: boolean;
  label?: string;
}

export interface LinerProgressBarProps {
  totalChapters: number;
  completedChapters: number;
}

export interface ProgressRingProps {
  progress: number;
  point: number;
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

// ================================
// PILL & BADGE COMPONENTS
// ================================

export interface PillProps {
  text: string;
  variant: "PRIMARY" | "SECONDARY" | "GHOST";
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

export interface GamificationBadgeProps {
  userId?: string;
  className?: string;
}

// ================================
// HERO COMPONENTS
// ================================

export interface LandingPageHeroProps {
  sectionHeaderProps: SectionHeaderProps;
  primaryButton: ReactNode;
  secondaryButton?: ReactNode;
  backgroundImageUrl: string;
  heroText: string;
}

export interface ProjectHeroContainerProps {
  id: string;
  name: string;
  roadmap: string;
  difficultyLevel: string;
  isEnrolled?: boolean;
}

export interface CourseHeroContainerProps {
  name: string;
  isEnrolled?: boolean;
  id: string;
  isPremium?: boolean;
}

export interface SheetHeroContainerProps {
  name: string;
  isEnrolled?: boolean;
  id: string;
  isPremium?: boolean;
  isPurchased?: boolean;
  redirectTo?: string;
  backHref?: string;
  theme?: "dark" | "light";
}

// ================================
// BANNER COMPONENTS
// ================================

export interface BannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  variant?: "VARIANT_A" | "VARIANT_B" | "VARIANT_C";
}

export interface CertificateBannerProps {
  backgroundColor: string;
  heading: string;
  subtext: string;
  icon: ElementType;
  isLocked: boolean;
  onClick?: () => void;
}

export interface ActionBannerProps {
  backgroundColor: string;
  heading: string;
  subtext: string;
  icon: React.ElementType;
  isLocked: boolean;
  onClick: () => void;
}

// ================================
// MODAL COMPONENTS
// ================================

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

export interface PopoverContainerProps {
  label: string;
  children: ReactNode;
  panelClasses?: string;
  isOpen: boolean;
  onToggle: () => void;
}

// ================================
// ACCORDION COMPONENTS
// ================================

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

// ================================
// CHAPTER & QUESTION COMPONENTS
// ================================

export interface ChapterLinkProps {
  href: string;
  chapterId: string;
  name: string;
  content: string;
  isCompleted: boolean;
  currentChapterId: string;
  handleChapterClick: (content: string, chapterId: string) => void;
  isLocked?: boolean;
}

export interface QuestionLinkProps {
  href: string;
  questionId: string;
  title: string;
  question: string;
  isCompleted: boolean;
  isLocked?: boolean;
  currentQuestionId: string;
  handleQuestionClick: (question: string, questionId: string) => void;
  frequency: QuestionFrequencyType;
}

// ================================
// CONTENT COMPONENTS
// ================================

export interface MDXContentProps {
  mdxSource: string;
}

export interface MDXRendererProps {
  mdxSource: string;
  actions?: ReactNode[];
}

export interface AlertProps {
  message: string;
  type: "SUCCESS" | "ERROR" | "INFO";
  className?: string;
}

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  duration?: number;
  onClose?: () => void;
}

// ================================
// CERTIFICATE COMPONENTS
// ================================

export interface CertificateContentProps {
  userName: string;
  courseName: string;
  date: string;
  type: CertificateType;
  certificateRef: RefObject<HTMLDivElement>;
}

// ================================
// PLAYLIST & VIDEO COMPONENTS
// ================================

export interface PlaylistCardProps {
  title: string;
  description: string;
  thumbnail: string;
  isStartedLearningFromPlaylist?: boolean;
  videoId?: string;
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

export interface PlaylistSkillCardProps {
  _id: string;
  thumbnail: string;
  playlistName: string;
  referrerBy: number;
  videos?: Video[];
  noOfVideos: number;
}

// ================================
// CAROUSEL & TAB COMPONENTS
// ================================

export interface CarouselProps {
  items: any[];
  renderItem: (item: any) => ReactNode;
}

export interface TabProps {
  tabLabels: string[];
  tabPanels: React.ReactNode[];
  vertical?: boolean;
}

export interface RepositoryTabBarProps {
  repositories: Array<{
    repo: string;
    name: string;
    url: string;
    description: string;
    language: string;
  }>;
  activeRepository: {
    repo: string;
    name: string;
    url: string;
    description: string;
    language: string;
  };
  onRepositoryChange: (repository: {
    repo: string;
    name: string;
    url: string;
    description: string;
    language: string;
  }) => void;
}

// ================================
// GAMIFICATION COMPONENTS
// ================================

export interface UserLevel {
  name: string;
  value: string;
  minPoints: number;
  level: number;
}

export interface LevelInfoProps {
  level: number;
  pointsNeeded: number;
  currentLevel: string;
  nextLevel: string;
}

export interface LevelProgressCardProps {
  points: number;
  currentLevel: number;
  currentLevelName: string;
  nextLevelName?: string;
  pointsLeftToNextLevel: number;
  percentageProgress: number;
}

export interface CelebrationAnimationProps {
  show: boolean;
  pointsEarned?: number;
  onComplete?: () => void;
}

// ================================
// ONBOARDING COMPONENTS
// ================================

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
  isLoading?: boolean;
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

// ================================
// RATING & FEEDBACK COMPONENTS
// ================================

export interface StarRatingCardProps {
  rating: number;
  onClick: (value: number) => void;
}

export interface FeedbackPopupProps {
  type: string;
  refId?: string;
  position?: "bottom-right" | "bottom-center";
  onSubmit?: () => void;
}

// ================================
// PAYMENT & COMMERCE COMPONENTS
// ================================

export interface PaymentCardProps {
  course: any;
  onClose: () => void;
  productType: string;
}

export interface TopmateServiceCardProps {
  id: string;
  title: string;
  description: string;
  rating?: number;
  isPopular?: boolean;
  icon?: string;
  sessionDuration: string;
  sessionType: string;
  originalPrice: number;
  currentPrice: number;
  topmateLink: string;
  category: "mentorship" | "ebooks" | "events" | "templates" | "bootcamps";
}

// ================================
// RESUME EVALUATION COMPONENTS
// ================================

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

// ================================
// GITHUB COMPONENTS
// ================================

export interface GitHubRepository {
  owner: string;
  repo: string;
  name: string;
  description: string;
  url: string;
  language?: string;
  topics?: string[];
}

export interface GitHubIssuesContainerProps {
  repositories: GitHubRepository[];
  className?: string;
}

export interface OpenSourceStatsProps {
  stats: Array<{
    number: string;
    label: string;
    icon: string;
  }>;
}

export interface OpenSourceBenefitsProps {
  benefits: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

// ================================
// SIMPLE CARD COMPONENTS
// ================================

export interface OutlineCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export interface CardItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

// ================================
// UTILITY COMPONENT TYPES
// ================================

// ================================
// DSA QUESTION COMPONENTS
// ================================

export interface DSAQuestion {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
  order?: number;
  leetcodeLink?: string;
  youtubeSearchLink?: string;
  isRealWorldProblem?: boolean;
}

export interface DSAQuestionSidebarProps {
  questions: DSAQuestion[];
  selected: DSAQuestion;
  onSelect: (question: DSAQuestion) => void;
  className?: string;
}

export interface DSAQuestionDetailsProps {
  question: DSAQuestion;
  className?: string;
  onBack?: () => void;
}

export type GenerateSectionPathProps = {
  basePath: string;
  sectionID: string;
};

// ================================
// STUDY GUIDE COMPONENTS
// ================================

export interface StudyGuideSection {
  id: string;
  label: string;
}

export interface StudyGuideDivider {
  divider: string | null;
}

export type StudyGuideNavItem = StudyGuideSection | StudyGuideDivider;

export interface StudyGuideConfig {
  topic: string;
  sections: StudyGuideNavItem[];
  hasStudyGuide: boolean;
}

export interface StudyGuideNavProps {
  config: StudyGuideConfig;
  activeId: string;
  onSectionClick: (id: string) => void;
  className?: string;
}

export interface StudyGuideReaderProps {
  topic: string;
  sectionId: string;
  className?: string;
}

// ================================
// NAVBAR & FOOTER COMPONENTS
// ================================

export type NavbarVariant =
  | "default"
  | "transparent"
  | "prepyatra"
  | "quizes"
  | "techyatra"
  | "dsayatra"
  | "resume-yatra"
  | "oncampus"
  | "learning"
  | "study-guide"
  | "resources";

export type NavbarSectionVisibility = boolean | string[];

export interface NavbarNavigationConfig {
  issues?: NavbarSectionVisibility;
  cohorts?: NavbarSectionVisibility;
  learn?: NavbarSectionVisibility;
  tools?: NavbarSectionVisibility;
  links?: NavbarSectionVisibility;
}

export interface NavbarVariantConfig {
  branding?: ReactNode;
  productName?: string;
  subText?: string;
  dashboardRoute: string;
  borderClass?: string;
  requiresAuth?: boolean;
  showGamification?: boolean;
  showNotifications?: boolean;
  /** When false, the Login redirect button is hidden (e.g. resources app handles auth via its own CTA). */
  showLoginButton?: boolean;
  navigation?: NavbarNavigationConfig;
  /** Renders a top-nav link immediately before the Tools popover (desktop + mobile). */
  pricingNavLink?: { href: string; label?: string };
  /** Custom accent color for variant (e.g. 'emerald-500' for resources). */
  accentColor?: string;
}

export type FooterVariant =
  | "default"
  | "prepyatra"
  | "quizes"
  | "techyatra"
  | "dsayatra"
  | "resumeyatra"
  | "platform"
  | "oncampus"
  | "resources";

export interface FooterProps {
  variant?: FooterVariant;
  isMini?: boolean;
}

export interface MainNavbarProps {
  variant?: NavbarVariant;
  showFullNavigation?: boolean;
  customBranding?: ReactNode;
  customActions?: ReactNode[];
  dashboardRoute?: string;
  theme?: "light" | "dark";
  totalChapters?: number;
  completedChapters?: number;
  sidebarTitle?: string;
  sidebarContent?: ReactNode;
  showBackButton?: boolean;
  backButtonHref?: string;
  compact?: boolean;
  onSignOut?: () => void;
  userId?: string;
  /** When true, the pricing nav link defined by the variant config is hidden (e.g. user already subscribed). */
  hidePricingLink?: boolean;
}

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export type DsaSectionTabs = "description" | "topics" | "companies" | "notes";
