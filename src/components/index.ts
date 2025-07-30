import dynamic from 'next/dynamic';
const ResumeEvaluationSection = dynamic(
  () => import('@/components/containers/Page/UnSkilled/ResumeEvaluationSection')
);
const CircularProgressBar = dynamic(
  () => import('@/components/common/ProgressBar/CircularProgressBar')
);
const UploadFileInput = dynamic(
  () => import('@/components/containers/Forms/UploadFileInput')
);
const NotificationPopover = dynamic(
  () => import('@/components/common/Notification')
);
const FAQSection = dynamic(
  () => import('@/components/containers/Page/Cohort/FAQSection')
);
const InterviewPrepSection = dynamic(
  () => import('@/components/containers/Page/Cohort/InterviewPrepSection')
);
const PrevCohortProjects = dynamic(
  () => import('@/components/containers/Page/Cohort/PrevCohortProjects')
);
const SessionDetailsSection = dynamic(
  () => import('@/components/containers/Page/Cohort/SessionDetailsSection')
);
const CohortJourneyContainer = dynamic(
  () => import('@/components/containers/Page/Cohort/CohortJourneyContainer')
);
const TabComponent = dynamic(() => import('@/components/common/Tab'));
const OutlineCard = dynamic(
  () => import('@/components/containers/Cards/Items/OutlineCard')
);
const ScrollToTopBottomButton = dynamic(
  () => import('@/components/common/Buttons/ScrollToTopBottomButton')
);
const FloatingActionButton = dynamic(
  () => import('@/components/common/Buttons/FloatingActionButton')
);
const Toast = dynamic(() => import('@/components/common/Toast'));
const IconCard = dynamic(
  () => import('@/components/containers/Cards/Items/IconCard')
);
const Carousel = dynamic(() => import('@/components/common/Carousel'));
const HeaderLabel = dynamic(
  () => import('@/components/containers/Page/common/HeaderLabel')
);
const MentorshipCard = dynamic(
  () => import('@/components/containers/Cards/MentorshipCard')
);
const ToggleButton = dynamic(
  () => import('@/components/common/Buttons/ToggleButton')
);
const NotificationContainer = dynamic(
  () => import('@/components/containers/Cards/NotificationContainer')
);
const WebibarCard = dynamic(
  () => import('@/components/containers/Cards/WebibarCard')
);
const Modal = dynamic(() => import('@/components/common/Modal'));
const Banner = dynamic(() => import('@/components/common/Banner'));
const AboutTBE = dynamic(
  () => import('@/components/containers/Cards/AboutTBE')
);
const LinerProgressBar = dynamic(
  () => import('@/components/common/ProgressBar/LinerProgressBar')
);
const CertificateBanner = dynamic(
  () => import('@/components/common/Certificate/CertificateBanner')
);

