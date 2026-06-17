import { useCallback, useEffect, useRef, useState } from "react";

/* ──────────────────────────────────────────────────
   Types
────────────────────────────────────────────────── */
interface SortStep {
  array: number[];
  comparing: [number, number] | null;
  swapped: boolean;
  sortedValues: number[];
  description: string;
}

/* ──────────────────────────────────────────────────
   Step generator
────────────────────────────────────────────────── */
function generateSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const n = arr.length;
  const sortedSet = new Set<number>();

  const snap = (
    comparing: [number, number] | null,
    swapped: boolean,
    description: string,
  ) =>
    steps.push({
      array: [...arr],
      comparing,
      swapped,
      sortedValues: Array.from(sortedSet),
      description,
    });

  snap(null, false, "Ready — press Start");

  for (let i = 0; i < n - 1; i++) {
    let didSwap = false;
    for (let j = 0; j < n - i - 1; j++) {
      const val1 = arr[j];
      const val2 = arr[j + 1];
      if (val1 !== undefined && val2 !== undefined) {
        snap([j, j + 1], false, `Comparing  ${val1}  and  ${val2}`);
        if (val1 > val2) {
          arr[j] = val2;
          arr[j + 1] = val1;
          didSwap = true;
          snap([j, j + 1], true, `Swap  ${val2}  ↔  ${val1}`);
        }
      }
    }
    const finalVal = arr[n - 1 - i];
    if (finalVal !== undefined) {
      sortedSet.add(finalVal);
      snap(null, false, `${finalVal} is in its final position`);
    }
    if (!didSwap) {
      arr.forEach((v) => sortedSet.add(v));
      break;
    }
  }

  arr.forEach((v) => sortedSet.add(v));
  snap(null, false, "✓  Array sorted!");
  return steps;
}

/* ──────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────── */
function randomArray(size: number): number[] {
  const vals = new Set<number>();
  while (vals.size < size) vals.add(Math.floor(Math.random() * 90) + 10);
  return Array.from(vals);
}

const SPEEDS: { label: string; stepMs: number; transitionMs: number }[] = [
  { label: "0.5×", stepMs: 1400, transitionMs: 500 },
  { label: "1×", stepMs: 700, transitionMs: 260 },
  { label: "2×", stepMs: 340, transitionMs: 140 },
  { label: "4×", stepMs: 130, transitionMs: 80 },
];

const CHART_H = 180; // px

function barColor(value: number, index: number, step: SortStep): string {
  if (step.sortedValues.includes(value)) return "#10b981";
  if (step.comparing?.includes(index))
    return step.swapped ? "#f87171" : "#fbbf24";
  return "#374151";
}

const MIN_SIZE = 4;
const MAX_SIZE = 16;
const DEFAULT_SIZE = 7;

