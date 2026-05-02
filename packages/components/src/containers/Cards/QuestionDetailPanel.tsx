import {
  CommonMistakesSection,
  ConstraintsSection,
  EnhancedExamplesSection,
  ExampleCard,
  FirstPrinciplesSection,
  FlexContainer,
  HowToApproachSection,
  LeetCodeIcon,
  PseudoCodeSection,
  Text,
  WaysToSolveSection,
  WorkingCodeSection,
  YouTubeIcon,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type {
  DsaQuestion,
  DsaSectionTabs,
  QuestionDifficulty,
} from "@tbe/interface";
import { cn, sendRequest } from "@tbe/utils";
import { Check, Crown, Loader2, Save, Sparkles } from "lucide-react";
import markdownit from "markdown-it";
import { useEffect, useState } from "react";

const md = markdownit();

const LOCAL_NOTES_STORAGE_KEY = "dsayatra_question_notes";

const QUESTION_DETAIL_TABS: readonly DsaSectionTabs[] = [
  "description",
  "topics",
  "companies",
  "notes",
] as const;

/** Same key as DsaPrepWorkspace `localNotes[String(id || name)]`. */
function getQuestionStableId(question: DsaQuestion): string {
  return String(question.id ?? question.name);
}

function hasStructuredSections(
  sections: DsaQuestion["sections"],
): sections is NonNullable<DsaQuestion["sections"]> {
  return Boolean(sections && Object.keys(sections).length > 0);
}

function difficultyBadgeClass(level: QuestionDifficulty): string {
  if (level === "EASY") {
    return "bg-green-950/30 text-green-400 border-green-900/50";
  }
  if (level === "MEDIUM") {
    return "bg-yellow-950/30 text-yellow-400 border-yellow-900/50";
  }
  return "bg-red-950/30 text-red-400 border-red-900/50";
}

const mapConstraints = (
  raw: NonNullable<DsaQuestion["sections"]>["constraints"],
) =>
  (raw || []).map((c) => ({
    constraint: c.constraint,
    plainMeaning: c.plain_meaning,
    implication: c.implication,
  }));

const mapExamples = (raw: NonNullable<DsaQuestion["sections"]>["examples"]) =>
  (raw || []).map((e) => ({
    label: e.label,
    input: e.input,
    output: e.output,
    explanation: e.explanation,
    stepByStep: e.step_by_step,
  }));

const mapApproaches = (
  raw: NonNullable<DsaQuestion["sections"]>["ways_to_solve"],
) =>
  (raw || []).map((a) => ({
    approachNumber: a.approach_number,
    name: a.name,
    description: a.description,
    timeComplexity: a.time_complexity,
    timeReason: a.time_reason,
    spaceComplexity: a.space_complexity,
    spaceReason: a.space_reason,
    verdict: a.verdict,
    verdictLabel: a.verdict_label,
  }));

const mapSteps = (
  raw: NonNullable<DsaQuestion["sections"]>["how_to_approach"],
) =>
  (raw?.steps || []).map((s) => ({
    stepNumber: s.step_number,
    heading: s.heading,
    body: s.body,
  }));

const mapAnnotations = (
  raw: NonNullable<DsaQuestion["sections"]>["pseudo_code"],
) =>
  (raw?.annotations || []).map((a) => ({
    lineReference: a.line_reference,
    note: a.note,
  }));

const mapMistakes = (
  raw: NonNullable<DsaQuestion["sections"]>["common_mistakes"],
) =>
  (raw || []).map((m) => ({
    mistakeNumber: m.mistake_number,
    title: m.title,
    wrongCode: m.wrong_code,
    explanation: m.explanation,
    fix: m.fix,
  }));

function ExternalResourceIcons({
  resources,
  className,
  iconClassName = "w-5 h-5",
}: {
  resources?: DsaQuestion["resources"];
  className?: string;
  iconClassName?: string;
}) {
  if (!resources?.leetcodeURL && !resources?.youtubeURL) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {resources.leetcodeURL && (
        <a
          href={resources.leetcodeURL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 opacity-90 hover:opacity-100"
          title="LeetCode Problem"
        >
          <LeetCodeIcon className={iconClassName} />
        </a>
      )}
      {resources.youtubeURL && (
        <a
          href={resources.youtubeURL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 opacity-90 hover:opacity-100"
          title="YouTube Explanation"
        >
          <YouTubeIcon className={iconClassName} />
        </a>
      )}
    </div>
  );
}

function RealWorldBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-yellow-950/20 to-amber-950/30 px-4 py-3 flex items-center gap-3 shadow-[0_0_24px_rgba(251,191,36,0.06)]">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-amber-400/60 to-transparent rounded-l-xl" />
      <Crown
        className="w-4 h-4 shrink-0"
        style={{ color: "rgba(251,191,36,0.8)" }}
        strokeWidth={1.5}
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-black uppercase tracking-widest text-amber-300/90">
          Real-World Problem
        </span>
        <span className="text-[11px] text-amber-200/40 font-medium leading-relaxed">
          This problem is inspired by real world. To make the problem more
          challenging and realistic.
        </span>
      </div>
    </div>
  );
}

