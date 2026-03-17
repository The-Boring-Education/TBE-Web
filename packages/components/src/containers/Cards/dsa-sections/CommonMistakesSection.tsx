import { Text } from "@tbe/components";
import type { CommonMistakesSectionProps } from "@tbe/interface";

const CommonMistakesSection = ({ mistakes }: CommonMistakesSectionProps) => {
  return (
    <div className="space-y-3">
      <Text
        level="h2"
        className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default uppercase tracking-wider"
      >
        Common Mistakes
      </Text>

      <div className="space-y-3">
        {mistakes.map((mistake) => (
          <div
            key={mistake.mistakeNumber}
            className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden"
          >
            {/* Title */}
            <div className="px-3 py-2 bg-[#161616] border-b border-gray-800 flex items-center gap-2">
              <span className="text-[10px] text-red-500 font-mono bg-red-950/30 px-1.5 py-0.5 rounded border border-red-900/30 shrink-0">
                #{mistake.mistakeNumber}
              </span>
              <Text level="span" className="text-sm font-semibold text-white">
                {mistake.title}
              </Text>
            </div>

            {/* Wrong code */}
            <div className="p-2.5 border-b border-gray-800">
              <Text
                level="span"
                className="text-[10px] text-red-400 font-mono uppercase tracking-wider block mb-1"
              >
                ✗ Wrong Code
              </Text>
              <pre className="font-mono text-xs text-gray-400 bg-red-950/10 border border-red-900/20 rounded p-2 overflow-x-auto whitespace-pre leading-relaxed">
                {mistake.wrongCode}
              </pre>
            </div>

            {/* Explanation */}
            <div className="p-2.5 border-b border-gray-800">
              <Text
                level="span"
                className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1"
              >
                Why It Fails
              </Text>
              <Text level="p" className="text-gray-400 text-xs leading-relaxed">
                {mistake.explanation}
              </Text>
            </div>

            {/* Fix */}
            <div className="p-2.5">
              <Text
                level="span"
                className="text-[10px] text-green-400 font-mono uppercase tracking-wider block mb-1"
              >
                ✓ Fix
              </Text>
              <pre className="font-mono text-xs text-gray-300 bg-green-950/10 border border-green-900/20 rounded p-2 overflow-x-auto whitespace-pre leading-relaxed">
                {mistake.fix}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommonMistakesSection;