const CertificateContent = dynamic(
  () => import('@/components/common/Certificate/CertificateContent')
);
const CourseHeroContainer = dynamic(
  () => import('@/components/containers/Page/Course/CourseHeroContainer')
);
const SheetHeroContainer = dynamic(
  () =>
    import('@/components/containers/Page/Interview-sheet/SheetHeroContainer')
);
const Navbar = dynamic(() => import('@/components/layout/Navbar'));
const LinkText = dynamic(() => import('@/components/common/Typography/Link'));
const Text = dynamic(() => import('@/components/common/Typography/Text'));
const ImageContainer = dynamic(
  () => import('@/components/common/Images/Image')
);
const Logo = dynamic(() => import('@/components/common/Images/Logo'));
const Button = dynamic(() => import('@/components/common/Buttons/Button'));
const LinkButton = dynamic(
  () => import('@/components/common/Buttons/LinkButton')
);
const LandingPageHero = dynamic(
  () => import('@/components/containers/Page/common/Hero')
);
const Section = dynamic(() => import('@/components/layout/Section'));
const CardContainerB = dynamic(
  () => import('@/components/containers/Cards/CardContainerB')
);
const PrimaryCardWithCTA = dynamic(
  () => import('@/components/containers/Cards/Items/PrimaryCardWithCTA')
);
const PageLayout = dynamic(() => import('@/components/layout/Page'));
const SectionHeaderContainer = dynamic(
  () => import('@/components/containers/Page/common/SectionHeaderContainer')
);
const CardSectionContainer = dynamic(
  () => import('@/components/containers/Page/common/CardSectionContainer')
);
const GradientContainer = dynamic(
  () => import('@/components/containers/Page/common/GradientContainer')
);
const PrimaryCard = dynamic(
  () => import('@/components/containers/Cards/Items/PrimaryCard')
);
const CardContainerA = dynamic(
  () => import('@/components/containers/Cards/CardContainerA')
);
const FlexContainer = dynamic(
  () => import('@/components/containers/Page/common/FlexContainer')
);
const TestimonialCard = dynamic(
  () => import('@/components/containers/Cards/Items/TestimonialCard')
);
const Testimonials = dynamic(
  () => import('@/components/containers/Cards/Testimonials')
);
const Footer = dynamic(() => import('@/components/layout/Footer'));
const GridContainer = dynamic(
  () => import('@/components/containers/Page/common/GridContainer')
);
const WeAlreadyTaughtAt = dynamic(
  () => import('./containers/Cards/WeAlreadyTaughtAt')
);
const ContactCard = dynamic(
  () => import('./containers/Cards/Items/ContactCard')
);
const PortfolioCard = dynamic(
  () => import('./containers/Cards/Items/PortfolioCard')
);
const PortfolioTemplate = dynamic(
  () => import('./containers/Cards/Items/PortfolioTemplate')
);
const SEO = dynamic(() => import('./layout/SEO'));
const Pill = dynamic(() => import('./common/Pill'));
const IconPill = dynamic(() => import('./common/Pill/IconPill'));
const ImageLink = dynamic(() => import('./common/Images/ImageLink'));
const PopoverContainer = dynamic(
  () => import('./containers/Page/common/PopoverContainer')
);
const NavbarDropdownContainer = dynamic(
  () => import('./containers/Page/common/NavbarDropdownContainer')
);
const SelectInput = dynamic(() => import('./common/Form/SelectInput'));
const RadioInputField = dynamic(() => import('./common/Form/RadioInputField'));
const InputFieldContainer = dynamic(
  () => import('./common/Form/InputFieldContainer')
);
const InputRadioContainer = dynamic(
  () => import('./containers/Forms/InputRadioContainer')
);
const LoadingSpinner = dynamic(() => import('./common/LoadingSpinner'));
const MobileNavbarLinksContainer = dynamic(
  () => import('./containers/Page/common/MobileNavbarLinksContainer')
);
const PageHeroMetaContainer = dynamic(
  () => import('./containers/Page/common/PageHeroMetaContainer')
);
const ProjectHeroContainer = dynamic(
  () => import('./containers/Page/Project/ProjectHeroContainer')
);
const Accordion = dynamic(() => import('./common/Accordion'));
const AccordionLinkItem = dynamic(
  () => import('./common/Accordion/AccordionLinkItem')
);
const MDXRenderer = dynamic(() => import('./common/MDXRenderer'));
const UserAvatar = dynamic(() => import('./common/Images/UserAvatar'));
const UserPointButton = dynamic(
  () => import('./common/Buttons/UserPointButton')
);
const LoginWithGoogleButton = dynamic(
  () => import('./common/Buttons/LoginWithGoogleButton')
);
const LogoutButton = dynamic(() => import('./common/Buttons/LogoutButton'));
const Alert = dynamic(() => import('./common/Alert'));
const MentorshipPlans = dynamic(
  () => import('./containers/Page/Landing/MentorshipPlans')
);
const Community = dynamic(() => import('./containers/Page/Landing/Community'));
const CollegeEventsSection = dynamic(
  () => import('./containers/Page/Landing/CollegeEventsSection')
);
const ChapterLink = dynamic(
  () => import('@/components/common/Learning/ChapterLink')
);
const QuestionLink = dynamic(
  () => import('@/components/common/Learning/QuestionLink')
);
const WebinarHeroContainer = dynamic(
  () => import('@/components/containers/Page/Webinar/WebinarHeroContainer')
);
const BackgroundImage = dynamic(
  () => import('@/components/common/Images/BackgroundImage')
);
const PlaylistCard = dynamic(
  () => import('@/components/containers/Cards/Items/PlaylistCard')
);
const PlaylistContainer = dynamic(
  () => import('@/components/containers/Page/YouFocus/PlaylistContainer')
);
const PlaylistVideoCard = dynamic(
  () => import('@/components/containers/Cards/Items/PlaylistVideoCard')
);

const RadioButtonContainer = dynamic(
  () => import('@/components/containers/Forms/RadioButtonContainer')
);

const RadioButton = dynamic(
  () => import('@/components/common/Form/RadioButton')
);

const PlaylistSkillCard = dynamic(
  () => import('@/components/containers/Cards/PlaylistSkillCard')
);

const ExplorePlaylistContainer = dynamic(
  () => import('@/components/containers/Page/YouFocus/ExplorePlaylistContainer')
);

const UserLevelProgressContainer = dynamic(
  () => import('@/components/containers/Cards/UserLevelProgressContainer')
);

const ProgressRing = dynamic(
  () => import('@/components/containers/Cards/Items/ProgressRing')
);

const ActionBanner = dynamic(
  () => import('@/components/common/Banner/ActionBanner')
);

const LoginRedirectButton = dynamic(
  () => import('@/components/common/Buttons/LoginRedirectButton')
);

const LoginCard = dynamic(
  () => import('@/components/containers/Cards/LoginCard')
);

const CheckboxButton = dynamic(
  () => import('@/components/common/Form/CheckboxButton')
);

const CheckboxButtonContainer = dynamic(
  () => import('@/components/containers/Forms/CheckboxButtonContainer')
);

const OnboardingProgressBar = dynamic(
  () => import('@/components/containers/Page/Onboarding/OnboardingProgressBar')
);

const OnboardingLayout = dynamic(
  () => import('@/components/containers/Page/Onboarding/OnboardingLayout')
);

