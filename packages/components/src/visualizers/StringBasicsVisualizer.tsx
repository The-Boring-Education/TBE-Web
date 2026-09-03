import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Step {
  l: number;
  r: number;
  status: "compare" | "match" | "mismatch" | "done";
  description: string;
  isPalindrome?: boolean;
}

function generateSteps(input: string): Step[] {
  const steps: Step[] = [];
  const s = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (s.length === 0) {
    return [
      {
        l: 0,
        r: 0,
        status: "done",
        description: "Empty string — trivially a palindrome",
        isPalindrome: true,
      },
    ];
  }
  let l = 0;
  let r = s.length - 1;
  steps.push({ l, r, status: "compare", description: `Start — L=0, R=${r}` });
  while (l < r) {
    if (s[l] === s[r]) {
      steps.push({
        l,
        r,
        status: "match",
        description: `Match: '${s[l]}' == '${s[r]}' → move inward`,
      });
      l += 1;
      r -= 1;
      if (l < r)
        steps.push({
          l,
          r,
          status: "compare",
          description: `Compare L=${l} vs R=${r}`,
        });
    } else {
      steps.push({
        l,
        r,
        status: "mismatch",
        description: `Mismatch: '${s[l]}' ≠ '${s[r]}' → not a palindrome`,
        isPalindrome: false,
      });
      steps.push({
        l,
        r,
        status: "done",
        description: "✗ Not a palindrome",
        isPalindrome: false,
      });
      return steps;
    }
  }
  steps.push({
    l,
    r,
    status: "done",
    description: "✓ String is a palindrome",
    isPalindrome: true,
  });
  return steps;
}

const SPEEDS = [
  { label: "0.5×", ms: 1400 },
  { label: "1×", ms: 700 },
  { label: "2×", ms: 340 },
];
const DEFAULT_INPUT = "racecar";

export default function StringBasicsVisualizer() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [cleaned, setCleaned] = useState(DEFAULT_INPUT);
  const [steps, setSteps] = useState<Step[]>(() =>
    generateSteps(DEFAULT_INPUT),
  );
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[idx] || steps[0]!;
  const finished = idx === steps.length - 1;

  const advance = useCallback(() => {
    setIdx((p) => (p >= steps.length - 1 ? (setPlaying(false), p) : p + 1));
  }, [steps.length]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!playing) return;
    const s = SPEEDS[speedIdx] || SPEEDS[1]!;
    timerRef.current = setTimeout(advance, s.ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, idx, speedIdx, advance]);

  const handleRun = () => {
    setPlaying(false);
    const c = input.toLowerCase().replace(/[^a-z0-9]/g, "");
    setCleaned(c || input);
    setSteps(generateSteps(input));
    setIdx(0);
  };

  const chars = useMemo(() => cleaned.split(""), [cleaned]);

  const colorFor = (i: number): string => {
    if (i === step.l && i === step.r) return "#10b981";
    if (i === step.l || i === step.r) {
      if (step.status === "mismatch") return "#f87171";
      if (step.status === "match") return "#10b981";
      return "#fbbf24";
    }
    if (step.status === "done" && step.isPalindrome) return "#10b981";
    return "#374151";
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "#09090b",
        border: "1px solid #1f2937",
        minHeight: 400,
      }}
    >
      <div
        className="flex flex-wrap items-center gap-3 px-6 py-3"
        style={{ borderBottom: "1px solid #1f2937" }}
      >
        <span className="text-[11px] font-mono" style={{ color: "#9ca3af" }}>
          string
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-md px-2 py-1 flex-1 max-w-xs font-mono text-[12px]"
          style={{
            background: "#0d0d0f",
            border: "1px solid #374151",
            color: "#fff",
          }}
        />
        <button
          onClick={handleRun}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
          style={{
            padding: "6px 12px",
            background: "#1f2937",
            border: "1px solid #374151",
          }}
        >
          Load
        </button>
      </div>

      <div
        className="flex items-center justify-center px-6 py-4"
        style={{ minHeight: 44, borderBottom: "1px solid #111113" }}
      >
        <span
          className="text-[13px] font-semibold tracking-wide text-center"
          style={{
            color: finished
              ? step.isPalindrome
                ? "#10b981"
                : "#f87171"
              : "#fbbf24",
          }}
        >
          {step.description}
        </span>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="flex flex-col items-center">
          <div className="flex items-end mb-2" style={{ gap: 6 }}>
            {chars.map((_, i) => (
              <div key={i} style={{ width: 40, textAlign: "center" }}>
                {i === step.l && (
                  <div
                    className="text-[10px] font-mono"
                    style={{ color: "#ef4444" }}
                  >
                    L
                  </div>
                )}
                {i === step.r && i !== step.l && (
                  <div
                    className="text-[10px] font-mono"
                    style={{ color: "#3b82f6" }}
                  >
                    R
                  </div>
                )}
                {i === step.l && i === step.r && (
                  <div
                    className="text-[10px] font-mono"
                    style={{ color: "#10b981" }}
                  >
                    L=R
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-end" style={{ gap: 6 }}>
            {chars.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-center font-bold"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: colorFor(i),
                  color: "#fff",
                  transition: "background-color 200ms",
                }}
              >
                {c}
              </div>
            ))}
          </div>
          <div className="flex mt-2" style={{ gap: 6 }}>
            {chars.map((_, i) => (
              <div
                key={i}
                className="text-[9px] font-mono text-center"
                style={{ width: 40, color: "#4b5563" }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-6 py-4">
        <button
          onClick={() => (finished ? handleRun() : setPlaying((p) => !p))}
          className="rounded-lg text-white text-xs font-bold cursor-pointer active:scale-95"
          style={{
            padding: "8px 18px",
            background: finished ? "#059669" : "#ef4444",
          }}
        >
          {finished
            ? "Restart"
            : playing
              ? "Pause"
              : idx === 0
                ? "Start"
                : "Resume"}
        </button>
        {SPEEDS.map(({ label }, i) => (
          <button
            key={label}
            onClick={() => setSpeedIdx(i)}
            className="rounded-md text-[11px] font-bold cursor-pointer active:scale-95"
            style={{
              padding: "6px 10px",
              background: speedIdx === i ? "#1f2937" : "transparent",
              color: speedIdx === i ? "#fff" : "#6b7280",
              border:
                "1px solid " + (speedIdx === i ? "#374151" : "transparent"),
            }}
          >
            {label}
          </button>
        ))}
        <span className="text-[10px] font-mono" style={{ color: "#4b5563" }}>
          Step {idx}/{steps.length - 1}
        </span>
      </div>
    </div>
  );
}
