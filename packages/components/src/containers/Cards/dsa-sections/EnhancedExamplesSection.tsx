import { Text } from "@tbe/components";
import type { EnhancedExamplesSectionProps } from "@tbe/interface";
import { useState } from "react";

const EnhancedExamplesSection = ({
  examples,
}: EnhancedExamplesSectionProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      <Text
        level="h2"
        className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default uppercase tracking-wider"
      >
        Examples
      </Text>

      <div className="space-y-3">
        {examples.map((example, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden"
          >
            {/* Label */}
            <div className="px-2.5 py-1.5 bg-[#161616] border-b border-gray-800">
              <Text level="span" className="text-xs font-medium text-gray-300">
                {example.label}
              </Text>
            </div>

            {/* Input / Output */}
            <div className="flex flex-col border-b border-gray-800 last:border-0">
              <div className="flex-1 min-w-0 p-2 border-b border-gray-800 bg-[#161616]">
                <Text
                  level="span"
                  className="text-[10px] text-white hover:text-red-500 transition-colors duration-200 cursor-default font-mono block mb-1 uppercase tracking-wider"
                >
                  Input
                </Text>
                <div className="font-mono text-xs text-gray-300 bg-black/40 px-2 py-1.5 rounded border border-gray-800/50 overflow-x-auto whitespace-pre">
                  {example.input}
                </div>
              </div>
              <div className="flex-1 min-w-0 p-2 bg-[#161616]">
                <Text
                  level="span"
                  className="text-[10px] text-white hover:text-red-500 transition-colors duration-200 cursor-default font-mono block mb-1 uppercase tracking-wider"
                >
                  Output
                </Text>
                <div className="font-mono text-xs text-gray-300 bg-black/40 px-2 py-1.5 rounded border border-gray-800/50 overflow-x-auto whitespace-pre">
                  {example.output}
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="px-2.5 py-2 bg-[#111] border-t border-gray-800">
              <Text
                level="span"
                className="text-[10px] text-white hover:text-red-500 transition-colors duration-200 cursor-default font-mono block mb-0.5 uppercase tracking-wider"
              >
                Explanation
              </Text>
              <Text level="p" className="text-sm text-gray-400 leading-relaxed">
                {example.explanation}
              </Text>
            </div>

            {/* Step-by-step walkthrough (expandable) */}
            {example.stepByStep && example.stepByStep.length > 0 && (
              <div className="border-t border-gray-800">
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="w-full px-2.5 py-1.5 text-left flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                >
                  <Text
                    level="span"
                    className="text-[10px] text-red-400 font-mono uppercase tracking-wider"
                  >
                    Step-by-Step Walkthrough
                  </Text>
                  <Text
                    level="span"
                    className="text-gray-500 text-xs transition-transform duration-200"
                    style={{
                      transform:
                        expandedIndex === index
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </Text>
                </button>

                {expandedIndex === index && (
                  <div className="px-2.5 pb-2.5 space-y-1.5">
                    {example.stepByStep.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-2 items-start">
                        <Text
                          level="span"
                          className="text-[10px] text-red-500 font-mono mt-0.5 shrink-0"
                        >
                          {stepIndex + 1}.
                        </Text>
                        <Text
                          level="p"
                          className="text-xs text-gray-400 leading-relaxed"
                        >
                          {step}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedExamplesSection;