function StructuredSections({
  sections,
}: {
  sections: NonNullable<DsaQuestion["sections"]>;
}) {
  return (
    <div className="space-y-10 divide-y divide-gray-800/50 [&>*]:pt-8 [&>*:first-child]:pt-0">
      {sections.first_principles && (
        <FirstPrinciplesSection
          paragraphs={sections.first_principles.paragraphs}
          keyObservation={sections.first_principles.key_observation}
        />
      )}

      {sections.constraints && sections.constraints.length > 0 && (
        <ConstraintsSection
          constraints={mapConstraints(sections.constraints)}
        />
      )}

      {sections.examples && sections.examples.length > 0 && (
        <EnhancedExamplesSection examples={mapExamples(sections.examples)} />
      )}

      {sections.ways_to_solve && sections.ways_to_solve.length > 0 && (
        <WaysToSolveSection
          approaches={mapApproaches(sections.ways_to_solve)}
        />
      )}

      {sections.how_to_approach?.steps &&
        sections.how_to_approach.steps.length > 0 && (
          <HowToApproachSection steps={mapSteps(sections.how_to_approach)} />
        )}

      {sections.pseudo_code?.code && (
        <PseudoCodeSection
          code={sections.pseudo_code.code}
          annotations={mapAnnotations(sections.pseudo_code)}
        />
      )}

      {sections.working_code?.languages && (
        <WorkingCodeSection
          defaultLanguage={sections.working_code.default_language}
          languages={sections.working_code.languages}
        />
      )}

      {sections.common_mistakes && sections.common_mistakes.length > 0 && (
        <CommonMistakesSection
          mistakes={mapMistakes(sections.common_mistakes)}
        />
      )}
    </div>
  );
}

