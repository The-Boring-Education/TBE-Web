import { useCallback, useEffect, useRef, useState } from "react";

/* ──────────────────────────────────────────────────
   Types
────────────────────────────────────────────────── */
interface SortStep {
  array: number[];
  pivotIndex: number | null;
  comparing: number | null;
  iPointer: number | null;
  swapping: [number, number] | null;
  sortedIndices: number[];
  activeRange: [number, number] | null;
  description: string;
}

/* ──────────────────────────────────────────────────
   Step generator for Quick Sort
────────────────────────────────────────────────── */
function generateQuickSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sortedSet = new Set<number>();

  const snap = (
    pivotIndex: number | null,
    comparing: number | null,
    iPointer: number | null,
    swapping: [number, number] | null,
    activeRange: [number, number] | null,
    description: string,
  ) =>
    steps.push({
      array: [...arr],
      pivotIndex,
      comparing,
      iPointer,
      swapping,
      sortedIndices: Array.from(sortedSet),
      activeRange,
      description,
    });

  snap(null, null, null, null, null, "Ready — press Start");

  function partition(low: number, high: number): number {
    const pivot = arr[high]!;
    snap(
      high,
      null,
      low - 1,
      null,
      [low, high],
      `Subarray [${low}..${high}]: Chosen pivot ${pivot} at index ${high}`,
    );

    let i = low - 1;
    for (let j = low; j < high; j++) {
      snap(
        high,
        j,
        i >= low ? i : null,
        null,
        [low, high],
        `Comparing ${arr[j]} with pivot ${pivot}`,
      );

      if (arr[j]! < pivot) {
        i++;
        if (i !== j) {
          snap(
            high,
            j,
            i,
            [i, j],
            [low, high],
            `${arr[j]} < ${pivot}: Swapping index ${j} (${arr[j]}) with boundary index ${i} (${arr[i]})`,
          );
          const temp = arr[i]!;
          arr[i] = arr[j]!;
          arr[j] = temp;
        } else {
          snap(
            high,
            j,
            i,
            null,
            [low, high],
            `${arr[j]} < ${pivot}: Already at boundary index ${i}`,
          );
        }
      }
    }

    if (i + 1 !== high) {
      snap(
        high,
        null,
        i + 1,
        [i + 1, high],
        [low, high],
        `Placing pivot ${pivot} at its correct position index ${i + 1}`,
      );
      const temp = arr[i + 1]!;
      arr[i + 1] = arr[high]!;
      arr[high] = temp;
    }

    const pivotPos = i + 1;
    sortedSet.add(pivotPos);
    snap(
      null,
      null,
      null,
      null,
      [low, high],
      `Pivot ${pivot} is now fixed at index ${pivotPos}`,
    );
    return pivotPos;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sortedSet.add(low);
      snap(
        null,
        null,
        null,
        null,
        [low, high],
        `Single element ${arr[low]} at index ${low} is sorted`,
      );
    }
  }

  quickSort(0, arr.length - 1);
  for (let k = 0; k < arr.length; k++) sortedSet.add(k);
  snap(null, null, null, null, null, "✓ Array sorted!");

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

const CHART_H = 180;

function barColor(index: number, step: SortStep): string {
  if (step.sortedIndices.includes(index)) return "#10b981"; // Sorted: Green
  if (step.swapping?.includes(index)) return "#f87171"; // Swapping: Red
  if (step.pivotIndex === index) return "#a855f7"; // Pivot: Purple
  if (step.comparing === index) return "#fbbf24"; // Comparing: Yellow
  if (step.iPointer === index) return "#60a5fa"; // Boundary pointer: Blue
  if (
    step.activeRange &&
    index >= step.activeRange[0] &&
    index <= step.activeRange[1]
  ) {
    return "#4b5563"; // Active partition range: Lighter Gray
  }
  return "#1f2937"; // Inactive range: Dark Gray
}

const MIN_SIZE = 4;
const MAX_SIZE = 16;
const DEFAULT_SIZE = 7;

