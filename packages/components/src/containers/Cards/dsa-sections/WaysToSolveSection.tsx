import { Text } from "@tbe/components";
import type { WaysToSolveSectionProps } from "@tbe/interface";

const verdictStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  too_slow: {
    bg: "bg-yellow-950/20",
    text: "text-yellow-400",
    border: "border-yellow-900/40",
  },
  acceptable: {
    bg: "bg-blue-950/20",
    text: "text-blue-400",
    border: "border-blue-900/40",
  },
  optimal: {
    bg: "bg-green-950/20",
    text: "text-green-400",
    border: "border-green-900/40",
  },
};

const defaultStyle = {
  bg: "bg-blue-950/20",
  text: "text-blue-400",
  border: "border-blue-900/40",
};

const WaysToSolveSection = ({ approaches }: WaysToSolveSectionProps) => {
  return (
    <div className="space-y-3">
      <Text
        level="h2"
        className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default uppercase tracking-wider"
      >
        Ways to Solve
      </Text>

      <div className="space-y-3">
        {approaches.map((approach) => {
          const style = verdictStyles[approach.verdict] ?? defaultStyle;

          return (
            <div
              key={approach.approachNumber}
              className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden"
            >
              {/* Header with approach name + verdict */}
              <div className="px-3 py-2 bg-[#161616] border-b border-gray-800 flex items-center justify-between gap-2">
                <Text level="span" className="text-sm font-semibold text-white">
                  {approach.approachNumber}. {approach.name}
                </Text>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border} shrink-0`}
                >
                  {approach.verdict.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <div className="px-3 py-2.5">
                <Text
                  level="p"
                  className="text-gray-300 text-sm leading-relaxed"
                >
                  {approach.description}
                </Text>
              </div>

              {/* Complexity badges */}
              <div className="px-3 pb-2.5 grid grid-cols-2 gap-2">
                <div className="bg-[#111] border border-gray-800 rounded p-2">
                  <Text
                    level="span"
                    className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-0.5"
                  >
                    Time
                  </Text>
                  <Text
                    level="span"
                    className="text-red-400 font-mono text-xs font-bold"
                  >
                    {approach.timeComplexity}
                  </Text>
                  <Text
                    level="p"
                    className="text-gray-500 text-[10px] mt-0.5 leading-snug"
                  >
                    {approach.timeReason}
                  </Text>
                </div>
                <div className="bg-[#111] border border-gray-800 rounded p-2">
                  <Text
                    level="span"
                    className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-0.5"
                  >
                    Space
                  </Text>
                  <Text
                    level="span"
                    className="text-red-400 font-mono text-xs font-bold"
                  >
                    {approach.spaceComplexity}
                  </Text>
                  <Text
                    level="p"
                    className="text-gray-500 text-[10px] mt-0.5 leading-snug"
                  >
                    {approach.spaceReason}
                  </Text>
                </div>
              </div>

              {/* Verdict label */}
              <div
                className={`px-3 py-1.5 border-t ${style.border} ${style.bg}`}
              >
                <Text level="p" className={`text-xs ${style.text}`}>
                  {approach.verdictLabel}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WaysToSolveSection;
