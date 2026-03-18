import { Text } from "@tbe/components";
import type { EnhancedExamplesSectionProps } from "@tbe/interface";
import { useState } from "react";

const EnhancedExamplesSection = ({
  examples,
}: EnhancedExamplesSectionProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-red-500 shrink-0" />
        <Text
          level="h2"
          className="text-white font-bold text-base tracking-tight"
        >
          Examples
        </Text>
      </div>

      <div className="space-y-3">
        {examples.map((example, index) => (
          <div
            key={index}
            className="bg-[#141414] border border-gray-800/80 rounded-lg overflow-hidden"
          >
            {/* Label */}
            <div className="px-3 py-2 bg-[#111] border-b border-gray-800/50">
              <Text
                level="span"
                className="text-xs font-semibold text-gray-200"
              >
                {example.label}
              </Text>
            </div>

            {/* Input / Output — side by side on wider screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-800/50">
              <div className="p-3 sm:border-r border-b sm:border-b-0 border-gray-800/50">
                <Text
                  level="span"
                  className="text-[10px] text-gray-500 font-mono block mb-1.5 uppercase tracking-wider"
                >
                  Input
                </Text>
                <div className="font-mono text-xs text-gray-300 bg-black/50 px-2.5 py-2 rounded border border-gray-800/50 overflow-x-auto whitespace-pre">
                  {example.input}
                </div>
              </div>
              <div className="p-3">
                <Text
                  level="span"
                  className="text-[10px] text-gray-500 font-mono block mb-1.5 uppercase tracking-wider"
                >
                  Output
                </Text>
                <div className="font-mono text-xs text-green-400 bg-black/50 px-2.5 py-2 rounded border border-gray-800/50 overflow-x-auto whitespace-pre">
                  {example.output}
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="px-3 py-2.5 border-b border-gray-800/50 bg-[#111]/50">
              <Text
                level="span"
                className="text-[10px] text-gray-500 font-mono block mb-1 uppercase tracking-wider"
              >
                Explanation
              </Text>
              <Text level="p" className="text-sm text-gray-300 leading-relaxed">
                {example.explanation}
              </Text>
            </div>

            {/* Step-by-step walkthrough (expandable) */}
            {example.stepByStep && example.stepByStep.length > 0 && (
              <div>
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#1a1a1a] transition-colors duration-200"
                >
                  <Text
                    level="span"
                    className="text-[10px] text-red-400 font-mono uppercase tracking-wider font-semibold"
                  >
                    Step-by-Step Walkthrough
                  </Text>
                  <Text
                    level="span"
                    className="text-gray-500 text-xs transition-transform duration-300"
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

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: expandedIndex === index ? "500px" : "0px",
                    opacity: expandedIndex === index ? 1 : 0,
                  }}
                >
                  <div className="px-3 pb-3 space-y-2">
                    {example.stepByStep.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 rounded-full bg-red-950/40 border border-red-900/60 flex items-center justify-center shrink-0 mt-0.5">
                          <Text
                            level="span"
                            className="text-[9px] text-red-400 font-mono font-bold"
                          >
                            {stepIndex + 1}
                          </Text>
                        </div>
                        <Text
                          level="p"
                          className="text-xs text-gray-400 leading-relaxed pt-0.5"
                        >
                          {step}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedExamplesSection;