/* ──────────────────────────────────────────────────
   Component
────────────────────────────────────────────────── */
export default function QuickSortVisualizer() {
  const [arraySize, setArraySize] = useState(DEFAULT_SIZE);
  const [baseArray, setBaseArray] = useState<number[]>(() =>
    randomArray(DEFAULT_SIZE),
  );
  const [steps, setSteps] = useState<SortStep[]>(() =>
    generateQuickSortSteps(randomArray(DEFAULT_SIZE)),
  );
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[idx] || steps[0]!;
  const finished = idx === steps.length - 1;
  const n = step.array.length;
  const maxVal = Math.max(...step.array);

  const barW = Math.max(14, Math.min(44, Math.floor(260 / n)));
  const barGap = Math.max(2, Math.min(10, Math.floor(30 / n)));

  const advance = useCallback(() => {
    setIdx((prev) => {
      if (prev >= steps.length - 1) {
        setPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [steps.length]);

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
    setSteps(generateQuickSortSteps(baseArray));
    setIdx(0);
  }, [baseArray]);

  const generate = useCallback((size: number) => {
    setPlaying(false);
    const arr = randomArray(size);
    setBaseArray(arr);
    setSteps(generateQuickSortSteps(arr));
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
    <div className="w-full rounded-2xl overflow-hidden flex flex-col md:flex-row bg-[#09090b] border border-gray-800 shadow-xl min-h-[380px]">
      {/* ══ LEFT SIDEBAR / TOP CONTROLS ON MOBILE ══ */}
      <div className="flex flex-col gap-4 md:gap-5 p-4 md:p-5 shrink-0 w-full md:w-[190px] border-b md:border-b-0 md:border-r border-gray-800 bg-[#070709]">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2 text-gray-500">
            Array Size
          </p>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-gray-400">
              {MIN_SIZE}
            </span>
            <span className="text-lg md:text-xl font-black tabular-nums text-red-500">
              {arraySize}
            </span>
            <span className="text-[11px] font-mono text-gray-400">
              {MAX_SIZE}
            </span>
          </div>

          <div className="relative flex items-center" style={{ height: 20 }}>
            <div className="absolute w-full rounded-full h-1 bg-gray-800" />
            <div
              className="absolute rounded-full h-1 bg-red-500 transition-all duration-150"
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

        <button
          id="qsv-generate"
          type="button"
          onClick={() => generate(arraySize)}
          className="w-full rounded-lg text-xs font-bold py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 transition-all active:scale-95 cursor-pointer"
        >
          ↻ Randomize
        </button>

        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2 text-gray-500">
            Speed
          </p>
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {SPEEDS.map(({ label }, i) => (
              <button
                key={label}
                id={`qsv-speed-${i}`}
                type="button"
                onClick={() => setSpeedIdx(i)}
                className={`flex-1 md:w-full rounded-md text-[11px] font-bold transition-all active:scale-95 cursor-pointer text-center md:text-left px-2.5 py-1.5 whitespace-nowrap ${
                  speedIdx === i
                    ? "bg-gray-800 text-white border border-gray-700"
                    : "bg-transparent text-gray-500 border border-transparent hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block border-t border-gray-800" />

        <div className="flex flex-row md:flex-col justify-between md:justify-start gap-4 md:gap-2 border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
          <StatRow label="Steps" value={steps.length - 1} />
          <StatRow label="Step" value={`${idx} / ${steps.length - 1}`} />
        </div>
      </div>

      {/* ══ RIGHT — CHART + CONTROLS ══ */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-center px-4 md:px-6 py-2.5 min-h-[44px] border-b border-[#111113]">
          <span
            className="text-xs md:text-[13px] font-semibold tracking-wide text-center leading-tight transition-colors duration-150"
            style={{
              color: finished
                ? "#10b981"
                : step.pivotIndex !== null
                  ? "#a855f7"
                  : step.swapping
                    ? "#f87171"
                    : step.comparing !== null
                      ? "#fbbf24"
                      : "#6b7280",
            }}
          >
            {step.description}
          </span>
        </div>

        <div className="flex items-end justify-center px-2 sm:px-6 pt-5 pb-4 overflow-x-auto scrollbar-none flex-1 min-h-[200px]">
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
              const color = barColor(i, step);

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
                      borderRadius: "5px 5px 2px 2px",
                      transition: `background-color ${transMs}ms ease, height ${transMs}ms cubic-bezier(0.4,0,0.2,1)`,
                      boxShadow:
                        step.swapping?.includes(i) || step.pivotIndex === i
                          ? `0 0 12px ${color}80`
                          : "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2.5 px-3 border-t border-b border-gray-800/80">
          {[
            { color: "#4b5563", label: "Active Partition" },
            { color: "#a855f7", label: "Pivot" },
            { color: "#60a5fa", label: "Boundary Pointer" },
            { color: "#fbbf24", label: "Comparing" },
            { color: "#f87171", label: "Swapping" },
            { color: "#10b981", label: "Fixed / Sorted" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="rounded-sm inline-block w-2 h-2"
                style={{ background: color }}
              />
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
          <button
            id="qsv-play"
            type="button"
            onClick={() => (finished ? reset() : setPlaying((p) => !p))}
            className="flex items-center gap-2 rounded-lg text-white text-xs font-bold tracking-wide cursor-pointer active:scale-95 transition-all shadow-md"
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
              type="button"
              onClick={reset}
              className="rounded-lg text-xs font-bold cursor-pointer active:scale-95 transition-all px-3.5 py-2 border border-gray-700 text-gray-400 hover:text-white bg-transparent"
            >
              Reset
            </button>
          )}
        </div>

        <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 rounded-xl border border-gray-800 bg-[#050507] overflow-hidden flex-1">
          <div className="px-4 py-2 border-b border-[#111113]">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">
              Step log
            </span>
          </div>
          <div>
            {log.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-1.5 ${
                  i === 0 ? "bg-white/[0.02]" : "bg-transparent"
                } ${i < log.length - 1 ? "border-b border-[#0d0d0f]" : ""}`}
              >
                <span
                  className={`rounded-full shrink-0 w-1.5 h-1.5 inline-block ${
                    i === 0 ? "bg-red-500" : "bg-gray-800"
                  }`}
                />
                <span
                  className={`text-[11px] font-mono ${
                    i === 0 ? "text-gray-300 font-semibold" : "text-gray-600"
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

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-gray-500">{label}</span>
      <span className="text-[11px] font-mono font-bold text-gray-400">
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
