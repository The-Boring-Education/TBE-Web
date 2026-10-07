import { useCallback, useEffect, useRef, useState } from "react";

interface Step {
  low: number;
  high: number;
  mid: number;
  status: "compare" | "left" | "right" | "found" | "not-found";
  description: string;
}

const DEFAULT_ARR = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
const DEFAULT_TARGET = 23;

function generateSteps(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const v = arr[mid] ?? 0;
    steps.push({
      low,
      high,
      mid,
      status: "compare",
      description: `low=${low}, high=${high}, mid=${mid} → arr[${mid}]=${v}`,
    });
    if (v === target) {
      steps.push({
        low,
        high,
        mid,
        status: "found",
        description: `✓ Found ${target} at index ${mid}`,
      });
      return steps;
    }
    if (v < target) {
      low = mid + 1;
      steps.push({
        low,
        high,
        mid,
        status: "right",
        description: `${v} < ${target} → search right, low=${low}`,
      });
    } else {
      high = mid - 1;
      steps.push({
        low,
        high,
        mid,
        status: "left",
        description: `${v} > ${target} → search left, high=${high}`,
      });
    }
  }
  steps.push({
    low,
    high,
    mid: -1,
    status: "not-found",
    description: `✗ ${target} not found`,
  });
  return steps;
}

const SPEEDS = [
  { label: "0.5×", ms: 1400 },
  { label: "1×", ms: 700 },
  { label: "2×", ms: 340 },
];

export default function BinarySearchVisualizer() {
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
    const sp = SPEEDS[speedIdx] || SPEEDS[1]!;
    timerRef.current = setTimeout(advance, sp.ms);
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
    if (step.status === "found" && i === step.mid) return "#10b981";
    if (i === step.mid) return "#fbbf24";
    if (i < step.low || i > step.high) return "#111827";
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
        className="flex items-center justify-center px-6 py-3"
        style={{ minHeight: 44, borderBottom: "1px solid #111113" }}
      >
        <span
          className="text-[13px] font-semibold text-center"
          style={{
            color:
              step.status === "found"
                ? "#10b981"
                : step.status === "not-found"
                  ? "#f87171"
                  : "#fbbf24",
          }}
        >
          {step.description}
        </span>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="flex items-end" style={{ gap: 6 }}>
          {arr.map((v, i) => {
            const isLow = i === step.low;
            const isHigh = i === step.high;
            const isMid = i === step.mid;
            return (
              <div key={i} className="flex flex-col items-center">
                <div style={{ height: 16, fontSize: 9, color: "#9ca3af" }}>
                  {isLow && isHigh && isMid
                    ? "L=M=H"
                    : isLow
                      ? "L"
                      : isHigh
                        ? "H"
                        : isMid
                          ? "M"
                          : ""}
                </div>
                <div
                  className="flex items-center justify-center font-bold tabular-nums"
                  style={{
                    width: 40,
                    height: 40,
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
            );
          })}
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