/* ──────────────────────────────────────────────────
   Component
────────────────────────────────────────────────── */
export default function BubbleSortVisualizer() {
  const [arraySize, setArraySize] = useState(DEFAULT_SIZE);
  const [baseArray, setBaseArray] = useState<number[]>(() =>
    randomArray(DEFAULT_SIZE),
  );
  const [steps, setSteps] = useState<SortStep[]>(() =>
    generateSteps(randomArray(DEFAULT_SIZE)),
  );
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[idx] || steps[0]!;
  const finished = idx === steps.length - 1;
  const n = step.array.length;
  const maxVal = Math.max(...step.array);

  /* bar geometry — shrink bar width for large arrays */
  const barW = Math.max(20, Math.min(48, Math.floor(300 / n)));
  const barGap = Math.max(4, Math.min(12, Math.floor(40 / n)));

  /* advance */
  const advance = useCallback(() => {
    setIdx((prev) => {
      if (prev >= steps.length - 1) {
        setPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [steps.length]);

  /* autoplay */
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!playing) return;
    const currentSpeed = SPEEDS[speedIdx] || SPEEDS[1]!;
    timerRef.current = setTimeout(advance, currentSpeed.stepMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, idx, speedIdx, advance]);

  useEffect(() => {
    if (finished) setPlaying(false);
  }, [finished]);

  /* reset to current base array */
  const reset = useCallback(() => {
    setPlaying(false);
    setSteps(generateSteps(baseArray));
    setIdx(0);
  }, [baseArray]);

  /* generate a fresh random array of given size */
  const generate = useCallback((size: number) => {
    setPlaying(false);
    const arr = randomArray(size);
    setBaseArray(arr);
    setSteps(generateSteps(arr));
    setIdx(0);
  }, []);

  /* when size changes regenerate */
  const handleSizeChange = (size: number) => {
    setArraySize(size);
    generate(size);
  };

  const log = steps
    .slice(0, idx + 1)
    .slice(-6)
    .reverse();
  const currentSpeed = SPEEDS[speedIdx] || SPEEDS[1]!;
  const transMs = currentSpeed.transitionMs;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden flex"
      style={{
        background: "#09090b",
        border: "1px solid #1f2937",
        minHeight: 400,
      }}
    >
      {/* ══ LEFT SIDEBAR ══ */}
      <div
        className="flex flex-col gap-5 p-5 shrink-0"
        style={{
          width: 180,
          borderRight: "1px solid #1f2937",
          background: "#070709",
        }}
      >
        {/* Array Size */}
        <div>
          <p
            className="text-[9px] font-black uppercase tracking-widest mb-3"
            style={{ color: "#4b5563" }}
          >
            Array Size
          </p>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[11px] font-mono"
              style={{ color: "#9ca3af" }}
            >
              {MIN_SIZE}
            </span>
            <span
              className="text-xl font-black tabular-nums"
              style={{ color: "#ef4444" }}
            >
              {arraySize}
            </span>
            <span
              className="text-[11px] font-mono"
              style={{ color: "#9ca3af" }}
            >
              {MAX_SIZE}
            </span>
          </div>

          {/* Custom styled range slider */}
          <div className="relative flex items-center" style={{ height: 20 }}>
            <div
              className="absolute w-full rounded-full"
              style={{ height: 4, background: "#1f2937" }}
            />
            <div
              className="absolute rounded-full"
              style={{
                height: 4,
                background: "#ef4444",
                width: `${((arraySize - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100}%`,
                transition: "width 0.15s ease",
              }}
            />
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={arraySize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="absolute w-full cursor-pointer appearance-none bg-transparent"
              style={{ height: 20 }}
            />
          </div>
        </div>

        {/* Generate button */}
        <button
          id="bsv-generate"
          onClick={() => generate(arraySize)}
          className="w-full rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
          style={{
            padding: "9px 0",
            background: "#1f2937",
            color: "#e5e7eb",
            border: "1px solid #374151",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#374151";
            e.currentTarget.style.borderColor = "#4b5563";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1f2937";
            e.currentTarget.style.borderColor = "#374151";
          }}
        >
          ↻ Randomize
        </button>

        {/* Speed */}
        <div>
          <p
            className="text-[9px] font-black uppercase tracking-widest mb-2"
            style={{ color: "#4b5563" }}
          >
            Speed
          </p>
          <div className="flex flex-col gap-1">
            {SPEEDS.map(({ label }, i) => (
              <button
                key={label}
                id={`bsv-speed-${i}`}
                onClick={() => setSpeedIdx(i)}
                className="w-full rounded-md text-[11px] font-bold transition-all active:scale-95 cursor-pointer text-left px-3"
                style={{
                  padding: "6px 10px",
                  background: speedIdx === i ? "#1f2937" : "transparent",
                  color: speedIdx === i ? "#fff" : "#4b5563",
                  border:
                    speedIdx === i
                      ? "1px solid #374151"
                      : "1px solid transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #1f2937" }} />

        {/* Stats */}
        <div className="space-y-2">
          <StatRow label="Steps" value={steps.length - 1} />
          <StatRow label="Step" value={`${idx} / ${steps.length - 1}`} />
        </div>
      </div>

      {/* ══ RIGHT — CHART + CONTROLS ══ */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Status bar */}
        <div
          className="flex items-center justify-center px-6"
          style={{ minHeight: 44, borderBottom: "1px solid #111113" }}
        >
          <span
            className="text-[13px] font-semibold tracking-wide text-center"
            style={{
              color: finished
                ? "#10b981"
                : step.swapped
                  ? "#f87171"
                  : step.comparing
                    ? "#fbbf24"
                    : "#6b7280",
              transition: "color 0.15s",
            }}
          >
            {step.description}
          </span>
        </div>

        {/* Bar chart */}
        <div
          className="flex items-end justify-center px-6 pt-6 pb-4"
          style={{ flex: "0 0 auto" }}
        >
          <div
            className="relative flex items-end"
            style={{
              height: CHART_H,
              gap: barGap,
            }}
          >
            {step.array.map((val, i) => {
              const barH = Math.max(
                14,
                Math.round((val / maxVal) * (CHART_H - 30)),
              );
              const color = barColor(val, i, step);

              return (
                /* Key by value — the DOM element persists across swaps,
                   its flex-order changes → we animate with `order` + a wrapper trick.
                   Actually, for absolute positioning approach: */
                <div
                  key={val}
                  className="flex flex-col items-center justify-end"
                  style={{
                    width: barW,
                    height: CHART_H,
                    flexShrink: 0,
                    // Use order to move bars — CSS flex order transitions via margin trick
                    // Instead we use transform translateX calculated from position delta
                  }}
                >
                  <span
                    className="font-bold mb-1 tabular-nums"
                    style={{
                      fontSize: barW < 30 ? 9 : 11,
                      color,
                      transition: `color ${transMs}ms`,
                    }}
                  >
                    {val}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: barH,
                      background: color,
                      borderRadius: "5px 5px 2px 2px",
                      transition: `background-color ${transMs}ms ease, height ${transMs}ms cubic-bezier(0.4,0,0.2,1)`,
                      boxShadow:
                        step.swapped && step.comparing?.includes(i)
                          ? `0 0 12px ${color}80`
                          : "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div
          className="flex items-center justify-center gap-4 pb-3"
          style={{ borderBottom: "1px solid #1f2937" }}
        >
          {[
            { color: "#374151", label: "Unsorted" },
            { color: "#fbbf24", label: "Comparing" },
            { color: "#f87171", label: "Swapping" },
            { color: "#10b981", label: "Sorted" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="rounded-sm"
                style={{
                  width: 8,
                  height: 8,
                  background: color,
                  display: "inline-block",
                }}
              />
              <span className="text-[10px]" style={{ color: "#4b5563" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Play controls */}
        <div className="flex items-center gap-3 px-6 py-4">
          <button
            id="bsv-play"
            onClick={() => (finished ? reset() : setPlaying((p) => !p))}
            className="flex items-center gap-2 rounded-lg text-white text-xs font-bold tracking-wide cursor-pointer active:scale-95 transition-all"
            style={{
              padding: "8px 18px",
              background: finished ? "#059669" : "#ef4444",
            }}
          >
            {finished ? <IconReset /> : playing ? <IconPause /> : <IconPlay />}
            {finished
              ? "Restart"
              : playing
                ? "Pause"
                : idx === 0
                  ? "Start"
                  : "Resume"}
          </button>

          {idx > 0 && !finished && (
            <button
              onClick={reset}
              className="rounded-lg text-xs font-bold cursor-pointer active:scale-95 transition-all"
              style={{
                padding: "8px 14px",
                border: "1px solid #374151",
                color: "#6b7280",
                background: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
            >
              Reset
            </button>
          )}
        </div>

        {/* Step log */}
        <div
          className="mx-6 mb-6 rounded-xl overflow-hidden flex-1"
          style={{
            border: "1px solid #1f2937",
            background: "#050507",
            minHeight: 80,
          }}
        >
          <div
            className="px-4 py-2"
            style={{ borderBottom: "1px solid #111113" }}
          >
            <span
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: "#374151" }}
            >
              Step log
            </span>
          </div>
          <div>
            {log.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2"
                style={{
                  background:
                    i === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderBottom:
                    i < log.length - 1 ? "1px solid #0d0d0f" : "none",
                }}
              >
                <span
                  className="rounded-full shrink-0"
                  style={{
                    width: 5,
                    height: 5,
                    background: i === 0 ? "#ef4444" : "#1f2937",
                    display: "inline-block",
                  }}
                />
                <span
                  className="text-[11px] font-mono"
                  style={{ color: i === 0 ? "#d1d5db" : "#374151" }}
                >
                  {s.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Sub-components
────────────────────────────────────────────────── */
function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px]" style={{ color: "#4b5563" }}>
        {label}
      </span>
      <span
        className="text-[11px] font-mono font-bold"
        style={{ color: "#9ca3af" }}
      >
        {value}
      </span>
    </div>
  );
}

function IconPlay() {
  return (
    <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
      <path d="M1.5 1.2l6 3.8-6 3.8V1.2z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <rect x="1.5" y="1.5" width="2.5" height="7" rx="0.5" />
      <rect x="6" y="1.5" width="2.5" height="7" rx="0.5" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
