import { Text } from "@tbe/components";
import type { WorkingCodeSectionProps } from "@tbe/interface";
import { useState } from "react";

const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
  go: "Go",
  typescript: "TypeScript",
};

const WorkingCodeSection = ({
  defaultLanguage,
  languages,
}: WorkingCodeSectionProps) => {
  const availableLanguages = Object.keys(languages);
  const [activeLanguage, setActiveLanguage] = useState(
    availableLanguages.includes(defaultLanguage)
      ? defaultLanguage
      : availableLanguages[0] || "python",
  );
  const [copied, setCopied] = useState(false);

  const currentCode = languages[activeLanguage]?.code || "// No code available";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const codeLines = currentCode.split("\n");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-red-500 shrink-0" />
        <Text
          level="h2"
          className="text-white font-bold text-base tracking-tight"
        >
          Working Code
        </Text>
      </div>

      <div className="bg-[#141414] border border-gray-800/80 rounded-lg overflow-hidden">
        {/* Language tabs */}
        <div className="flex border-b border-gray-800/50 bg-[#111] overflow-x-auto">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setActiveLanguage(lang);
                setCopied(false);
              }}
              className={`px-3.5 py-2 text-xs font-mono transition-all duration-200 whitespace-nowrap border-b-2 ${
                activeLanguage === lang
                  ? "text-red-400 border-red-500 bg-red-950/10"
                  : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#1a1a1a]"
              }`}
            >
              {LANGUAGE_LABELS[lang] || lang}
            </button>
          ))}
        </div>

        {/* Code block with line numbers and copy */}
        <div className="relative group">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono rounded border transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <div className="flex bg-[#0d0d0d] overflow-x-auto">
            {/* Line numbers */}
            <div className="py-3 pl-3 pr-2 select-none border-r border-gray-800/30 shrink-0">
              {codeLines.map((_, i) => (
                <div
                  key={i}
                  className="font-mono text-[11px] text-gray-600 leading-relaxed text-right min-w-[20px]"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            {/* Code */}
            <div className="py-3 px-3 flex-1 min-w-0">
              <pre className="font-mono text-[13px] text-gray-300 leading-relaxed whitespace-pre">
                {currentCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingCodeSection;