const StepUsername = dynamic(
  () => import('@/components/containers/Page/Onboarding/StepUsername')
);
const StepOccupation = dynamic(
  () => import('@/components/containers/Page/Onboarding/StepOccupation')
);

const StepUsage = dynamic(
  () => import('@/components/containers/Page/Onboarding/StepUsage')
);
const StepPhoneNumber = dynamic(
  () => import('@/components/containers/Page/Onboarding/StepPhoneNumber')
);

const StepNavigation = dynamic(
  () => import('@/components/containers/Page/Onboarding/StepNavigation')
);

const StartRatingCard = dynamic(
  () => import('@/components/containers/Cards/Items/StarRatingCard')
);

const FeedbackPopup = dynamic(
  () => import('@/components/containers/Cards/FeedbackPopup')
);

const PaymentCard = dynamic(
  () => import('@/components/containers/Cards/PaymentCard')
);

const GitHubIssuesContainer = dynamic(
  () => import('@/components/containers/Cards/GitHubIssuesContainer')
);

const CelebrationAnimation = dynamic(
  () => import('@/components/common/CelebrationAnimation')
);
const GamificationToast = dynamic(
  () => import('@/components/common/GamificationToast')
);

// Admin Components
const AdminLayout = dynamic(() => import('@/components/admin/AdminLayout'));
const AdminTable = dynamic(() => import('@/components/admin/AdminTable'));
const AdminStats = dynamic(() => import('@/components/admin/AdminStats'));
const AdminAreaChart = dynamic(() =>
  import('@/components/admin/AdminCharts').then((mod) => ({
    default: mod.AdminAreaChart,
  }))
);
const AdminBarChart = dynamic(() =>
  import('@/components/admin/AdminCharts').then((mod) => ({
    default: mod.AdminBarChart,
  }))
);
const AdminLineChart = dynamic(() =>
  import('@/components/admin/AdminCharts').then((mod) => ({
    default: mod.AdminLineChart,
  }))
);
const AdminPieChart = dynamic(() =>
  import('@/components/admin/AdminCharts').then((mod) => ({
    default: mod.AdminPieChart,
  }))
);
const StarButton = dynamic(
  () => import('@/components/common/Buttons/StarButton')
);

export {
  AboutTBE,
  Accordion,
  AccordionLinkItem,
  ActionBanner,
  AdminAreaChart,
  AdminBarChart,
  AdminLayout,
  AdminLineChart,
  AdminPieChart,
  AdminStats,
  AdminTable,
  Alert,
  BackgroundImage,
  Banner,
  Button,
  CardContainerA,
  CardContainerB,
  CardSectionContainer,
  Carousel,
  CelebrationAnimation,
  CertificateBanner,
  CertificateContent,
  ChapterLink,
  CheckboxButton,
  CheckboxButtonContainer,
  CircularProgressBar,
  CohortJourneyContainer,
  CollegeEventsSection,
  Community,
  ContactCard,
  CourseHeroContainer,
  ExplorePlaylistContainer,
  FAQSection,
  FeedbackPopup,
  FlexContainer,
  FloatingActionButton,
  Footer,
  GamificationToast,
  GitHubIssuesContainer,
  GradientContainer,
  GridContainer,
  HeaderLabel,
  IconCard,
  IconPill,
  ImageContainer as Image,
  ImageLink,
  InputFieldContainer,
  InputRadioContainer,
  InterviewPrepSection,
  LandingPageHero,
  LinerProgressBar,
  LinkText as Link,
  LinkButton,
  LoadingSpinner,
  LoginCard,
  LoginRedirectButton,
  LoginWithGoogleButton,
  Logo,
  LogoutButton,
  MDXRenderer,
  MentorshipCard,
  MentorshipPlans,
  MobileNavbarLinksContainer,
  Modal,
  Navbar,
  NavbarDropdownContainer,
  NotificationContainer,
  NotificationPopover,
  OnboardingLayout,
  OnboardingProgressBar,
  OutlineCard,
  PageHeroMetaContainer,
  PageLayout,
  PaymentCard,
  Pill,
  PlaylistCard,
  PlaylistContainer,
  PlaylistSkillCard,
  PlaylistVideoCard,
  PopoverContainer,
  PortfolioCard,
  PortfolioTemplate,
  PrevCohortProjects,
  PrimaryCard,
  PrimaryCardWithCTA,
  ProgressRing,
  ProjectHeroContainer,
  QuestionLink,
  RadioButton,
  RadioButtonContainer,
  RadioInputField,
  ResumeEvaluationSection,
  ScrollToTopBottomButton,
  Section,
  SectionHeaderContainer,
  SelectInput,
  SEO,
  SessionDetailsSection,
  SheetHeroContainer,
  StarButton,
  StartRatingCard,
  StepNavigation,
  StepOccupation,
  StepPhoneNumber,
  StepUsage,
  StepUsername,
  TabComponent,
  TestimonialCard,
  Testimonials,
  Text,
  Toast,
  ToggleButton,
  UploadFileInput,
  UserAvatar,
  UserLevelProgressContainer,
  UserPointButton,
  WeAlreadyTaughtAt,
  WebibarCard,
  WebinarHeroContainer,
};