function FallbackMarkdownDescription({ question }: { question: DsaQuestion }) {
  return (
    <>
      <div className="space-y-2 pb-3 border-b border-gray-700 w-full">
        <div
          className="text-gray-300 leading-relaxed text-sm prose prose-invert max-w-none prose-p:my-1 prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-white prose-pre:bg-[#111] prose-pre:border prose-pre:border-gray-800"
          dangerouslySetInnerHTML={{
            __html: md.render(question.answer || ""),
          }}
        />
      </div>

      {question.examples && question.examples.length > 0 && (
        <div className="space-y-4 pt-2">
          {question.examples.map((example, index) => (
            <ExampleCard
              key={example._id || index}
              index={index}
              inputText={example.inputText}
              outputText={example.outputText}
              explanation={example.explanation}
              image={example.image}
            />
          ))}
        </div>
      )}

      {question.constraints && question.constraints.length > 0 && (
        <div className="space-y-2 pt-1">
          <Text
            level="h2"
            className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default"
          >
            Constraints
          </Text>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-2.5">
            <ul className="list-disc pl-4 space-y-1">
              {question.constraints.map((constraint, index) => (
                <li
                  key={index}
                  className="text-gray-300 text-xs font-mono leading-relaxed"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: md.renderInline(constraint),
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

interface QuestionDetailProps {
  question: DsaQuestion | null;
  onNoteSaveSuccess?: (note: string) => void;
}

const QuestionDetailPanel = ({
  question,
  onNoteSaveSuccess,
}: QuestionDetailProps) => {
  const { user, isAuth } = useUser();
  const [activeTab, setActiveTab] = useState<DsaSectionTabs>("description");
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (question) {
      setNoteText(question.notes ?? "");
      setSaveSuccess(false);
    }
  }, [question]);

  if (!question) {
    return (
      <div className="text-gray-500 text-sm">
        Select a question from the left to view details.
      </div>
    );
  }

  const structured = question.sections;
  const hasStructured = hasStructuredSections(structured);
  const isRecommended = (question._priorityScore ?? 0) > 0;
  const showNotesTabDot = noteText.trim().length > 0;

  const handleSaveNote = async () => {
    if (!isAuth || !user?.id) return;
    const qId = getQuestionStableId(question);

    setIsSavingNote(true);
    setSaveSuccess(false);

    try {
      const localNotesData = localStorage.getItem(LOCAL_NOTES_STORAGE_KEY);
      const localNotes = localNotesData ? JSON.parse(localNotesData) : {};
      localNotes[qId] = noteText;
      localStorage.setItem(LOCAL_NOTES_STORAGE_KEY, JSON.stringify(localNotes));

      const response = await sendRequest({
        url: `${routes.api.base}${routes.api.dsaQuestionNote}`,
        method: "POST",
        body: {
          userId: user.id,
          questionId: qId,
          notes: noteText,
        },
      });

      if (response.status) {
        setSaveSuccess(true);
        onNoteSaveSuccess?.(noteText);
        question.notes = noteText;
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save note", error);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <FlexContainer
      direction="col"
      className="text-white space-y-5 h-full relative"
      fullWidth
      itemCenter={false}
      justifyCenter={false}
      wrap={false}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex flex-col gap-1">
              {isRecommended && (
                <div className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> Recommended for you
                </div>
              )}
              <Text level="h1" className="text-2xl font-bold tracking-tight">
                {question.name}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0",
                  difficultyBadgeClass(question.difficultyLevel),
                )}
              >
                {question.difficultyLevel}
              </span>
            </div>
          </div>

          {!question.isRealWorldProblem && (
            <ExternalResourceIcons
              resources={question.resources}
              className="shrink-0 pt-1"
            />
          )}
        </div>

        {question.isRealWorldProblem && <RealWorldBanner />}

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {QUESTION_DETAIL_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-all duration-200 font-medium whitespace-nowrap",
                activeTab === tab
                  ? "border-red-500 text-red-400 bg-red-950/30"
                  : "border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-gray-200",
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "notes" && showNotesTabDot && (
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === "description" && (
          <div className="space-y-4 w-full">
            {hasStructured && structured ? (
              <StructuredSections sections={structured} />
            ) : (
              <FallbackMarkdownDescription question={question} />
            )}

            {!hasStructured && !question.isRealWorldProblem && (
              <div className="space-y-1.5 pt-1">
                <Text level="h2" className="text-red-500 font-bold text-sm">
                  Resources
                </Text>
                <div className="bg-[#111] border border-gray-800 rounded-lg p-1.5 flex gap-4 items-center justify-center w-fit min-w-[120px]">
                  <ExternalResourceIcons
                    resources={question.resources}
                    className="gap-4 justify-center"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "topics" && (
          <div>
            <Text level="h2" className="text-red-500 font-semibold mb-3">
              TOPICS
            </Text>
            <div className="flex flex-wrap gap-2">
              {question.topics?.map((topic) => (
                <Text
                  level="span"
                  key={topic}
                  className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300"
                >
                  {topic}
                </Text>
              )) ?? (
                <Text level="p" className="text-gray-500 text-sm">
                  No topics available.
                </Text>
              )}
            </div>
          </div>
        )}

        {activeTab === "companies" && (
          <div>
            <Text level="h2" className="text-red-500 font-semibold mb-3">
              COMPANIES
            </Text>
            <FlexContainer
              className="gap-2"
              justifyCenter={false}
              itemCenter={false}
              wrap
            >
              {question.companyType?.map((company) => (
                <Text
                  level="span"
                  key={company}
                  className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300"
                >
                  {company}
                </Text>
              )) ?? (
                <Text level="p" className="text-gray-500 text-sm">
                  No companies available.
                </Text>
              )}
            </FlexContainer>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text level="h2" className="text-red-500 font-semibold">
                YOUR NOTES
              </Text>
              {isAuth ? (
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 text-white text-[11px] font-bold rounded-md transition-all uppercase tracking-wider shadow-lg shadow-red-900/20"
                >
                  {isSavingNote ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  {isSavingNote
                    ? "Saving..."
                    : saveSuccess
                      ? "Saved!"
                      : "Save Note"}
                </button>
              ) : (
                <div className="text-[10px] text-gray-500 font-bold uppercase">
                  Login to save notes
                </div>
              )}
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Jot down your logic, edge cases, or anything you want to remember about this problem..."
              className="w-full h-64 bg-[#111] border border-gray-800 rounded-xl p-4 text-gray-300 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all resize-none scrollbar-thin-grey placeholder:text-gray-700"
            />

            {!isAuth && (
              <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-xl">
                <Text
                  level="p"
                  className="text-xs text-red-400 leading-relaxed"
                >
                  <strong>Wait!</strong> You need to be logged in to sync your
                  notes across devices. Otherwise, they won&apos;t be saved
                  permanently.
                </Text>
              </div>
            )}
          </div>
        )}
      </div>
    </FlexContainer>
  );
};

export default QuestionDetailPanel;
