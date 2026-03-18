import { Text } from "@tbe/components";
import type { PseudoCodeSectionProps } from "@tbe/interface";
import { useState } from "react";

const PseudoCodeSection = ({ code, annotations }: PseudoCodeSectionProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-red-500 shrink-0" />
        <Text
          level="h2"
          className="text-white font-bold text-base tracking-tight"
        >
          Pseudo Code
        </Text>
      </div>

      <div className="bg-[#141414] border border-gray-800/80 rounded-lg overflow-hidden">
        {/* Code block with copy button */}
        <div className="relative group">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono rounded border transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <div className="p-4 bg-[#0d0d0d] overflow-x-auto">
            <pre className="font-mono text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap">
              {code}
            </pre>
          </div>
        </div>

        {/* Annotations */}
        {annotations && annotations.length > 0 && (
          <div className="p-3 space-y-2 border-t border-gray-800/50">
            <Text
              level="span"
              className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block"
            >
              Annotations
            </Text>
            {annotations.map((annotation, index) => (
              <div
                key={index}
                className="flex gap-2.5 items-start bg-[#0d0d0d] border border-gray-800/50 rounded-lg p-2.5"
              >
                <code className="text-[10px] text-red-400 font-mono bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30 shrink-0 mt-0.5">
                  {annotation.lineReference.length > 30
                    ? annotation.lineReference.substring(0, 30) + "..."
                    : annotation.lineReference}
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
