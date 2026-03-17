import { Text } from "@tbe/components";
import type { WorkingCodeSectionProps } from "@tbe/interface";
import { useState } from "react";

const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
  go: "Go",
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

  const currentCode = languages[activeLanguage]?.code || "// No code available";

  return (
    <div className="space-y-3">
      <Text
        level="h2"
        className="text-white hover:text-red-500 transition-colors duration-200 font-bold text-sm cursor-default uppercase tracking-wider"
      >
        Working Code
      </Text>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
        {/* Language tabs */}
        <div className="flex border-b border-gray-800 bg-[#161616] overflow-x-auto">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              className={`px-3 py-2 text-xs font-mono transition-colors duration-200 whitespace-nowrap border-b-2 ${
                activeLanguage === lang
                  ? "text-red-400 border-red-500 bg-red-950/10"
                  : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#1a1a1a]"
              }`}
            >
              {LANGUAGE_LABELS[lang] || lang}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="p-3 bg-[#111] overflow-x-auto">
          <pre className="font-mono text-xs text-gray-300 leading-relaxed whitespace-pre">
            {currentCode}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default WorkingCodeSection;
