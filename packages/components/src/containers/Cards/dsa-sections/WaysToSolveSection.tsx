import { Text } from "@tbe/components";
import type { WaysToSolveSectionProps } from "@tbe/interface";

const verdictConfig: Record<
  string,
  { bg: string; text: string; border: string; icon: string }
> = {
  too_slow: {
    bg: "bg-yellow-950/20",
    text: "text-yellow-400",
    border: "border-yellow-900/40",
    icon: "⏱",
  },
  acceptable: {
    bg: "bg-blue-950/20",
    text: "text-blue-400",
    border: "border-blue-900/40",
    icon: "✓",
  },
  optimal: {
    bg: "bg-green-950/20",
    text: "text-green-400",
    border: "border-green-900/40",
    icon: "⚡",
  },
};

const defaultStyle = {
  bg: "bg-blue-950/20",
  text: "text-blue-400",
  border: "border-blue-900/40",
  icon: "•",
};

const WaysToSolveSection = ({ approaches }: WaysToSolveSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-red-500 shrink-0" />
        <Text
          level="h2"
          className="text-white font-bold text-base tracking-tight"
        >
          Ways to Solve
        </Text>
      </div>

      <div className="space-y-3">
        {approaches.map((approach) => {
          const style = verdictConfig[approach.verdict] ?? defaultStyle;

          return (
            <div
              key={approach.approachNumber}
              className="bg-[#141414] border border-gray-800/80 rounded-lg overflow-hidden"
            >
              {/* Header with approach name + verdict */}
              <div className="px-3 py-2.5 bg-[#111] border-b border-gray-800/50 flex items-center justify-between gap-2">
                <Text level="span" className="text-sm font-semibold text-white">
                  {approach.approachNumber}. {approach.name}
                </Text>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border} shrink-0 flex items-center gap-1`}
                >
                  <span>{style.icon}</span>
                  {approach.verdict.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <div className="px-3 py-3">
                <Text
                  level="p"
                  className="text-gray-300 text-sm leading-relaxed"
                >
                  {approach.description}
                </Text>
              </div>

              {/* Complexity badges */}
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-2.5">
                  <Text
                    level="span"
                    className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1"
                  >
                    Time
                  </Text>
                  <Text
                    level="span"
                    className="text-red-400 font-mono text-xs font-bold block"
                  >
                    {approach.timeComplexity}
                  </Text>
                  <Text
                    level="p"
                    className="text-gray-500 text-[10px] mt-1 leading-snug"
                  >
                    {approach.timeReason}
                  </Text>
                </div>
                <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-2.5">
                  <Text
                    level="span"
                    className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1"
                  >
                    Space
                  </Text>
                  <Text
                    level="span"
                    className="text-red-400 font-mono text-xs font-bold block"
                  >
                    {approach.spaceComplexity}
                  </Text>
                  <Text
                    level="p"
                    className="text-gray-500 text-[10px] mt-1 leading-snug"
                  >
                    {approach.spaceReason}
                  </Text>
                </div>
              </div>

              {/* Verdict label — full-width footer */}
              <div
                className={`px-3 py-2 border-t ${style.border} ${style.bg} flex items-center gap-1.5`}
              >
                <span className={`text-sm ${style.text}`}>{style.icon}</span>
                <Text level="p" className={`text-xs font-medium ${style.text}`}>
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
