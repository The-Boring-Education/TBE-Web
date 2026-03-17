import { Text } from "@tbe/components";
import React from "react";

interface Annotation {
    line_reference: string;
    note: string;
}

interface PseudoCodeSectionProps {
    code: string;
    annotations: Annotation[];
}

const PseudoCodeSection = ({ code, annotations }: PseudoCodeSectionProps) => {
    return (
        <div className="space-y-3">
            <Text
                level="h2"
                className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default uppercase tracking-wider"
            >
                Pseudo Code
            </Text>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
                {/* Code block */}
                <div className="p-3 bg-[#111] border-b border-gray-800">
                    <pre className="font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                        {code}
                    </pre>
                </div>

                {/* Annotations */}
                {annotations && annotations.length > 0 && (
                    <div className="p-2.5 space-y-2">
                        <Text
                            level="span"
                            className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block"
                        >
                            Annotations
                        </Text>
                        {annotations.map((annotation, index) => (
                            <div
                                key={index}
                                className="flex gap-2 items-start bg-[#111] border border-gray-800/50 rounded p-2"
                            >
                                <code className="text-[10px] text-red-400 font-mono bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30 shrink-0 mt-0.5">
                                    {annotation.line_reference.length > 30
                                        ? annotation.line_reference.substring(0, 30) + "..."
                                        : annotation.line_reference}
                                </code>
                                <Text
                                    level="p"
                                    className="text-gray-400 text-xs leading-relaxed"
                                >
                                    {annotation.note}
                                </Text>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PseudoCodeSection;
