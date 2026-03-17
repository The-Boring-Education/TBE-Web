import { Text } from "@tbe/components";
import React from "react";

interface ConstraintEntry {
    constraint: string;
    plain_meaning: string;
    implication: string;
}

interface ConstraintsSectionProps {
    constraints: ConstraintEntry[];
}

const ConstraintsSection = ({ constraints }: ConstraintsSectionProps) => {
    return (
        <div className="space-y-3">
            <Text
                level="h2"
                className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default uppercase tracking-wider"
            >
                Constraints
            </Text>

            <div className="space-y-2">
                {constraints.map((entry, index) => (
                    <div
                        key={index}
                        className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden"
                    >
                        <div className="p-2.5 border-b border-gray-800/50 bg-[#161616]">
                            <code className="text-xs text-red-400 font-mono">
                                {entry.constraint}
                            </code>
                        </div>
                        <div className="p-2.5 space-y-1.5">
                            <div>
                                <Text
                                    level="span"
                                    className="text-[10px] text-gray-500 font-mono uppercase tracking-wider"
                                >
                                    Meaning
                                </Text>
                                <Text level="p" className="text-gray-300 text-xs leading-relaxed">
                                    {entry.plain_meaning}
                                </Text>
                            </div>
                            <div>
                                <Text
                                    level="span"
                                    className="text-[10px] text-gray-500 font-mono uppercase tracking-wider"
                                >
                                    Implication
                                </Text>
                                <Text level="p" className="text-gray-400 text-xs leading-relaxed italic">
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
