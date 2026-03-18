import { Text } from "@tbe/components";
import type { FirstPrinciplesSectionProps } from "@tbe/interface";

const FirstPrinciplesSection = ({
  paragraphs,
  keyObservation,
}: FirstPrinciplesSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-red-500 shrink-0" />
        <Text
          level="h2"
          className="text-white font-bold text-base tracking-tight"
        >
          First Principles
        </Text>
      </div>

      <div className="space-y-3 pl-1">
        {paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            level="p"
            className="text-gray-300 text-sm leading-7"
          >
            {paragraph}
          </Text>
        ))}
      </div>

      {keyObservation && (
        <div className="bg-red-950/25 border border-red-900/40 rounded-lg p-4 flex gap-3 items-start">
          <span className="text-lg shrink-0 mt-0.5">💡</span>
          <div>
            <Text
              level="span"
              className="text-[10px] text-red-400 font-mono block mb-1.5 uppercase tracking-wider font-semibold"
            >
              Key Observation
            </Text>
            <Text
              level="p"
              className="text-red-200 text-sm font-medium leading-relaxed"
            >
              {keyObservation}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstPrinciplesSection;
