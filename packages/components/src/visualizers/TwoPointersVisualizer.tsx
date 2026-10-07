import { useCallback, useEffect, useRef, useState } from "react";

interface Step {
  l: number;
  r: number;
  sum: number;
  status: "compare" | "move-l" | "move-r" | "found" | "none";
  description: string;
}

const DEFAULT_ARR = [1, 3, 4, 6, 8, 11, 15, 20];
const DEFAULT_TARGET = 14;

function generateSteps(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  let l = 0;
  let r = arr.length - 1;
  if (r < 1) {
    steps.push({
      l: 0,
      r: 0,
      sum: 0,
      status: "none",
      description: "Array too small",
    });
    return steps;
  }
  steps.push({
    l,
    r,
    sum: (arr[l] ?? 0) + (arr[r] ?? 0),
    status: "compare",
    description: `Start — L=${l}, R=${r}, target=${target}`,
  });
  while (l < r) {
    const a = arr[l] ?? 0;
    const b = arr[r] ?? 0;
    const sum = a + b;
    steps.push({
      l,
      r,
      sum,
      status: "compare",
      description: `${a} + ${b} = ${sum} vs ${target}`,
    });
    if (sum === target) {
      steps.push({
        l,
        r,
        sum,
        status: "found",
        description: `✓ Found pair (${a}, ${b})`,
      });
      return steps;
    }
    if (sum < target) {
      l += 1;
      steps.push({
        l,
        r,
        sum,
        status: "move-l",
        description: `sum < target → L++`,
      });
    } else {
      r -= 1;
      steps.push({
        l,
        r,
        sum,
        status: "move-r",
        description: `sum > target → R--`,
      });
    }
  }
  steps.push({
    l,
    r,
    sum: 0,
    status: "none",
    description: "✗ No pair sums to target",
  });
  return steps;
}

const SPEEDS = [
  { label: "0.5×", ms: 1400 },
  { label: "1×", ms: 700 },
  { label: "2×", ms: 340 },
];

export default function TwoPointersVisualizer() {
  const [arr] = useState(DEFAULT_ARR);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [steps, setSteps] = useState<Step[]>(() =>
    generateSteps(DEFAULT_ARR, DEFAULT_TARGET),
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
    setSteps(generateSteps(arr, target));
    setIdx(0);
  };

  const colorFor = (i: number): string => {
    if (step.status === "found" && (i === step.l || i === step.r))
      return "#10b981";
    if (i === step.l) return "#ef4444";
    if (i === step.r) return "#3b82f6";
    if (i > step.l && i < step.r) return "#374151";
    return "#111827";
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
          target
        </span>
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="rounded-md px-2 py-1 w-20 font-mono text-[12px]"
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
          className="text-[13px] font-semibold text-center"
          style={{
            color:
              step.status === "found"
                ? "#10b981"
                : step.status === "none" && finished
                  ? "#f87171"
                  : "#fbbf24",
          }}
        >
          {step.description}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-10 gap-4">
        <div className="flex items-end" style={{ gap: 6 }}>
          {arr.map((v, i) => (
            <div key={i} className="flex flex-col items-center">
              <div style={{ height: 18, fontSize: 10, color: "#9ca3af" }}>
                {i === step.l && i === step.r
                  ? "L=R"
                  : i === step.l
                    ? "L"
                    : i === step.r
                      ? "R"
                      : ""}
              </div>
              <div
                className="flex items-center justify-center font-bold tabular-nums"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  background: colorFor(i),
                  color: "#fff",
                  transition: "background-color 200ms",
                }}
              >
                {v}
              </div>
              <span
                className="text-[9px] font-mono mt-1"
                style={{ color: "#4b5563" }}
              >
                {i}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[12px] font-mono" style={{ color: "#9ca3af" }}>
          sum = <span style={{ color: "#fbbf24" }}>{step.sum}</span>{" "}
          &nbsp;·&nbsp; target ={" "}
          <span style={{ color: "#10b981" }}>{target}</span>
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
