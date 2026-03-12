import { Button, FlexContainer, MDXRenderer, Text } from "@tbe/components";
import React, { useEffect, useState } from "react";

export interface AptitudeStudyGuideProps {
  topicName: string;
  markdownContent: string;
  onStartQuiz: () => void;
}

// SVG icon paths (24x24 viewBox)
const ICON_PATHS = {
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  target: "M12 8V4l8 8-8 8v-4H4V8h8zm-2 2H6v4h4v2.5L14.5 12 10 7.5V10z",
  lightbulb:
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
};

const SECTION_CONFIG: Record<string, any> = {
  "Core Concepts": {
    iconPath: ICON_PATHS.doc,
    gradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
    borderGlow: "rgba(56, 189, 248, 0.3)",
    borderColor: "rgba(56, 189, 248, 0.15)",
    hoverGlow: "rgba(56, 189, 248, 0.12)",
    titleColor: "#38bdf8",
  },
  "Step-by-Step Solving Plan": {
    iconPath: ICON_PATHS.target,
    gradient: "from-emerald-500/10 via-green-500/5 to-transparent",
    borderGlow: "rgba(52, 211, 153, 0.3)",
    borderColor: "rgba(52, 211, 153, 0.15)",
    hoverGlow: "rgba(52, 211, 153, 0.12)",
    titleColor: "#34d399",
  },
  Examples: {
    iconPath: ICON_PATHS.lightbulb,
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    borderGlow: "rgba(251, 191, 36, 0.3)",
    borderColor: "rgba(251, 191, 36, 0.15)",
    hoverGlow: "rgba(251, 191, 36, 0.12)",
    titleColor: "#fbbf24",
  },
};

/* Clean Boxed SVG icon component */
const BoxedIcon = ({ path, color }: { path: string; color: string }) => (
  <div
    className="flex items-center justify-center w-5 h-5 rounded-lg mr-3 shrink-0"
    style={{
      backgroundColor: `${color}0A`, // Very faint background tint (approx 4% opacity)
      border: `1px solid ${color}40`, // Thin, subtle border (25% opacity)
      boxShadow: `0 0 10px ${color}10`, // Very soft, faint outer glow
    }}
  >
    <svg
      className="w-[18px] h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  </div>
);

