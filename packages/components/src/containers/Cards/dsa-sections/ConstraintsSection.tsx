import { Text } from "@tbe/components";
import type { ConstraintsSectionProps } from "@tbe/interface";

const ConstraintsSection = ({ constraints }: ConstraintsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-red-500 shrink-0" />
        <Text
          level="h2"
          className="text-white font-bold text-base tracking-tight"
        >
          Constraints
        </Text>
      </div>

      <div className="space-y-2.5">
        {constraints.map((entry, index) => (
          <div
            key={index}
            className="bg-[#141414] border border-gray-800/80 rounded-lg overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-gray-800/50 bg-[#111]">
              <code className="text-xs text-red-400 font-mono font-medium">
                {entry.constraint}
              </code>
            </div>
            <div className="px-3 py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Text
                  level="span"
                  className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1"
                >
                  Meaning
                </Text>
                <Text
                  level="p"
                  className="text-gray-300 text-xs leading-relaxed"
                >
                  {entry.plainMeaning}
                </Text>
              </div>
              <div>
                <Text
                  level="span"
                  className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1"
                >
                  Implication
                </Text>
                <Text
                  level="p"
                  className="text-gray-400 text-xs leading-relaxed italic"
                >
                  {entry.implication}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConstraintsSection;
