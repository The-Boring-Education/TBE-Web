import type { Document } from "mongoose";

// Section types for StudyGuide
export type StudyGuideSectionType =
  | "intro"
  | "concept"
  | "pattern"
  | "cheatsheet";

export type StudyGuideDifficulty = "Easy" | "Medium" | "Hard";

export type StudyGuideCodeLanguage =
  | "python"
  | "java"
  | "cpp"
  | "javascript"
  | "go"
  | "pseudocode";

export type StudyGuideCalloutVariant =
  | "info"
  | "success"
  | "warning"
  | "danger";

// Shared sub-types
export interface StudyGuidePrereqCard {
  title: string;
  body: string;
  sortOrder: number;
}

export interface StudyGuideCalloutBox {
  variant: StudyGuideCalloutVariant;
  body: string;
  sortOrder: number;
}

export interface StudyGuideCodeBlock {
  language: StudyGuideCodeLanguage;
  code: string;
  label: string | null;
  sortOrder: number;
}

export interface StudyGuideTableRow {
  isHeader: boolean;
  cells: string[];
}

export interface StudyGuideDryRunStep {
  stepNumber: number;
  description: string;
  arrayState: string | null;
  pointerState: string | null;
  stateLabel: string | null;
  isSolutionFound: boolean;
  highlightedIndexes: number[];
  foundIndexes: number[];
}

export interface StudyGuideSolutionCode {
  language: StudyGuideCodeLanguage;
  code: string;
}

export interface StudyGuidePracticeQuestion {
  name: string;
  difficulty: StudyGuideDifficulty;
  hint: string;
  leetcodeUrl: string;
  youtubeSearch: string;
  sortOrder: number;
}

export interface StudyGuideCheatsheetRow {
  patternName: string;
  triggerWords: string;
  timeComplexity: string;
  spaceComplexity: string;
  coreTrick: string;
  sortOrder: number;
}

export interface StudyGuideCheatsheetQuestion {
  name: string;
  difficulty: StudyGuideDifficulty;
  leetcodeUrl: string;
}

export interface StudyGuideCheatsheetQuestionGroup {
  groupName: string;
  sortOrder: number;
  questions: StudyGuideCheatsheetQuestion[];
}

// Content types (one per section type)
export interface StudyGuideIntroContent {
  pageTitle: string;
  subtitle: string;
  openingParagraph: string;
  prereqCards: StudyGuidePrereqCard[];
  callouts: StudyGuideCalloutBox[];
  howToUseHeading: string;
  howToUseParagraphs: string[];
}

export interface StudyGuideConceptSubsection {
  subheading: string;
  bodyText: string | null;
  tableData: StudyGuideTableRow[] | null;
  codeBlocks: StudyGuideCodeBlock[];
  sortOrder: number;
}

export interface StudyGuideConceptContent {
  pageTitle: string;
  subtitle: string;
  subsections: StudyGuideConceptSubsection[];
}

export interface StudyGuideWorkedExample {
  problemTitle: string;
  problemStatement: string;
  inputExample: string;
  outputExample: string;
  bruteForceDesc: string;
  keyInsight: string;
  dryRunSteps: StudyGuideDryRunStep[];
  solutionCode: StudyGuideSolutionCode[];
  timeComplexity: string;
  timeReason: string;
  spaceComplexity: string;
  spaceReason: string;
  coreTrick: string;
  leetcodeUrl: string;
  youtubeSearch: string;
}

export interface StudyGuidePatternContent {
  pageTitle: string;
  subtitle: string;
  whatIsIt: string;
  triggerPhrases: string[];
  whenNotToUse: string;
  codeTemplates: StudyGuideCodeBlock[];
  visualAscii: string | null;
  workedExample: StudyGuideWorkedExample;
  practiceQuestions: StudyGuidePracticeQuestion[];
}

export interface StudyGuideCheatsheetContent {
  pageTitle: string;
  subtitle: string;
  patternRows: StudyGuideCheatsheetRow[];
  decisionGuide: string;
  questionGroups: StudyGuideCheatsheetQuestionGroup[];
  oneThingToRemember: string[];
}

// Section (nav item or divider)
export interface StudyGuideContentSection {
  id: string | null;
  label: string | null;
  type: StudyGuideSectionType | null;
  isDivider: boolean;
  dividerLabel: string | null;
  sortOrder: number;
  content:
    | StudyGuideIntroContent
    | StudyGuideConceptContent
    | StudyGuidePatternContent
    | StudyGuideCheatsheetContent
    | any;
}

// Top-level document
export interface StudyGuideModel extends Document {
  contentId?: string;
  topicId: string;
  title: string;
  hasGuide: boolean;
  sortOrder: number;
  sections: StudyGuideContentSection[];
  createdAt: Date;
  updatedAt: Date;
}
