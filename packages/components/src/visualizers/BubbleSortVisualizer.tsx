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
  const initialArray = useRef<number[]>(randomArray(DEFAULT_SIZE));
  const [baseArray, setBaseArray] = useState<number[]>(
    () => initialArray.current,
  );
  const [steps, setSteps] = useState<SortStep[]>(() =>
    generateSteps(initialArray.current),
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

  const reset = useCallback(() => {
    setPlaying(false);
    setSteps(generateSteps(baseArray));
    setIdx(0);
  }, [baseArray]);

  const generate = useCallback((size: number) => {
    setPlaying(false);
    const arr = randomArray(size);
    setBaseArray(arr);
    setSteps(generateSteps(arr));
    setIdx(0);
  }, []);

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
    <div className="w-full rounded-2xl overflow-hidden flex flex-col md:flex-row bg-[#0a0a0b] border border-zinc-800/80 shadow-2xl md:h-[520px]">
      {/* ══ LEFT SIDEBAR / TOP CONTROLS ON MOBILE ══ */}
      <div className="flex flex-col gap-4 md:gap-5 p-4 md:p-5 shrink-0 w-full md:w-[200px] border-b md:border-b-0 md:border-r border-zinc-800/80 bg-[#0A0A0B]">
        {/* Array Size */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-zinc-400">
            Array Size
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">
              {MIN_SIZE}
            </span>
            <span className="text-xl font-bold tabular-nums text-[#FF5757]">
              {arraySize}
            </span>
            <span className="text-xs font-medium text-zinc-400">
              {MAX_SIZE}
            </span>
          </div>

          {/* Custom styled range slider */}
          <div className="relative flex items-center" style={{ height: 20 }}>
            <div className="absolute w-full rounded-full h-1 bg-zinc-800" />
            <div
              className="absolute rounded-full h-1 bg-[#FF5757] transition-all duration-150"
              style={{
                width: `${((arraySize - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={arraySize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="absolute w-full cursor-pointer appearance-none bg-transparent h-5"
            />
          </div>
        </div>

        {/* Generate button */}
        <button
          id="bsv-generate"
          type="button"
          onClick={() => generate(arraySize)}
          className="w-full rounded-xl text-xs font-semibold py-2 bg-[#111113] hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700/60 text-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
        >
          ↻ Randomize
        </button>

        {/* Speed */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-zinc-400">
            Speed
          </p>
          <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {SPEEDS.map(({ label }, i) => (
              <button
                key={label}
                id={`bsv-speed-${i}`}
                type="button"
                onClick={() => setSpeedIdx(i)}
                className={`flex-1 md:w-full rounded-lg text-xs transition-all active:scale-[0.98] cursor-pointer text-center md:text-left px-3 py-1.5 whitespace-nowrap ${
                  speedIdx === i
                    ? "bg-[#FF5757]/15 text-[#FF5757] border border-[#FF5757]/40 font-semibold shadow-sm"
                    : "bg-[#111113] text-zinc-400 border border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700/60 font-medium"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT — CHART + CONTROLS ══ */}
      <div className="flex flex-col flex-1 min-w-0 justify-between md:h-full">
        {/* Status bar */}
        <div className="min-h-[44px] md:h-[48px] shrink-0 flex items-center justify-center px-4 md:px-6 py-2 border-b border-zinc-800/80 bg-[#0a0a0b]">
          <span
            className="text-xs md:text-[13px] font-semibold tracking-tight text-center leading-tight transition-colors duration-150"
            style={{
              color: finished
                ? "#10b981"
                : step.swapped
                  ? "#f87171"
                  : step.comparing
                    ? "#fbbf24"
                    : "#a1a1aa",
            }}
          >
            {step.description}
          </span>
        </div>

        {/* Bar chart container */}
        <div className="flex items-end justify-center px-2 sm:px-6 pt-5 pb-4 overflow-x-auto scrollbar-none flex-1 min-h-[180px] md:min-h-[220px]">
          <div
            className="relative flex items-end justify-center max-w-full"
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
                <div
                  key={val}
                  className="flex flex-col items-center justify-end"
                  style={{
                    width: barW,
                    height: CHART_H,
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="font-bold mb-1 tabular-nums transition-colors"
                    style={{
                      fontSize: barW < 24 ? 9 : 11,
                      color,
                      transitionDuration: `${transMs}ms`,
                    }}
                  >
                    {val}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: barH,
                      background: color,
                      borderRadius: "6px 6px 2px 2px",
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
        <div className="shrink-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 py-2 px-3 border-t border-b border-zinc-800/80 bg-[#111113]/60">
          {[
            { color: "#3f3f46", label: "Unsorted" },
            { color: "#fbbf24", label: "Comparing" },
            { color: "#f87171", label: "Swapping" },
            { color: "#10b981", label: "Sorted" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="rounded-full inline-block w-1.5 h-1.5 shrink-0"
                style={{ background: color }}
              />
              <span className="text-[11px] font-medium text-zinc-400 whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Play controls */}
        <div className="shrink-0 flex items-center gap-2.5 px-3 sm:px-6 py-2">
          <button
            id="bsv-play"
            type="button"
            onClick={() => (finished ? reset() : setPlaying((p) => !p))}
            className="flex items-center gap-1.5 rounded-lg text-white text-xs font-semibold tracking-wide cursor-pointer active:scale-[0.98] transition-all shrink-0 px-3.5 py-1.5 shadow-[0_2px_10px_rgba(255,87,87,0.25)]"
            style={{
              background: finished ? "#059669" : "#FF5757",
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
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer active:scale-[0.98] transition-all shrink-0 px-3.5 py-1.5 border border-zinc-800/80 text-zinc-300 hover:text-white bg-[#111113] hover:bg-zinc-800/80"
            >
              Reset
            </button>
          )}
        </div>

        {/* Step log container */}
        <div className="h-[135px] shrink-0 mx-3 sm:mx-6 mb-3 sm:mb-4 rounded-xl border border-zinc-800/80 bg-[#111113] overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-zinc-800/80 shrink-0 bg-[#0a0a0b]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Step log
            </span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin-grey">
            {log.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-1.5 ${
                  i === 0 ? "bg-white/[0.03]" : "bg-transparent"
                } ${i < log.length - 1 ? "border-b border-zinc-900" : ""}`}
              >
                <span
                  className={`rounded-full shrink-0 w-1.5 h-1.5 inline-block ${
                    i === 0 ? "bg-[#FF5757]" : "bg-zinc-800"
                  }`}
                />
                <span
                  className={`text-[11px] font-mono ${
                    i === 0 ? "text-zinc-200 font-semibold" : "text-zinc-500"
                  }`}
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
