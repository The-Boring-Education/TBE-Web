import { Text } from "@tbe/components";
import type { HowToApproachSectionProps } from "@tbe/interface";

const HowToApproachSection = ({ steps }: HowToApproachSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-red-500 shrink-0" />
        <Text
          level="h2"
          className="text-white font-bold text-base tracking-tight"
        >
          How to Approach
        </Text>
      </div>

      <div className="relative pl-1">
        {steps.map((step, index) => (
          <div key={step.stepNumber} className="flex gap-3.5 relative">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-red-950/40 border border-red-900/60 flex items-center justify-center shrink-0 z-10">
                <Text
                  level="span"
                  className="text-[10px] text-red-400 font-mono font-bold"
                >
                  {step.stepNumber}
                </Text>
              </div>
              {index < steps.length - 1 && (
                <div className="w-px flex-1 bg-gradient-to-b from-red-900/40 to-gray-800/30 min-h-[24px]" />
              )}
            </div>

            {/* Content */}
            <div className="pb-5 flex-1 min-w-0 pt-0.5">
              <Text
                level="h3"
                className="text-white text-sm font-semibold mb-1.5"
              >
                {step.heading}
              </Text>
              <Text level="p" className="text-gray-400 text-xs leading-relaxed">
                {step.body}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowToApproachSection;