export const AptitudeStudyGuide: React.FC<AptitudeStudyGuideProps> = ({
  topicName,
  markdownContent,
  onStartQuiz,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [markdownContent]);

  // Parse Markdown sections with robust splitting logic
  let rawSections = markdownContent
    .split(/\n\s*---\s*\n/)
    .filter((s) => s.trim());

  // Fallback: If the split failed (only 1 section) but we see multiple H3 headers, split by headers
  if (rawSections.length < 2 && markdownContent.includes("###")) {
    // Find positions of ### Core Concepts, ### Step-by-Step Solving Plan, ### Examples
    const headerPatterns = [
      "### Core Concepts",
      "### Step-by-Step Solving Plan",
      "### Examples",
    ];

    const splitIndices: { index: number; title: string }[] = [];
    headerPatterns.forEach((pattern) => {
      const idx = markdownContent.indexOf(pattern);
      if (idx !== -1) splitIndices.push({ index: idx, title: pattern });
    });

    splitIndices.sort((a, b) => a.index - b.index);

    if (splitIndices.length >= 2) {
      rawSections = splitIndices.map((si, i) => {
        const nextSection = splitIndices[i + 1];
        const start = si.index;
        const end = nextSection ? nextSection.index : markdownContent.length;
        return markdownContent.substring(start, end);
      });
    }
  }

  const sections = rawSections.filter((s) => s.trim());

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full h-full max-h-full overflow-y-auto overflow-x-hidden scrollbar-thin-grey px-4 py-6 relative">
      <div className="max-w-2xl mx-auto w-full pb-8 interview-content-wrapper p-0 gap-4">
        {/* Header (Matching Question Header Card style, but tighter) */}
        <div
          className="question-header-card mb-2 p-5 rounded-2xl border border-gray-800/80 bg-[#111]"
          data-visible={isVisible}
          style={{ animationDelay: "0s" }}
        >
          <div className="question-header-glow opacity-30" />
          <div className="question-header-inner text-left">
            <h1 className="question-main-title text-xl font-bold mb-1.5 tracking-tight">
              {topicName} Study Guide
            </h1>
            <p className="question-subtitle text-xs text-gray-400">
              Review the key concepts, formulas, and strategies before taking
              the practice quiz.
            </p>
          </div>
        </div>

        {/* Markdown Content Sections */}
        <div className="sections-container w-full flex flex-col gap-4">
          {sections.map((sectionContent, index) => {
            // Extract title from the first line of the section (assuming it starts with ### )
            const titleMatch = sectionContent.match(/^###\s+([\w\s-]+)$/m);
            let title =
              titleMatch && titleMatch[1] ? titleMatch[1].trim() : "Details";

            // Map loose titles to exact config keys if needed
            if (title.toLowerCase().includes("concepts"))
              title = "Core Concepts";
            if (
              title.toLowerCase().includes("solving plan") ||
              title.toLowerCase().includes("step-by-step")
            )
              title = "Step-by-Step Solving Plan";
            if (title.toLowerCase().includes("examples")) title = "Examples";

            const content = sectionContent.replace(/^###\s+.*$/m, "").trim();

            const config = SECTION_CONFIG[title] || {
              iconPath: ICON_PATHS.doc,
              gradient: "from-gray-500/10 via-gray-500/5 to-transparent",
              borderGlow: "rgba(156, 163, 175, 0.3)",
              borderColor: "rgba(156, 163, 175, 0.15)",
              hoverGlow: "rgba(156, 163, 175, 0.12)",
              titleColor: "#9ca3af",
            };

            const delay = (index + 1) * 0.1 + 0.1;

            return (
              <div
                key={index}
                className="w-full relative rounded-2xl border transition-all duration-500 overflow-hidden"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "#111", // Match header bg
                  animationDelay: `${delay}s`,
                }}
                data-visible={isVisible}
              >
                {/* Subtle internal reflection/glow */}
                <div
                  className="absolute inset-x-0 top-0 h-[80px] opacity-[0.15] pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top, ${config.titleColor} 0%, transparent 70%)`,
                  }}
                />

                <div className="relative flex flex-col p-5 md:p-6">
                  <div className="flex items-center mb-4">
                    <BoxedIcon
                      path={config.iconPath}
                      color={config.titleColor}
                    />
                    <h3
                      className="text-sm font-bold uppercase tracking-[0.15em] m-0"
                      style={{ color: config.titleColor }}
                    >
                      {title}
                    </h3>
                    <div
                      className="ml-5 flex-1 h-[1px]"
                      style={{
                        background: `linear-gradient(90deg, rgba(255,255,255,0.1), transparent)`,
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed prose prose-sm prose-invert max-w-none marker:text-gray-500 prose-ul:space-y-2 prose-li:my-0.5 prose-p:my-1.5 prose-strong:text-white">
                    <MDXRenderer theme="dark" mdxSource={content} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div
          className="actions-card w-full mt-2"
          data-visible={isVisible}
          style={{ animationDelay: `${(sections.length + 1) * 0.1 + 0.1}s` }}
        >
          <FlexContainer
            className="justify-center items-center py-3 bg-[#111] rounded-xl border border-gray-800/60"
            fullWidth
            direction="col"
          >
            <Text level="h3" className="text-gray-300 font-medium text-xs mb-3">
              Ready to test your knowledge?
            </Text>
            <Button
              variant="PRIMARY"
              size="MEDIUM"
              text="Start Practice Quiz →"
              onClick={onStartQuiz}
              className="px-6 py-2 font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300"
            />
          </FlexContainer>
        </div>
      </div>
    </div>
  );
};

export default AptitudeStudyGuide;
