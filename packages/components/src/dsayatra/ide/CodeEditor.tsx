import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { SupportedIdeLanguage } from "./templates";

// Dynamic import with SSR false prevents Monaco from breaking during Next.js server-side rendering
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-[#131316] text-slate-400 gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-[#FF4D4D]" />
      <span className="text-xs font-mono">Loading Code Editor...</span>
    </div>
  ),
});

interface CodeEditorProps {
  language: SupportedIdeLanguage;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  readOnly = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const monacoLanguage =
    language === "cpp"
      ? "cpp"
      : language === "python"
        ? "python"
        : language === "java"
          ? "java"
          : "javascript";

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[#131316] text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-[#FF4D4D]" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 relative overflow-hidden bg-[#131316]">
      <MonacoEditor
        height="100%"
        language={monacoLanguage}
        value={value}
        theme="vs-dark"
        onChange={(val) => onChange(val || "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          fontLigatures: true,
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: language === "python" ? 4 : 2,
          wordWrap: "on",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          suggestOnTriggerCharacters: true,
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
};

