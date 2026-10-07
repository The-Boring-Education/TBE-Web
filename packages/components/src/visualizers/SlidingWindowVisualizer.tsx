import { useCallback, useEffect, useRef, useState } from "react";

interface Step {
  l: number;
  r: number;
  window: string;
  maxLen: number;
  status: "expand" | "shrink" | "start" | "done";
  description: string;
}

function generateSteps(s: string): Step[] {
  const steps: Step[] = [];
  let l = 0;
  let maxLen = 0;
  const seen = new Set<string>();
  steps.push({
    l,
    r: -1,
    window: "",
    maxLen,
    status: "start",
    description: `Start — s = "${s}"`,
  });
  if (s.length === 0) {
    steps.push({
      l: 0,
      r: -1,
      window: "",
      maxLen: 0,
      status: "done",
      description: "Empty string — max length = 0",
    });
    return steps;
  }
  for (let r = 0; r < s.length; r += 1) {
    const ch = s[r]!;
    while (seen.has(ch)) {
      const rem = s[l]!;
      seen.delete(rem);
      l += 1;
      steps.push({
        l,
        r,
        window: s.slice(l, r),
        maxLen,
        status: "shrink",
        description: `Duplicate '${ch}' — shrink: remove '${rem}', L=${l}`,
      });
    }
    seen.add(ch);
    const win = s.slice(l, r + 1);
    const len = win.length;
    if (len > maxLen) maxLen = len;
    steps.push({
      l,
      r,
      window: win,
      maxLen,
      status: "expand",
      description: `Expand: add '${ch}' → window "${win}" (len ${len})`,
    });
  }
  steps.push({
    l,
    r: s.length - 1,
    window: s.slice(l),
    maxLen,
    status: "done",
    description: `✓ Longest without repeat = ${maxLen}`,
  });
  return steps;
}

const SPEEDS = [
  { label: "0.5×", ms: 1400 },
  { label: "1×", ms: 700 },
  { label: "2×", ms: 340 },
];
const DEFAULT_STR = "abcabcbb";

export default function SlidingWindowVisualizer() {
  const [input, setInput] = useState(DEFAULT_STR);
  const [str, setStr] = useState(DEFAULT_STR);
  const [steps, setSteps] = useState<Step[]>(() => generateSteps(DEFAULT_STR));
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
    const sp = SPEEDS[speedIdx] || SPEEDS[1]!;
    timerRef.current = setTimeout(advance, sp.ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, idx, speedIdx, advance]);

  const handleRun = () => {
    setPlaying(false);
    const s = input.slice(0, 24);
    setStr(s);
    setSteps(generateSteps(s));
    setIdx(0);
  };

  const chars = str.split("");
  const colorFor = (i: number): string => {
    if (step.r < 0) return "#374151";
    if (i >= step.l && i <= step.r) {
      if (step.status === "shrink") return "#f59e0b";
      if (step.status === "done") return "#10b981";
      return "#fbbf24";
    }
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
        className="flex items-center justify-center px-6 py-3"
        style={{ minHeight: 44, borderBottom: "1px solid #111113" }}
      >
        <span
          className="text-[13px] font-semibold text-center"
          style={{
            color:
              step.status === "done"
                ? "#10b981"
                : step.status === "shrink"
                  ? "#f59e0b"
                  : "#fbbf24",
          }}
        >
          {step.description}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-8 gap-3">
        <div className="flex items-end" style={{ gap: 4 }}>
          {chars.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <div style={{ height: 14, fontSize: 9, color: "#9ca3af" }}>
                {i === step.l && i === step.r
                  ? "L=R"
                  : i === step.l
                    ? "L"
                    : i === step.r
                      ? "R"
                      : ""}
              </div>
              <div
                className="flex items-center justify-center font-bold"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 5,
                  background: colorFor(i),
                  color: "#fff",
                  transition: "background-color 200ms",
                }}
              >
                {c}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[12px] font-mono" style={{ color: "#9ca3af" }}>
          window = <span style={{ color: "#fbbf24" }}>"{step.window}"</span>{" "}
          &nbsp;·&nbsp; max ={" "}
          <span style={{ color: "#10b981" }}>{step.maxLen}</span>
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
