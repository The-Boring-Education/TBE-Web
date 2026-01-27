import { BookOpen, Code, FileText, Clipboard, Users, Briefcase, ClipboardList } from "lucide-react";

export interface ResourceItem {
  title: string;
  desc: string;
  href: string;
  Icon: any;
  isAvailable: boolean;
}

export const CAMPUS_PREP_RESOURCES: ResourceItem[] = [
  {
    title: "Aptitude Practice",
    desc: "Daily challenges, streak tracking & top practice links for Quant, Verbal, DI, and Reasoning.",
    href: "/aptitude",
    Icon: BookOpen,
    isAvailable: false
  },
  {
    title: "Quizes",
    desc: "Topic-wise quizes with instant results and performance tracking.",
    href: "/dashboard/quizzes",
    Icon: ClipboardList,
    isAvailable: true
  },
  {
    title: "Interview Prep",
    desc: "CS Fundamentals, HR tips, mock interview questions, and more.",
    href: "/interview-prep",
    Icon: Code,
    isAvailable: false
  },
  {
    title: "DSA Preparation",
    desc: "Playlists, coding sites, and problem sets for hands-on algorithm practice.",
    href: "/dsa",
    Icon: FileText,
    isAvailable: false
  },
  {
    title: "Resume Zone",
    desc: "Live preview builder and free templates for standout resumes.",
    href: "/resume",
    Icon: Clipboard,
    isAvailable: false
  },
  {
    title: "Interview Experiences",
    desc: "Real candidate stories and advice from recent interviews.",
    href: "/experiences",
    Icon: Users,
    isAvailable: false
  },
  {
    title: "Company Hub",
    desc: "Practice company-specific questions, get campus ready.",
    href: "/companies",
    Icon: Briefcase,
    isAvailable: false
  }
];
