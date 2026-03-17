import { Text } from "@tbe/components";
import React from "react";

interface Step {
    step_number: number;
    heading: string;
    body: string;
}

interface HowToApproachSectionProps {
    steps: Step[];
}

const HowToApproachSection = ({ steps }: HowToApproachSectionProps) => {
    return (
        <div className="space-y-3">
            <Text
                level="h2"
                className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default uppercase tracking-wider"
            >
                How to Approach
            </Text>

            <div className="relative space-y-0">
                {steps.map((step, index) => (
                    <div key={step.step_number} className="flex gap-3">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-red-950/40 border border-red-900/60 flex items-center justify-center shrink-0">
                                <Text
                                    level="span"
                                    className="text-[10px] text-red-400 font-mono font-bold"
                                >
                                    {step.step_number}
                                </Text>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="w-px h-full bg-gray-800 min-h-[20px]" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="pb-4 flex-1 min-w-0">
                            <Text
                                level="h3"
                                className="text-white text-sm font-semibold mb-1"
                            >
                                {step.heading}
                            </Text>
                            <Text
                                level="p"
                                className="text-gray-400 text-xs leading-relaxed"
                            >
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
