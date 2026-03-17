import { Text } from "@tbe/components";
import React from "react";

interface FirstPrinciplesSectionProps {
    paragraphs: string[];
    keyObservation: string;
}

const FirstPrinciplesSection = ({
    paragraphs,
    keyObservation,
}: FirstPrinciplesSectionProps) => {
    return (
        <div className="space-y-3">
            <Text
                level="h2"
                className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default uppercase tracking-wider"
            >
                First Principles
            </Text>

            <div className="space-y-3">
                {paragraphs.map((paragraph, index) => (
                    <Text
                        key={index}
                        level="p"
                        className="text-gray-300 text-sm leading-relaxed"
                    >
                        {paragraph}
                    </Text>
                ))}
            </div>

            {keyObservation && (
                <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3 mt-2">
                    <Text
                        level="span"
                        className="text-[10px] text-red-400 font-mono block mb-1 uppercase tracking-wider"
                    >
                        Key Observation
                    </Text>
                    <Text level="p" className="text-red-200 text-sm font-medium leading-relaxed">
                        {keyObservation}
                    </Text>
                </div>
            )}
        </div>
    );
};

export default FirstPrinciplesSection;
