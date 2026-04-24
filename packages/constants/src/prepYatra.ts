import type { PrepYatraFeatureSpotlightItem } from "@tbe/types";

export const PREP_YATRA_FEATURE_SPOTLIGHTS: PrepYatraFeatureSpotlightItem[] = [
  {
    id: "prep-logs",
    eyebrow: "Study Tracking",
    title: "Log Your Prep Journey",
    description:
      "Keep track of your daily prep sessions, monitor your progress across different topics, and never lose sight of your learning goals.",
    bullets: [
      "Track time spent on LeetCode, System Design, etc.",
      "Monitor progress and completion rates",
      "Add personal notes and tags to your study sessions",
    ],
    imageSide: "right",
  },
  {
    id: "recruiter-network",
    eyebrow: "Recruiter Contacts",
    title: "Manage Your Network",
    description:
      "Never lose track of your valuable recruiter connections. Organize, manage, and follow up with ease to land your dream job.",
    bullets: [
      "Keep track of active, follow-up, and interviewed contacts",
      "Store email, phone, and company details in one place",
      "Never miss a follow-up with status indicators",
    ],
    imageSide: "left",
  },
  {
    id: "resource-sharing",
    eyebrow: "Community Resources",
    title: "Share & Discover Resources",
    description:
      "Learn from others' interview experiences, access shared study guides, and contribute your own learnings to the community.",
    bullets: [
      "Access verified interview experiences and company guides",
      "Share your own notes and resources",
      "Upvote and bookmark the most helpful content",
    ],
    imageSide: "right",
  },
  {
    id: "public-profile",
    eyebrow: "Public Profile",
    title: "Showcase Your Journey",
    description:
      "Create a public profile that highlights your preparation journey, skills, and readiness to potential recruiters and peers.",
    bullets: [
      "Display your activity graph and consistency",
      "Showcase your completed topics and mock interview scores",
      "Share your profile link with recruiters easily",
    ],
    imageSide: "left",
  },
];

export const PREP_YATRA_FEATURES = [
  {
    title: "Structured Prep",
    content:
      "Organize your interview preparation into manageable, structured logs.",
  },
  {
    title: "Network Management",
    content:
      "Keep all your recruiter contacts and follow-ups in one dashboard.",
  },
  {
    title: "Community Wisdom",
    content:
      "Learn from the interview experiences and resources shared by peers.",
  },
  {
    title: "Public Proof of Work",
    content:
      "Showcase your dedication and consistency with a public prep profile.",
  },
  {
    title: "Analytics & Insights",
    content:
      "Understand your strengths and weaknesses with detailed progress tracking.",
  },
  {
    title: "Interview Readiness",
    content:
      "Know exactly when you're ready for the real interview based on your logs.",
  },
];

export const PREP_YATRA_FAQS = [
  {
    question: "Is Prep Yatra free to use?",
    answer:
      "Yes, the core features of Prep Yatra including prep logs, recruiter networking, and community resources are free to use.",
  },
  {
    question: "Can I share my prep logs with others?",
    answer:
      "Yes! You can choose to make your prep profile and logs public, which is a great way to showcase your dedication to potential recruiters.",
  },
  {
    question: "How does the recruiter contact manager work?",
    answer:
      "It's a simple CRM built specifically for job seekers. You can track names, companies, emails, and follow-up statuses so no opportunity slips through the cracks.",
  },
  {
    question: "Can I import my LeetCode progress?",
    answer:
      "Currently, you can manually log your sessions, but automatic integration with platforms like LeetCode and GitHub is on our roadmap.",
  },
];
