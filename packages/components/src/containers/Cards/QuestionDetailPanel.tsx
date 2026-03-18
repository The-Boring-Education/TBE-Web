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
import type { DsaQuestion, DsaSectionTabs } from "@tbe/interface";
import markdownit from "markdown-it";
import { useState } from "react";

const md = markdownit();

// ---------------------------------------------------------------------------
// snake_case → camelCase mappers (agent JSON → React props)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface QuestionDetailProps {
  question: DsaQuestion | null;
}

const QuestionDetailPanel = ({ question }: QuestionDetailProps) => {
  const [activeTab, setActiveTab] = useState<DsaSectionTabs>("description");

  if (!question) {
    return (
      <div className="text-gray-500 text-sm">
        Select a question from the left to view details.
      </div>
    );
  }

  const sections = question.sections;
  const hasSections = sections && Object.keys(sections).length > 0;

  return (
    <FlexContainer
      direction="col"
      className="text-white space-y-5 h-full relative"
      fullWidth
      itemCenter={false}
      justifyCenter={false}
      wrap={false}
    >
      {/* Header: Title + Difficulty + Resources */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Text level="h1" className="text-2xl font-bold tracking-tight">
              {question.name}
            </Text>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                question.difficultyLevel === "EASY"
                  ? "bg-green-950/30 text-green-400 border-green-900/50"
                  : question.difficultyLevel === "MEDIUM"
                    ? "bg-yellow-950/30 text-yellow-400 border-yellow-900/50"
                    : "bg-red-950/30 text-red-400 border-red-900/50"
              }`}
            >
              {question.difficultyLevel}
            </span>
          </div>

          {/* Inline resource links */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            {question.resources?.leetcodeURL && (
              <a
                href={question.resources.leetcodeURL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 opacity-90 hover:opacity-100"
                title="LeetCode Problem"
              >
                <LeetCodeIcon className="w-5 h-5" />
              </a>
            )}
            {question.resources?.youtubeURL && (
              <a
                href={question.resources.youtubeURL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 opacity-90 hover:opacity-100"
                title="YouTube Explanation"
              >
                <YouTubeIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-1.5">
          {["description", "topics", "companies"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as DsaSectionTabs)}
              className={`px-2.5 py-1.5 text-xs rounded-full border transition-all duration-200 font-medium ${
                activeTab === tab
                  ? "border-red-500 text-red-400 bg-red-950/30"
                  : "border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === "description" && (
          <div className="space-y-4 w-full">
            {/* ----------------------------------------------------------- */}
            {/* RICH SECTIONS (agent-generated) — shown when available       */}
            {/* ----------------------------------------------------------- */}
            {hasSections ? (
              <div className="space-y-10 divide-y divide-gray-800/50 [&>*]:pt-8 [&>*:first-child]:pt-0">
                {/* 1. First Principles */}
                {sections.first_principles && (
                  <FirstPrinciplesSection
                    paragraphs={sections.first_principles.paragraphs}
                    keyObservation={sections.first_principles.key_observation}
                  />
                )}

                {/* 2. Constraints */}
                {sections.constraints && sections.constraints.length > 0 && (
                  <ConstraintsSection
                    constraints={mapConstraints(sections.constraints)}
                  />
                )}

                {/* 3. Examples */}
                {sections.examples && sections.examples.length > 0 && (
                  <EnhancedExamplesSection
                    examples={mapExamples(sections.examples)}
                  />
                )}

                {/* 4. Ways to Solve */}
                {sections.ways_to_solve &&
                  sections.ways_to_solve.length > 0 && (
                    <WaysToSolveSection
                      approaches={mapApproaches(sections.ways_to_solve)}
                    />
                  )}

                {/* 5. How to Approach */}
                {sections.how_to_approach?.steps &&
                  sections.how_to_approach.steps.length > 0 && (
                    <HowToApproachSection
                      steps={mapSteps(sections.how_to_approach)}
                    />
                  )}

                {/* 6. Pseudo Code */}
                {sections.pseudo_code?.code && (
                  <PseudoCodeSection
                    code={sections.pseudo_code.code}
                    annotations={mapAnnotations(sections.pseudo_code)}
                  />
                )}

                {/* 7. Working Code */}
                {sections.working_code?.languages && (
                  <WorkingCodeSection
                    defaultLanguage={sections.working_code.default_language}
                    languages={sections.working_code.languages}
                  />
                )}

                {/* 8. Common Mistakes */}
                {sections.common_mistakes &&
                  sections.common_mistakes.length > 0 && (
                    <CommonMistakesSection
                      mistakes={mapMistakes(sections.common_mistakes)}
                    />
                  )}
              </div>
            ) : (
              /* ----------------------------------------------------------- */
              /* FALLBACK: existing markdown rendering                        */
              /* ----------------------------------------------------------- */
              <>
                {/* Answer / Description (Markdown) */}
                <div className="space-y-2 pb-3 border-b border-gray-700 w-full">
                  <div
                    className="text-gray-300 leading-relaxed text-sm prose prose-invert max-w-none prose-p:my-1 prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-white prose-pre:bg-[#111] prose-pre:border prose-pre:border-gray-800"
                    dangerouslySetInnerHTML={{
                      __html: md.render(question.answer || ""),
                    }}
                  />
                </div>

                {/* Examples */}
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

                {/* Constraints */}
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
            )}

            {/* Resources — only shown in fallback mode (rich sections have it in header) */}
            {!hasSections && (
              <div className="space-y-1.5 pt-1">
                <Text level="h2" className="text-red-500 font-bold text-sm">
                  Resources
                </Text>
                <div className="bg-[#111] border border-gray-800 rounded-lg p-1.5 flex gap-4 items-center justify-center w-fit min-w-[120px]">
                  {question.resources?.leetcodeURL && (
                    <a
                      href={question.resources.leetcodeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-all duration-300 opacity-90 hover:opacity-100"
                      title="LeetCode Problem"
                    >
                      <LeetCodeIcon className="w-5 h-5" />
                    </a>
                  )}

                  {question.resources?.youtubeURL && (
                    <a
                      href={question.resources.youtubeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-all duration-300 opacity-90 hover:opacity-100"
                      title="YouTube Explanation"
                    >
                      <YouTubeIcon className="w-5 h-5" />
                    </a>
                  )}
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
              )) || (
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
              )) || (
                <Text level="p" className="text-gray-500 text-sm">
                  No companies available.
                </Text>
              )}
            </FlexContainer>
          </div>
        )}

        {activeTab === "code" && (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 border border-gray-800 rounded-lg bg-[#111]">
            <p className="mb-2">Code editor integration coming soon.</p>
            {question.resources?.leetcodeURL && (
              <a
                href={question.resources.leetcodeURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline text-sm"
              >
                Solve on LeetCode →
              </a>
            )}
          </div>
        )}
      </div>
    </FlexContainer>
  );
};

export default QuestionDetailPanel;
